import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Github, FolderPlus, Loader2, Search, GitFork,
  Star, Lock, Globe, ChevronRight, AlertCircle, CheckCircle2
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import type { FileNode } from "@/types";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  default_branch: string;
}

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
}

async function fetchRepos(token: string): Promise<GitHubRepo[]> {
  const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator', {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) throw new Error('GitHub repos alınamadı');
  return res.json();
}

async function fetchRepoTree(token: string, owner: string, repo: string, branch: string): Promise<any[]> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) throw new Error('Repo ağacı alınamadı');
  const data = await res.json();
  return data.tree || [];
}

async function fetchFileContent(token: string, owner: string, repo: string, path: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) return '';
  const data = await res.json();
  if (data.content) {
    try { return atob(data.content.replace(/\n/g, '')); } catch { return ''; }
  }
  return '';
}

const SKIP_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'otf', 'mp4', 'mp3', 'zip', 'tar', 'gz', 'pdf']);
const MAX_FILES = 60;

function buildFileTree(paths: { path: string; type: string }[]): FileNode[] {
  const root: FileNode[] = [];
  const map = new Map<string, FileNode>();

  for (const item of paths) {
    if (item.type === 'blob') {
      const ext = item.path.split('.').pop()?.toLowerCase() || '';
      if (SKIP_EXTENSIONS.has(ext)) continue;
    }

    const parts = item.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const fullPath = parts.slice(0, i + 1).join('/');
      const isLast = i === parts.length - 1;

      if (!map.has(fullPath)) {
        const node: FileNode = {
          id: `gh-${fullPath}-${Date.now()}`,
          name: part,
          type: isLast && item.type === 'blob' ? 'file' : 'folder',
          children: isLast && item.type === 'blob' ? undefined : [],
          content: '',
        };
        map.set(fullPath, node);
        current.push(node);
      }
      const node = map.get(fullPath)!;
      if (!isLast) current = node.children || [];
    }
  }
  return root;
}

export default function NewProjectModal({ open, onClose, onCreated }: NewProjectModalProps) {
  const { settings, createProject } = useApp();
  const [mode, setMode] = useState<'choose' | 'blank' | 'github'>('choose');
  const [projectName, setProjectName] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [repoSearch, setRepoSearch] = useState('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [importError, setImportError] = useState('');
  const [importDone, setImportDone] = useState(false);

  const githubConnected = settings.github.connected && !!settings.github.token;

  useEffect(() => {
    if (!open) {
      setMode('choose');
      setProjectName('');
      setRepos([]);
      setRepoSearch('');
      setSelectedRepo(null);
      setImporting(false);
      setImportStatus('');
      setImportError('');
      setImportDone(false);
      setRepoError('');
    } else {
      setMode(githubConnected ? 'choose' : 'blank');
    }
  }, [open, githubConnected]);

  useEffect(() => {
    if (mode === 'github' && githubConnected && repos.length === 0) {
      setLoadingRepos(true);
      setRepoError('');
      fetchRepos(settings.github.token)
        .then(setRepos)
        .catch(e => setRepoError(e.message))
        .finally(() => setLoadingRepos(false));
    }
  }, [mode, githubConnected]);

  const handleCreateBlank = () => {
    const name = projectName.trim() || 'Yeni Proje';
    const project = createProject(name, []);
    onCreated?.(project.id);
    onClose();
  };

  const handleImportRepo = async () => {
    if (!selectedRepo || !settings.github.token) return;
    setImporting(true);
    setImportError('');
    setImportStatus('Repo ağacı alınıyor...');

    try {
      const [owner, repo] = selectedRepo.full_name.split('/');
      const tree = await fetchRepoTree(settings.github.token, owner, repo, selectedRepo.default_branch);

      const files = tree.filter(item => item.type === 'blob').slice(0, MAX_FILES);
      const dirs = tree.filter(item => item.type === 'tree');
      const allItems = [...dirs, ...files];

      setImportStatus(`${files.length} dosya bulundu, içerikler indiriliyor...`);

      const fileNodes = buildFileTree(allItems);

      // Fetch content for files (in batches of 8)
      const fetchContent = async (nodes: FileNode[], path = '') => {
        for (const node of nodes) {
          if (node.type === 'file') {
            const filePath = path ? `${path}/${node.name}` : node.name;
            setImportStatus(`İndiriliyor: ${filePath}`);
            try {
              node.content = await fetchFileContent(settings.github.token, owner, repo, filePath);
            } catch { node.content = ''; }
          } else if (node.type === 'folder' && node.children) {
            await fetchContent(node.children, path ? `${path}/${node.name}` : node.name);
          }
        }
      };

      await fetchContent(fileNodes);

      setImportStatus('Proje oluşturuluyor...');
      const project = createProject(selectedRepo.name, fileNodes);
      setImportDone(true);
      setImportStatus(`${files.length} dosya başarıyla import edildi!`);
      setTimeout(() => { onCreated?.(project.id); onClose(); }, 1200);
    } catch (e: any) {
      setImportError(e.message || 'Import başarısız oldu');
      setImporting(false);
    }
  };

  const filteredRepos = repos.filter(r =>
    r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(repoSearch.toLowerCase())
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Yeni Proje</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Nasıl başlamak istersiniz?</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                  <X size={15} />
                </button>
              </div>

              <div className="p-5">
                {/* ── CHOOSE MODE ─────────────────────────────────── */}
                {mode === 'choose' && (
                  <div className="space-y-3">
                    {/* Blank project option */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setMode('blank')}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-white/3 hover:bg-white/5 hover:border-primary/30 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                        <FolderPlus size={22} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground mb-0.5">Sıfırdan Proje</div>
                        <div className="text-xs text-muted-foreground">Boş bir proje oluştur, dosyaları kendin ekle veya AI ile yaz</div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </motion.button>

                    {/* GitHub import option */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setMode('github')}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/10 hover:border-accent/40 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/25 transition-colors">
                        <Github size={22} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground mb-0.5">GitHub'dan Import</div>
                        <div className="text-xs text-muted-foreground">Mevcut bir repo'yu import et, tüm dosyalar otomatik gelsin</div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </motion.button>

                    <p className="text-center text-xs text-muted-foreground pt-1">
                      GitHub hesabı bağlı: <span className="text-accent">@{settings.github.username || 'bağlı'}</span>
                    </p>
                  </div>
                )}

                {/* ── BLANK PROJECT ────────────────────────────────── */}
                {mode === 'blank' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Proje Adı</label>
                      <input
                        autoFocus
                        type="text"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCreateBlank(); if (e.key === 'Escape') onClose(); }}
                        placeholder="Projem..."
                        className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground">
                      Boş proje oluşturulacak. Sidebar'dan dosya ekleyebilir veya AI'ya "bir index.html oluştur" diyebilirsiniz.
                    </div>

                    <div className="flex gap-2">
                      {githubConnected && (
                        <button onClick={() => setMode('choose')} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-white/5 transition-colors">
                          Geri
                        </button>
                      )}
                      <button
                        onClick={handleCreateBlank}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/80 transition-all"
                      >
                        <FolderPlus size={15} /> Proje Oluştur
                      </button>
                    </div>
                  </div>
                )}

                {/* ── GITHUB IMPORT ─────────────────────────────────── */}
                {mode === 'github' && (
                  <div className="space-y-3">
                    {loadingRepos && (
                      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">Repolar yükleniyor...</span>
                      </div>
                    )}

                    {repoError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                        <AlertCircle size={13} /> {repoError}
                      </div>
                    )}

                    {!loadingRepos && !repoError && (
                      <>
                        {/* Search */}
                        <div className="relative">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            autoFocus
                            type="text"
                            value={repoSearch}
                            onChange={e => setRepoSearch(e.target.value)}
                            placeholder="Repo ara..."
                            className="w-full pl-8 pr-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        {/* Repo list */}
                        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                          {filteredRepos.map(repo => (
                            <motion.button
                              key={repo.id}
                              whileHover={{ x: 2 }}
                              onClick={() => setSelectedRepo(repo)}
                              className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                                selectedRepo?.id === repo.id
                                  ? 'border-primary/40 bg-primary/10'
                                  : 'border-border bg-white/2 hover:bg-white/4 hover:border-white/10'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {repo.private ? <Lock size={12} className="text-muted-foreground" /> : <Globe size={12} className="text-muted-foreground" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold text-foreground">{repo.name}</span>
                                  {repo.language && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">{repo.language}</span>
                                  )}
                                </div>
                                {repo.description && (
                                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{repo.description}</div>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star size={10} /> {repo.stargazers_count}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <GitFork size={10} /> {repo.forks_count}
                                  </span>
                                </div>
                              </div>
                              {selectedRepo?.id === repo.id && (
                                <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                              )}
                            </motion.button>
                          ))}
                          {filteredRepos.length === 0 && (
                            <div className="py-6 text-center text-xs text-muted-foreground">Repo bulunamadı.</div>
                          )}
                        </div>

                        {/* Import status */}
                        {importing && (
                          <div className={`flex items-center gap-2 p-3 rounded-xl text-xs border ${
                            importDone ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-primary/10 border-primary/20 text-primary'
                          }`}>
                            {importDone ? <CheckCircle2 size={13} /> : <Loader2 size={13} className="animate-spin" />}
                            {importStatus}
                          </div>
                        )}
                        {importError && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                            <AlertCircle size={13} /> {importError}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button onClick={() => setMode('choose')} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-white/5 transition-colors">
                            Geri
                          </button>
                          <button
                            onClick={handleImportRepo}
                            disabled={!selectedRepo || importing}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            {importing
                              ? <><Loader2 size={14} className="animate-spin" /> Import ediliyor...</>
                              : <><Github size={14} /> Import Et</>
                            }
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
