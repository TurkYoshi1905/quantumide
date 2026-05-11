import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Wand2, Loader2, ChevronDown,
  Code2, Bug, Zap, Sparkles, Trash2, Settings,
  Check, FileEdit, FilePlus2, AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { callPuterAI, PUTER_MODELS, getModelById, parseFilesFromAIResponse, AI_SYSTEM_PROMPT } from "@/lib/ai";
import type { ChatMessage } from "@/types";
import VibeCodingModal from "./VibeCodingModal";

// ── Step-by-step file operation display ──────────────────────────────────
interface FileStep {
  filename: string;
  status: 'pending' | 'working' | 'done' | 'error';
  isNew: boolean;
}

function FileStepsCard({ steps }: { steps: FileStep[] }) {
  return (
    <div className="my-2 rounded-xl border border-accent/30 bg-accent/5 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-accent/20 bg-accent/10">
        <Sparkles size={11} className="text-accent" />
        <span className="text-xs font-semibold text-accent">Dosyalar düzenleniyor</span>
      </div>
      <div className="p-2 space-y-1">
        {steps.map((step, i) => (
          <motion.div
            key={step.filename}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-black/20"
          >
            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
              {step.status === 'pending' && <div className="w-3 h-3 rounded-full border border-muted-foreground/40" />}
              {step.status === 'working' && <Loader2 size={12} className="animate-spin text-primary" />}
              {step.status === 'done' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                  <Check size={12} className="text-accent" />
                </motion.div>
              )}
              {step.status === 'error' && <AlertCircle size={12} className="text-destructive" />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-mono text-foreground truncate block">{step.filename}</span>
            </div>
            <span className={`text-xs shrink-0 ${
              step.status === 'done' ? 'text-accent' :
              step.status === 'working' ? 'text-primary' :
              step.status === 'error' ? 'text-destructive' :
              'text-muted-foreground'
            }`}>
              {step.isNew
                ? (step.status === 'done' ? 'Oluşturuldu' : step.status === 'working' ? 'Oluşturuluyor...' : step.status === 'error' ? 'Hata' : 'Bekliyor')
                : (step.status === 'done' ? 'Güncellendi' : step.status === 'working' ? 'Düzenleniyor...' : step.status === 'error' ? 'Hata' : 'Bekliyor')
              }
            </span>
            {step.isNew
              ? <FilePlus2 size={11} className="text-muted-foreground shrink-0" />
              : <FileEdit size={11} className="text-muted-foreground shrink-0" />
            }
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Text message display (no raw code blocks) ─────────────────────────────
function MessageContent({ content }: { content: string }) {
  // Strip code blocks — they are applied to files, don't show raw code
  const withoutCode = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!withoutCode) return null;

  return (
    <div className="text-xs leading-relaxed whitespace-pre-wrap">
      {withoutCode.split(/(\*\*.*?\*\*)/g).map((s, i) =>
        s.startsWith('**') && s.endsWith('**')
          ? <strong key={i} className="text-foreground font-semibold">{s.slice(2, -2)}</strong>
          : s
      )}
    </div>
  );
}

// ── Main AIPanel ──────────────────────────────────────────────────────────
export default function AIPanel() {
  const {
    settings, updateSettings, messages, addMessage, clearMessages,
    activeTab, projects, activeProject, createFile, updateFileContent, openFile,
  } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showVibeCoding, setShowVibeCoding] = useState(false);
  const [fileSteps, setFileSteps] = useState<FileStep[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, fileSteps]);

  const activeModel = getModelById(settings.ai.activeModel);

  const getActiveFileContent = () => {
    if (!activeTab) return '';
    const project = projects.find(p => p.id === activeTab.projectId);
    if (!project) return '';
    const search = (files: typeof project.files): string => {
      for (const f of files) {
        if (f.id === activeTab.fileId) return f.content || '';
        if (f.children) { const found = search(f.children); if (found) return found; }
      }
      return '';
    };
    return search(project.files);
  };

  // Apply parsed files one-by-one with step animation
  const applyFilesStepByStep = async (parsed: ReturnType<typeof parseFilesFromAIResponse>) => {
    if (!parsed.length) return;

    const target = activeProject || projects[0];
    if (!target) return;

    const getAllFiles = (files: typeof target.files): typeof target.files => {
      const result: typeof target.files = [];
      for (const f of files) {
        if (f.type === 'file') result.push(f);
        if (f.children) result.push(...getAllFiles(f.children));
      }
      return result;
    };
    const existingFiles = getAllFiles(target.files);

    // Initialize all steps as pending
    const steps: FileStep[] = parsed.map(pf => ({
      filename: pf.filename,
      status: 'pending',
      isNew: !existingFiles.find(f => f.name === pf.filename),
    }));
    setFileSteps(steps);

    for (let i = 0; i < parsed.length; i++) {
      const pf = parsed[i];
      // Mark current step as working
      setFileSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'working' } : s));
      await new Promise(r => setTimeout(r, 500 + i * 150));

      try {
        const existing = existingFiles.find(f => f.name === pf.filename);
        if (existing) {
          updateFileContent(existing.id, target.id, pf.content);
          openFile(existing, target);
        } else {
          createFile(target.id, null, pf.filename, 'file');
          // Small delay so the file is created in state, then open it
          await new Promise(r => setTimeout(r, 200));
          // Try to find and open it after creation
          const updatedProject = projects.find(p => p.id === target.id);
          if (updatedProject) {
            const newFile = getAllFiles(updatedProject.files).find(f => f.name === pf.filename);
            if (newFile) openFile(newFile, updatedProject);
          }
        }
        setFileSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
      } catch {
        setFileSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'error' } : s));
      }
    }

    // Clear steps after 4 seconds
    setTimeout(() => setFileSteps([]), 4000);
  };

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isTyping) return;
    setInput('');

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: msgText, timestamp: Date.now() };
    addMessage(userMsg);
    setIsTyping(true);
    setFileSteps([]);

    const conversationHistory = [
      { role: 'system', content: AI_SYSTEM_PROMPT },
      ...messages.filter(m => !m.isTyping).slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: msgText }
    ];

    try {
      const response = await callPuterAI(settings.ai.activeModel, conversationHistory);

      // Parse files before adding to messages (to strip code from display)
      const parsed = parseFilesFromAIResponse(response);

      // Build display text (remove code blocks if files were parsed)
      const displayContent = parsed.length > 0
        ? response.replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim()
        : response;

      addMessage({
        id: `a-${Date.now()}`, role: 'assistant',
        content: displayContent || (parsed.length > 0 ? `${parsed.length} dosya düzenlendi.` : 'Tamam.'),
        timestamp: Date.now()
      });

      if (parsed.length > 0) {
        await applyFilesStepByStep(parsed);
      }
    } catch {
      addMessage({ id: `e-${Date.now()}`, role: 'assistant', content: 'Bir hata oluştu. Lütfen tekrar deneyin.', timestamp: Date.now() });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
            <Bot size={14} className="text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground">AI Asistan</span>
          <div className="flex-1" />
          <button onClick={() => setLocation('/settings')} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors" title="Ayarlar"><Settings size={12} /></button>
          <button onClick={clearMessages} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors" title="Temizle"><Trash2 size={12} /></button>
        </div>

        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(o => !o)}
            className="w-full flex items-center gap-2 px-2 py-1.5 bg-muted rounded-lg text-xs hover:bg-muted/80 transition-colors border border-border"
          >
            <Sparkles size={11} className={activeModel.color} />
            <span className={`flex-1 text-left ${activeModel.color} truncate`}>{activeModel.label}</span>
            <span className="text-muted-foreground text-xs shrink-0">{activeModel.provider}</span>
            <ChevronDown size={11} className="text-muted-foreground shrink-0" />
          </button>

          <AnimatePresence>
            {showModelDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-popover border border-popover-border rounded-lg shadow-xl z-50 overflow-hidden py-1 max-h-64 overflow-y-auto"
                >
                  {PUTER_MODELS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { updateSettings({ ...settings, ai: { ...settings.ai, activeModel: opt.id } }); setShowModelDropdown(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors ${opt.id === settings.ai.activeModel ? 'bg-primary/10' : ''}`}
                    >
                      <Sparkles size={11} className={opt.color} />
                      <span className={`${opt.color} flex-1 text-left truncate`}>{opt.label}</span>
                      <span className="text-muted-foreground">{opt.provider}</span>
                      {opt.id === settings.ai.activeModel && <span className="ml-1 text-primary shrink-0">Aktif</span>}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Puter status */}
        {!settings.ai.puterConnected ? (
          <button onClick={() => setLocation('/settings')} className="mt-1.5 w-full flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-colors">
            <Code2 size={10} /><span>Puter bağla — sınırsız AI kullan</span>
          </button>
        ) : (
          <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/10 text-xs text-accent">
            <Zap size={10} /><span>Puter bağlı — sınırsız kullanım aktif</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-1 px-3 py-2 border-b border-border shrink-0 flex-wrap">
        <button onClick={() => {
          const c = getActiveFileContent();
          sendMessage(c ? `Bu dosyayı analiz et ve geliştirme önerileri ver:\n\`\`\`\n${c.slice(0, 800)}\n\`\`\`` : 'Analiz için sol panelden bir dosya seçin.');
        }} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <Code2 size={10} /> Analiz
        </button>
        <button onClick={() => {
          const c = getActiveFileContent();
          sendMessage(c ? `Bu kodda hataları bul ve düzeltilmiş halini yaz:\n\`\`\`\n${c.slice(0, 800)}\n\`\`\`` : 'Hata düzeltme için bir dosya seçin.');
        }} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
          <Bug size={10} /> Düzelt
        </button>
        <button onClick={() => {
          const c = getActiveFileContent();
          sendMessage(c ? `Bu kodu refactor et:\n\`\`\`\n${c.slice(0, 800)}\n\`\`\`` : 'Refactor için bir dosya seçin.');
        }} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
          <Zap size={10} /> Refactor
        </button>
        <button onClick={() => setShowVibeCoding(true)} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-foreground hover:from-primary/30 hover:to-accent/30 border border-primary/20 transition-colors">
          <Wand2 size={10} className="text-primary" /> VibeCoding
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-primary/30' : 'bg-accent/20'}`}>
                {msg.role === 'user' ? <User size={12} className="text-primary" /> : <Bot size={12} className="text-accent" />}
              </div>
              <div className={`max-w-[86%] px-3 py-2 rounded-xl ${msg.role === 'user' ? 'bg-primary/20 text-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                <MessageContent content={msg.content} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI thinking indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
              <Bot size={12} className="text-accent" />
            </div>
            <div className="px-3 py-2 bg-muted rounded-xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <Loader2 size={12} className="animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">{activeModel.label} düşünüyor...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* File operation steps */}
        {fileSteps.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pl-8">
            <FileStepsCard steps={fileSteps} />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Uygulama oluştur, kod düzelt... (Enter)"
            rows={1}
            className="flex-1 px-3 py-2 bg-muted border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none transition-all"
            style={{ minHeight: '36px', maxHeight: '120px' }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {isTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          AI kod yazar ve dosyaları otomatik düzenler
        </p>
      </div>

      <VibeCodingModal open={showVibeCoding} onClose={() => setShowVibeCoding(false)} onSend={sendMessage} />
    </div>
  );
}
