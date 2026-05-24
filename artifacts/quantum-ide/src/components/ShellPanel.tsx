import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface ShellLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
}

function getFileContent(files: any[], name: string): string | null {
  for (const f of files) {
    if (f.type === 'file' && f.name === name) return f.content || '';
    if (f.children) {
      const found = getFileContent(f.children, name);
      if (found !== null) return found;
    }
  }
  return null;
}

function listFiles(files: any[], indent = ''): string {
  return files.map(f => {
    const prefix = f.type === 'folder' ? '📁 ' : '📄 ';
    const children = f.type === 'folder' && f.children?.length
      ? '\n' + listFiles(f.children, indent + '  ')
      : '';
    return `${indent}${prefix}${f.name}${children}`;
  }).join('\n');
}

const SHELL_WELCOME = [
  { id: 'w1', type: 'info' as const, content: 'QuantumIDE Shell v1.0 — Puter destekli terminal' },
  { id: 'w2', type: 'info' as const, content: 'Komutlar: help, ls, cat <dosya>, echo <metin>, clear, pwd, date' },
];

export default function ShellPanel({ onClose }: { onClose?: () => void }) {
  const { activeProject, projects } = useApp();
  const [lines, setLines] = useState<ShellLine[]>(SHELL_WELCOME);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const cwd = activeProject ? `/${activeProject.name}` : '/';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = useCallback((type: ShellLine['type'], content: string) => {
    setLines(prev => [...prev, { id: `l-${Date.now()}-${Math.random()}`, type, content }]);
  }, []);

  const runCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLine('input', `${cwd} $ ${trimmed}`);
    setHistory(prev => [trimmed, ...prev.slice(0, 49)]);
    setHistoryIdx(-1);

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    setRunning(true);
    await new Promise(r => setTimeout(r, 100));

    try {
      const puter = (window as any).puter;

      if (command === 'clear' || command === 'cls') {
        setLines([]);
        setRunning(false);
        return;
      }

      if (command === 'help') {
        addLine('output', 'Kullanılabilir komutlar:');
        addLine('output', '  help          — Bu yardım mesajını göster');
        addLine('output', '  ls            — Proje dosyalarını listele');
        addLine('output', '  cat <dosya>   — Dosya içeriğini göster');
        addLine('output', '  echo <metin>  — Metin yazdır');
        addLine('output', '  pwd           — Geçerli dizini göster');
        addLine('output', '  date          — Tarih ve saati göster');
        addLine('output', '  clear         — Terminali temizle');
        addLine('output', '  env           — Ortam bilgilerini göster');
        setRunning(false);
        return;
      }

      if (command === 'pwd') {
        addLine('output', cwd);
        setRunning(false);
        return;
      }

      if (command === 'date') {
        addLine('output', new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }));
        setRunning(false);
        return;
      }

      if (command === 'echo') {
        addLine('output', args.join(' '));
        setRunning(false);
        return;
      }

      if (command === 'env') {
        addLine('output', `SHELL=QuantumIDE/1.0`);
        addLine('output', `PROJECT=${activeProject?.name || 'none'}`);
        addLine('output', `PUTER=${puter ? 'connected' : 'not connected'}`);
        addLine('output', `LANG=tr_TR.UTF-8`);
        setRunning(false);
        return;
      }

      if (command === 'ls' || command === 'dir') {
        const target = activeProject || projects[0];
        if (!target) {
          addLine('output', 'Açık proje yok. Önce bir proje seçin.');
        } else {
          addLine('output', `${target.name}/:`);
          if (target.files.length === 0) {
            addLine('output', '  (boş)');
          } else {
            addLine('output', listFiles(target.files, '  '));
          }
        }
        setRunning(false);
        return;
      }

      if (command === 'cat') {
        const filename = args[0];
        if (!filename) {
          addLine('error', 'Kullanım: cat <dosya-adı>');
          setRunning(false);
          return;
        }
        const target = activeProject || projects[0];
        if (!target) {
          addLine('error', 'Açık proje yok.');
          setRunning(false);
          return;
        }
        const content = getFileContent(target.files, filename);
        if (content === null) {
          addLine('error', `cat: ${filename}: Dosya bulunamadı`);
        } else if (content === '') {
          addLine('output', '(boş dosya)');
        } else {
          const maxLines = 50;
          const fileLines = content.split('\n');
          if (fileLines.length > maxLines) {
            fileLines.slice(0, maxLines).forEach(l => addLine('output', l));
            addLine('info', `... (${fileLines.length - maxLines} satır daha)`);
          } else {
            fileLines.forEach(l => addLine('output', l));
          }
        }
        setRunning(false);
        return;
      }

      if (command === 'node' || command === 'python' || command === 'python3') {
        addLine('info', `${command} çalıştırma tarayıcı ortamında desteklenmez.`);
        addLine('info', 'Puter AI aracılığıyla kod analizi için AI panelini kullanın.');
        setRunning(false);
        return;
      }

      if (puter?.shell?.exec) {
        try {
          const result = await puter.shell.exec(trimmed);
          if (result?.stdout) addLine('output', result.stdout);
          if (result?.stderr) addLine('error', result.stderr);
        } catch (e: any) {
          addLine('error', `Komut çalıştırılamadı: ${e?.message || String(e)}`);
        }
      } else {
        addLine('error', `${command}: komut bulunamadı`);
        addLine('info', `İpucu: Desteklenen komutlar için "help" yazın.`);
      }
    } catch (e: any) {
      addLine('error', `Hata: ${e?.message || String(e)}`);
    }

    setRunning(false);
  }, [cwd, activeProject, projects, addLine]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input;
      setInput('');
      runCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      setInput(history[next] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setInput(next === -1 ? '' : history[next] || '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['help', 'ls', 'cat', 'echo', 'pwd', 'date', 'clear', 'env'];
      const match = commands.find(c => c.startsWith(input));
      if (match) setInput(match);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0c14] font-mono text-xs" onClick={() => inputRef.current?.focus()}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-black/30 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-accent" />
          <span className="text-xs text-muted-foreground font-mono">
            Shell — {activeProject?.name || 'proje seçilmedi'}
          </span>
          {running && <Loader2 size={10} className="animate-spin text-primary" />}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLines(SHELL_WELCOME)}
            className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            title="Temizle"
          >
            <Trash2 size={11} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              title="Kapat"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <AnimatePresence initial={false}>
          {lines.map(line => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              className={`leading-relaxed whitespace-pre-wrap break-all ${
                line.type === 'input'
                  ? 'text-primary font-semibold'
                  : line.type === 'error'
                  ? 'text-destructive'
                  : line.type === 'info'
                  ? 'text-muted-foreground italic'
                  : 'text-green-300'
              }`}
            >
              {line.content}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-white/10 bg-black/20 shrink-0">
        <span className="text-primary shrink-0 font-semibold">{cwd} $</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={running}
          placeholder="komut yazın..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 text-xs font-mono"
        />
        {running && <Loader2 size={12} className="animate-spin text-primary shrink-0" />}
      </div>
    </div>
  );
}
