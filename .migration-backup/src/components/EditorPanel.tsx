import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Save, Eye, Code, X, ChevronRight, Globe, FileCode, Search, FileText } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { getFileLanguage } from "@/lib/ai";
import type { FileNode, Project } from "@/types";

function getAllFiles(files: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const f of files) {
    if (f.type === 'file') result.push(f);
    if (f.children) result.push(...getAllFiles(f.children));
  }
  return result;
}

function findFileByName(files: FileNode[], name: string): FileNode | null {
  for (const f of files) {
    if (f.type === 'file' && f.name === name) return f;
    if (f.children) { const found = findFileByName(f.children, name); if (found) return found; }
  }
  return null;
}

function buildProjectPreview(project: Project, activeFile: FileNode | null): string {
  const allFiles = getAllFiles(project.files);
  const fileMap = new Map(allFiles.map(f => [f.name, f.content || '']));

  let htmlFile = findFileByName(project.files, 'index.html');
  if (!htmlFile && activeFile?.name.endsWith('.html')) htmlFile = activeFile;
  if (!htmlFile) {
    if (!activeFile) return '<html><body style="background:#0a0e1a;color:#e2e8f0;font-family:sans-serif;padding:2rem"><p>Önizleme için bir dosya seçin.</p></body></html>';
    const ext = activeFile.name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'css') {
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{background:#0a0e1a;color:#e2e8f0;font-family:sans-serif;padding:2rem}h2{color:#7c3aed;margin-bottom:1rem;font-size:1rem}.preview-note{color:#64748b;font-size:0.75rem;margin-bottom:1.5rem}</style><style>${activeFile.content || ''}</style></head><body><h2>${activeFile.name}</h2><p class="preview-note">CSS dosyası önizlemesi</p><div class="card" style="max-width:300px"><h1>Örnek Başlık</h1><p>Örnek paragraf metni</p><button>Örnek Buton</button></div></body></html>`;
    }
    if (ext === 'js' || ext === 'ts') {
      const safeCode = (activeFile.content || '').replace(/<\/script>/g, '<\\/script>');
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{background:#0a0e1a;color:#e2e8f0;font-family:monospace;padding:1rem}#console-out{background:#111;border:1px solid #333;border-radius:8px;padding:1rem;min-height:100px;font-size:0.8rem;line-height:1.6}.log-line{color:#10b981}.err-line{color:#f87171}.warn-line{color:#fbbf24}h2{color:#7c3aed;font-size:0.875rem;margin-bottom:0.5rem}</style></head><body><h2>Konsol — ${activeFile.name}</h2><div id="console-out"></div><script>const _out=document.getElementById('console-out');const _log=(cls,...args)=>{const d=document.createElement('div');d.className=cls;d.textContent=args.map(a=>typeof a==='object'?JSON.stringify(a):String(a)).join(' ');_out.appendChild(d);};console.log=(...a)=>{_log('log-line',...a);};console.error=(...a)=>{_log('err-line',...a);};console.warn=(...a)=>{_log('warn-line',...a);};try{${safeCode}}catch(e){console.error('Hata:',e.message);}<\/script></body></html>`;
    }
    const escaped = (activeFile.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{background:#0a0e1a;color:#e2e8f0;font-family:monospace;padding:1rem;font-size:0.8rem}pre{white-space:pre-wrap;word-break:break-word;line-height:1.6}h2{color:#7c3aed;font-size:0.875rem;margin-bottom:0.5rem}</style></head><body><h2>${activeFile.name}</h2><pre>${escaped}</pre></body></html>`;
  }

  let html = htmlFile.content || '';
  html = html.replace(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    const filename = href.split('/').pop() || '';
    const content = fileMap.get(filename);
    return content !== undefined ? `<style>/* ${filename} */\n${content}\n</style>` : match;
  });
  html = html.replace(/<script([^>]+)src=["']([^"']+)["']([^>]*)><\/script>/gi, (match, pre, src, post) => {
    const filename = src.split('/').pop() || '';
    const content = fileMap.get(filename);
    return content !== undefined ? `<script${pre}${post}>\n/* ${filename} */\n${content}\n</script>` : match;
  });
  if (activeFile && activeFile.name !== 'index.html') {
    const ext = activeFile.name.split('.').pop()?.toLowerCase() || '';
    const alreadyInlined = html.includes(`/* ${activeFile.name} */`);
    if (!alreadyInlined) {
      if (ext === 'css') html = html.replace('</head>', `<style>/* ${activeFile.name} */\n${activeFile.content || ''}\n</style>\n</head>`);
      else if (ext === 'js') html = html.replace('</body>', `<script>\n/* ${activeFile.name} */\n${activeFile.content || ''}\n</script>\n</body>`);
    }
  }
  return html;
}

// ── Quick File Search Overlay ──────────────────────────────────────────────
function fileColor(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return ({ html: 'text-orange-400', css: 'text-blue-400', js: 'text-yellow-400', ts: 'text-blue-500', tsx: 'text-blue-400', jsx: 'text-yellow-400', json: 'text-green-400', md: 'text-gray-400', py: 'text-green-500' } as Record<string,string>)[ext] || 'text-gray-400';
}

interface FileSearchProps { onClose: () => void }
function FileSearch({ onClose }: FileSearchProps) {
  const { projects, activeProject, openFile } = useApp();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allFiles = (activeProject ? [activeProject] : projects).flatMap(p =>
    getAllFiles(p.files).map(f => ({ file: f, project: p }))
  );
  const filtered = query
    ? allFiles.filter(({ file }) => file.name.toLowerCase().includes(query.toLowerCase()))
    : allFiles;

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setSelected(0); }, [query]);

  const pick = (idx: number) => {
    const item = filtered[idx];
    if (item) { openFile(item.file, item.project); onClose(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: -16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -16 }} transition={{ duration: 0.15 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
              if (e.key === 'Enter') pick(selected);
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Dosya ara..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded text-muted-foreground">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">Dosya bulunamadı</div>
          )}
          {filtered.map(({ file, project }, idx) => (
            <button
              key={file.id}
              onClick={() => pick(idx)}
              onMouseEnter={() => setSelected(idx)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${idx === selected ? 'bg-primary/15' : 'hover:bg-white/5'}`}
            >
              <FileText size={13} className={fileColor(file.name)} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground truncate">{project.name}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-border flex gap-4 text-xs text-muted-foreground">
          <span><kbd className="px-1 bg-muted rounded">↑↓</kbd> Gezin</span>
          <span><kbd className="px-1 bg-muted rounded">Enter</kbd> Aç</span>
          <span><kbd className="px-1 bg-muted rounded">Esc</kbd> Kapat</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main EditorPanel ───────────────────────────────────────────────────────
export default function EditorPanel() {
  const { tabs, activeTab, closeTab, setActiveTab, projects, updateFileContent, saveActiveFile, savedTab, settings } = useApp();
  const [mode, setMode] = useState<'editor' | 'preview'>('editor');
  const [previewHtml, setPreviewHtml] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const findFile = useCallback((projectId: string, fileId: string): FileNode | null => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    const search = (files: FileNode[]): FileNode | null => {
      for (const f of files) { if (f.id === fileId) return f; if (f.children) { const found = search(f.children); if (found) return found; } }
      return null;
    };
    return search(project.files);
  }, [projects]);

  const activeFile = activeTab ? findFile(activeTab.projectId, activeTab.fileId) : null;
  const activeProject = activeTab ? projects.find(p => p.id === activeTab.projectId) || null : null;

  useEffect(() => {
    if (mode === 'preview' && activeProject) setPreviewHtml(buildProjectPreview(activeProject, activeFile));
  }, [mode, activeFile, activeProject, projects]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveActiveFile(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); setShowSearch(true); }
      if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveActiveFile]);

  const ext = activeFile?.name.split('.').pop()?.toLowerCase() || '';
  const isWebFile = ['html', 'htm', 'css', 'js', 'ts', 'jsx', 'tsx', 'json', 'md', 'txt'].includes(ext);

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center bg-card border-b border-border overflow-x-auto shrink-0 h-9">
        {tabs.length === 0 && (
          <div className="flex items-center justify-center w-full text-xs text-muted-foreground px-4">
            Sol panelden proje ve dosya seçin
          </div>
        )}
        {tabs.map(tab => {
          const isActive = activeTab?.fileId === tab.fileId;
          const isSaved = savedTab === tab.fileId;
          return (
            <motion.div
              key={tab.fileId}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-border shrink-0 h-full group relative
                ${isActive ? 'bg-background text-foreground border-t-2 border-t-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}
                ${isSaved ? 'save-flash' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="max-w-32 truncate">{tab.name}</span>
              <button onClick={e => { e.stopPropagation(); closeTab(tab.fileId); }} className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity ml-0.5">
                <X size={11} />
              </button>
            </motion.div>
          );
        })}

        {/* File Search button — right side */}
        <div className="ml-auto shrink-0 flex items-center px-2">
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Dosya Ara (Ctrl+P)"
          >
            <Search size={11} />
            <span className="hidden sm:inline">Ara</span>
            <kbd className="hidden sm:inline px-1 bg-muted rounded text-xs">Ctrl+P</kbd>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {activeFile && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-1 min-w-0">
            <FileCode size={11} className="text-primary shrink-0" />
            <span className="truncate">{activeTab?.name}</span>
            {activeTab?.name?.includes('.') && (
              <><ChevronRight size={12} /><span className="text-primary font-mono text-xs shrink-0">.{activeTab?.name?.split('.').pop()}</span></>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className="flex bg-muted rounded-md p-0.5">
              <button onClick={() => setMode('editor')} className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${mode === 'editor' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Code size={11} /> Editör
              </button>
              <button onClick={() => setMode('preview')} className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${mode === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {isWebFile ? <Globe size={11} /> : <Eye size={11} />} Önizleme
              </button>
            </div>
            <button onClick={saveActiveFile} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-accent/20 text-accent hover:bg-accent/30 transition-colors">
              <Save size={11} /> Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!activeFile ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 quantum-glow">
              <Code size={28} className="text-primary/60" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-2">Editör Hazır</h3>
            <p className="text-xs text-muted-foreground max-w-48 mb-3">Sol panelden bir proje seçin veya yapay zeka ile yeni bir proje başlatın</p>
            <button onClick={() => setShowSearch(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-border">
              <Search size={11} /> Dosya Ara <kbd className="ml-1 px-1 bg-background rounded">Ctrl+P</kbd>
            </button>
          </div>
        ) : mode === 'editor' ? (
          <div className="h-full">
            <Editor
              key={activeFile.id}
              height="100%"
              language={getFileLanguage(activeFile.name)}
              value={activeFile.content || ''}
              onChange={val => { if (activeTab && val !== undefined) updateFileContent(activeTab.fileId, activeTab.projectId, val); }}
              theme="vs-dark"
              options={{
                fontSize: settings.editorFontSize || 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                folding: true,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                formatOnPaste: true,
                suggest: { showSnippets: true },
              }}
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
                title="Canlı Önizleme"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* File Search Overlay */}
      <AnimatePresence>
        {showSearch && <FileSearch onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </div>
  );
}
