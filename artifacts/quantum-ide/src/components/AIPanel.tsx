import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Wand2, Loader2, ChevronDown,
  Code2, Bug, Zap, Sparkles, Trash2, Settings,
  Check, FilePen, FilePlus, FileMinus, AlertCircle, Key, ChevronRight,
  MessageSquarePlus, MessageSquare, X, Edit3
} from "lucide-react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { callPuterAI, ALL_MODELS, getModelById, parseFilesFromAIResponse, getProviderForModel } from "@/lib/ai";
import type { ChatMessage } from "@/types";
import VibeCodingModal from "./VibeCodingModal";

interface FileStep {
  filename: string;
  status: 'pending' | 'working' | 'done' | 'error';
  action: 'create' | 'edit' | 'delete';
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
              {step.action === 'create'
                ? (step.status === 'done' ? 'Oluşturuldu' : step.status === 'working' ? 'Oluşturuluyor...' : step.status === 'error' ? 'Hata' : 'Bekliyor')
                : step.action === 'delete'
                ? (step.status === 'done' ? 'Silindi' : step.status === 'working' ? 'Siliniyor...' : step.status === 'error' ? 'Hata' : 'Bekliyor')
                : (step.status === 'done' ? 'Güncellendi' : step.status === 'working' ? 'Düzenleniyor...' : step.status === 'error' ? 'Hata' : 'Bekliyor')
              }
            </span>
            {step.action === 'create'
              ? <FilePlus size={11} className="text-accent shrink-0" />
              : step.action === 'delete'
              ? <FileMinus size={11} className="text-destructive shrink-0" />
              : <FilePen size={11} className="text-muted-foreground shrink-0" />
            }
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
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

const PROVIDER_COLORS: Record<string, string> = {
  openai: 'text-green-400', anthropic: 'text-orange-400',
  google: 'text-blue-400', mistral: 'text-purple-400',
  deepseek: 'text-cyan-400', meta: 'text-pink-400', perplexity: 'text-yellow-400',
  vercel: 'text-foreground',
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google',
  mistral: 'Mistral', deepseek: 'DeepSeek', meta: 'Meta', perplexity: 'Perplexity',
  vercel: 'Vercel',
};

export default function AIPanel() {
  const {
    settings, updateSettings, messages, addMessage, clearMessages,
    activeTab, projects, activeProject, createFile, updateFileContent, openFile,
    conversations, activeConversationId, setActiveConversationId,
    createConversation, deleteConversation, renameConversation,
  } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [showConvDropdown, setShowConvDropdown] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [showVibeCoding, setShowVibeCoding] = useState(false);
  const [fileSteps, setFileSteps] = useState<FileStep[]>([]);
  const [renamingConvId, setRenamingConvId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, fileSteps]);

  // ── Model display info ────────────────────────────────────────────────────
  const activeModelInfo = ALL_MODELS.find(m => m.id === settings.ai.activeModel || m.puterModel === settings.ai.activeModel);
  const activeModelFallback = getModelById(settings.ai.activeModel);
  const displayName = activeModelInfo?.label || activeModelFallback.label;
  const displayProvider = activeModelInfo?.provider || activeModelFallback.provider.toLowerCase();
  const displayColor = PROVIDER_COLORS[displayProvider] || 'text-primary';

  // ── Key selection logic ───────────────────────────────────────────────────
  // 'vercel' is included so Vercel API keys are recognized
  const aiProviders = ['openai', 'anthropic', 'google', 'mistral', 'deepseek', 'perplexity', 'vercel'];
  const matchingKeys = settings.apiKeys.filter(k => aiProviders.includes(k.provider));
  const modelProvider = getProviderForModel(settings.ai.activeModel);

  const activeKeyEntry = settings.activeKeyId
    ? matchingKeys.find(k => k.id === settings.activeKeyId) || null
    : matchingKeys.find(k => k.provider === modelProvider) || null;

  const isPuterConnected = settings.ai.puterConnected;
  const hasMatchingKey = !!activeKeyEntry;

  const getActiveSourceLabel = () => {
    if (hasMatchingKey && activeKeyEntry) {
      const label = activeKeyEntry.label || PROVIDER_LABELS[activeKeyEntry.provider] || activeKeyEntry.provider;
      const masked = activeKeyEntry.key.slice(0, 8) + '...';
      return `${label} (${masked})`;
    }
    if (isPuterConnected) return 'Puter (ücretsiz)';
    return 'Demo modu';
  };

  const getActiveSourceColor = () => {
    if (hasMatchingKey) return 'text-accent';
    if (isPuterConnected) return 'text-primary';
    return 'text-muted-foreground';
  };

  // ── Active file content ───────────────────────────────────────────────────
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

  // ── File step animation ───────────────────────────────────────────────────
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

    const steps: FileStep[] = parsed.map(pf => ({
      filename: pf.filename,
      status: 'pending',
      action: existingFiles.find(f => f.name === pf.filename) ? 'edit' : 'create',
    }));
    setFileSteps(steps);

    for (let i = 0; i < parsed.length; i++) {
      const pf = parsed[i];
      setFileSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'working' } : s));
      await new Promise(r => setTimeout(r, 500 + i * 150));

      try {
        const existing = existingFiles.find(f => f.name === pf.filename);
        if (existing) {
          updateFileContent(existing.id, target.id, pf.content);
          openFile(existing, target);
        } else {
          createFile(target.id, null, pf.filename, 'file');
          await new Promise(r => setTimeout(r, 200));
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
    setTimeout(() => setFileSteps([]), 4000);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isTyping) return;
    setInput('');

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: msgText, timestamp: Date.now() };
    addMessage(userMsg);
    setIsTyping(true);
    setFileSteps([]);

    const conversationHistory = [
      { role: 'system', content: settings.systemPrompt },
      ...messages.filter(m => !m.isTyping).slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: msgText }
    ];

    try {
      const response = await callPuterAI(
        settings.ai.activeModel,
        conversationHistory,
        matchingKeys,
        settings.activeKeyId,
      );
      const parsed = parseFilesFromAIResponse(response);
      const displayContent = parsed.length > 0
        ? response.replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim()
        : response;

      addMessage({
        id: `a-${Date.now()}`, role: 'assistant',
        content: displayContent || (parsed.length > 0 ? `${parsed.length} dosya düzenlendi.` : 'Tamam.'),
        timestamp: Date.now()
      });

      if (parsed.length > 0) await applyFilesStepByStep(parsed);
    } catch {
      addMessage({ id: `e-${Date.now()}`, role: 'assistant', content: 'Bir hata oluştu. Lütfen tekrar deneyin.', timestamp: Date.now() });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const filteredModels = ALL_MODELS.filter(m =>
    m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.label.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.provider.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const activeConv = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border shrink-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
            <Bot size={14} className="text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground">AI Asistan</span>
          <div className="flex-1" />
          <button
            onClick={() => { createConversation(); }}
            className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            title="Yeni Sohbet"
          >
            <MessageSquarePlus size={12} />
          </button>
          <button onClick={() => setLocation('/settings')} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors" title="Ayarlar">
            <Settings size={12} />
          </button>
          <button onClick={clearMessages} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors" title="Sohbeti Temizle">
            <Trash2 size={12} />
          </button>
        </div>

        {/* Conversation Selector */}
        <div className="relative">
          <button
            onClick={() => { setShowConvDropdown(o => !o); setShowModelDropdown(false); setShowKeyDropdown(false); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 bg-muted/50 rounded-lg text-xs hover:bg-muted/80 transition-colors border border-border/60"
          >
            <MessageSquare size={10} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-left truncate text-muted-foreground">
              {activeConv?.title || 'Sohbet seçin'}
            </span>
            <span className="text-muted-foreground/60 text-xs shrink-0">{conversations.length} sohbet</span>
            <ChevronDown size={10} className="text-muted-foreground shrink-0" />
          </button>

          <AnimatePresence>
            {showConvDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowConvDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-popover border border-popover-border rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-1.5 border-b border-border">
                    <button
                      onClick={() => { createConversation(); setShowConvDropdown(false); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                    >
                      <MessageSquarePlus size={11} /> Yeni Sohbet Başlat
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1">
                    {conversations.map(conv => (
                      <div key={conv.id} className="group flex items-center gap-1 px-2 hover:bg-white/5 transition-colors">
                        {renamingConvId === conv.id ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && renameValue.trim()) {
                                renameConversation(conv.id, renameValue.trim());
                                setRenamingConvId(null);
                              }
                              if (e.key === 'Escape') setRenamingConvId(null);
                            }}
                            className="flex-1 py-1 text-xs bg-muted border border-primary rounded outline-none text-foreground px-1"
                          />
                        ) : (
                          <button
                            onClick={() => { setActiveConversationId(conv.id); setShowConvDropdown(false); }}
                            className={`flex-1 flex items-center gap-2 py-1.5 text-xs text-left transition-colors ${conv.id === activeConversationId ? 'text-primary' : 'text-foreground'}`}
                          >
                            <MessageSquare size={10} className={conv.id === activeConversationId ? 'text-primary' : 'text-muted-foreground'} />
                            <span className="truncate flex-1">{conv.title}</span>
                            <span className="text-muted-foreground/60 shrink-0">{conv.messages.length}</span>
                          </button>
                        )}
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => { setRenamingConvId(conv.id); setRenameValue(conv.title); }}
                            className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 size={9} />
                          </button>
                          {conversations.length > 1 && (
                            <button
                              onClick={() => deleteConversation(conv.id)}
                              className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                            >
                              <X size={9} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => { setShowModelDropdown(o => !o); setModelSearch(''); setShowKeyDropdown(false); setShowConvDropdown(false); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 bg-muted rounded-lg text-xs hover:bg-muted/80 transition-colors border border-border"
          >
            <Sparkles size={11} className={displayColor} />
            <span className={`flex-1 text-left ${displayColor} truncate font-mono`}>{settings.ai.activeModel}</span>
            <span className="text-muted-foreground text-xs shrink-0 capitalize">{displayProvider}</span>
            <ChevronDown size={11} className="text-muted-foreground shrink-0" />
          </button>

          <AnimatePresence>
            {showModelDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-popover border border-popover-border rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-2 border-b border-border">
                    <input
                      autoFocus
                      value={modelSearch}
                      onChange={e => setModelSearch(e.target.value)}
                      placeholder="Model ara... (openai/gpt-4o)"
                      className="w-full px-2 py-1.5 bg-muted rounded text-xs text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto py-1">
                    {filteredModels.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { updateSettings({ ...settings, ai: { ...settings.ai, activeModel: opt.id }, activeKeyId: null }); setShowModelDropdown(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors ${opt.id === settings.ai.activeModel ? 'bg-primary/10' : ''}`}
                      >
                        <Sparkles size={11} className={PROVIDER_COLORS[opt.provider] || 'text-primary'} />
                        <span className="flex-1 text-left text-foreground truncate font-mono">{opt.id}</span>
                        <span className="text-muted-foreground shrink-0">{opt.context}</span>
                        {opt.id === settings.ai.activeModel && <Check size={11} className="text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Key Selector */}
        <div className="relative">
          <button
            onClick={() => { setShowKeyDropdown(o => !o); setShowModelDropdown(false); setShowConvDropdown(false); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 bg-muted/50 rounded-lg text-xs hover:bg-muted/80 transition-colors border border-border/60"
          >
            <Key size={10} className={getActiveSourceColor()} />
            <span className={`flex-1 text-left truncate ${getActiveSourceColor()}`}>
              {getActiveSourceLabel()}
            </span>
            <ChevronDown size={10} className="text-muted-foreground shrink-0" />
          </button>

          <AnimatePresence>
            {showKeyDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowKeyDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-popover border border-popover-border rounded-lg shadow-xl z-50 overflow-hidden py-1"
                >
                  {/* Puter option */}
                  {isPuterConnected && (
                    <button
                      onClick={() => { updateSettings({ ...settings, activeKeyId: null }); setShowKeyDropdown(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors ${!settings.activeKeyId ? 'bg-primary/10' : ''}`}
                    >
                      <Zap size={11} className="text-primary shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="text-foreground font-medium">Puter</div>
                        <div className="text-muted-foreground text-xs">Ücretsiz — Otomatik model eşleme</div>
                      </div>
                      {!settings.activeKeyId && <Check size={11} className="text-primary shrink-0" />}
                    </button>
                  )}

                  {/* API keys */}
                  {matchingKeys.length > 0 && (
                    <>
                      {isPuterConnected && <div className="border-t border-border my-1" />}
                      <div className="px-3 py-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">API Anahtarları</span>
                      </div>
                      {matchingKeys.map(key => {
                        const isSelected = settings.activeKeyId === key.id ||
                          (!settings.activeKeyId && key.provider === modelProvider && !isPuterConnected);
                        const providerColor = PROVIDER_COLORS[key.provider] || 'text-muted-foreground';
                        return (
                          <button
                            key={key.id}
                            onClick={() => { updateSettings({ ...settings, activeKeyId: key.id }); setShowKeyDropdown(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors ${isSelected ? 'bg-accent/10' : ''}`}
                          >
                            <Key size={11} className={`${providerColor} shrink-0`} />
                            <div className="flex-1 text-left min-w-0">
                              <div className={`font-medium truncate ${providerColor}`}>
                                {key.label || PROVIDER_LABELS[key.provider] || key.provider}
                              </div>
                              <div className="text-muted-foreground font-mono truncate">{key.key.slice(0, 12)}...</div>
                            </div>
                            {isSelected && <Check size={11} className="text-accent shrink-0" />}
                          </button>
                        );
                      })}
                    </>
                  )}

                  {/* No keys, no puter */}
                  {matchingKeys.length === 0 && !isPuterConnected && (
                    <div className="px-3 py-3 text-center">
                      <p className="text-xs text-muted-foreground mb-2">Henüz AI anahtarı yok.</p>
                      <button
                        onClick={() => { setShowKeyDropdown(false); setLocation('/settings'); }}
                        className="flex items-center gap-1 text-xs text-primary hover:underline mx-auto"
                      >
                        Ayarlar'da ekle <ChevronRight size={11} />
                      </button>
                    </div>
                  )}

                  {matchingKeys.length === 0 && !isPuterConnected && (
                    <div className="px-3 py-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground">Demo modu aktif</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Status bar */}
        {!isPuterConnected && matchingKeys.length === 0 ? (
          <button
            onClick={() => setLocation('/settings')}
            className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-colors"
          >
            <Code2 size={10} /><span>API anahtarı ekle veya Puter bağla</span>
          </button>
        ) : (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${hasMatchingKey ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
            <Zap size={10} />
            <span className="truncate">
              {hasMatchingKey
                ? `${PROVIDER_LABELS[activeKeyEntry!.provider] || activeKeyEntry!.provider} API ile çalışıyor`
                : 'Puter — sınırsız kullanım aktif'}
            </span>
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

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
              <Bot size={12} className="text-accent" />
            </div>
            <div className="px-3 py-2 bg-muted rounded-xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <Loader2 size={12} className="animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">{displayName} düşünüyor...</span>
              </div>
            </div>
          </motion.div>
        )}

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
