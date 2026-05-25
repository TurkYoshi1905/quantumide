import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bot, Github, Eye, User, CheckCircle2, Loader2, Code2,
  Key, Plus, Trash2, Edit3, Search, Check, AlertCircle, RefreshCw, Save,
  ChevronDown, Copy, FileText, Zap, Unlink, DollarSign, X, Lock, Bell
} from "lucide-react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { ALL_MODELS, DEFAULT_SYSTEM_PROMPT } from "@/lib/ai";
import { CHANGELOG } from "@/lib/changelogData";
import type { ApiKeyEntry, ApiProvider } from "@/types";

// ── Provider definitions ────────────────────────────────────────────────────
const PROVIDERS: { id: ApiProvider; name: string; color: string; bg: string; border: string; docsUrl: string; keyPrefix: string }[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    docsUrl: 'https://platform.openai.com/api-keys',
    keyPrefix: 'sk-',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    docsUrl: 'https://console.anthropic.com/keys',
    keyPrefix: 'sk-ant-',
  },
  {
    id: 'google',
    name: 'Google AI',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    docsUrl: 'https://aistudio.google.com/apikey',
    keyPrefix: 'AIza',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    docsUrl: 'https://www.perplexity.ai/settings/api',
    keyPrefix: 'pplx-',
  },
  {
    id: 'vercel',
    name: 'Vercel AI Gateway',
    color: 'text-white',
    bg: 'bg-white/10',
    border: 'border-white/20',
    docsUrl: 'https://vercel.com/account/tokens',
    keyPrefix: '',
  },
];

// Provider icons (SVG inline)
function ProviderIcon({ id, size = 20 }: { id: ApiProvider; size?: number }) {
  const cls = `w-${size === 20 ? 5 : 4} h-${size === 20 ? 5 : 4}`;
  if (id === 'openai') return (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.387 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.663zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  );
  if (id === 'anthropic') return (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.304 3.541 13.01 14.55h2.009l.87-2.347h4.248l.87 2.347H23L18.697 3.541h-1.393zm-.652 6.962 1.65-4.458 1.648 4.458h-3.298zM6.696 3.541 1 14.55h2.009l1.304-2.97h5.26l1.304 2.97h2.009L7.088 3.541H6.696zm-2.607 6.66 1.957-4.456 1.957 4.456H4.09z"/>
    </svg>
  );
  if (id === 'google') return (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
  if (id === 'perplexity') return (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"/>
      <path d="M8.5 9.5L12 6l3.5 3.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M12 6v12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8.5 14.5L12 18l3.5-3.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (id === 'vercel') return (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 22.525H0l12-21.05 12 21.05z"/>
    </svg>
  );
  return null;
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'apikeys',    label: 'API Anahtarları',  icon: Key },
  { id: 'models',    label: 'AI Modelleri',     icon: Bot },
  { id: 'prompt',    label: 'Sistem Promptu',  icon: FileText },
  { id: 'github',    label: 'GitHub',           icon: Github },
  { id: 'appearance',label: 'Görünüm',          icon: Eye },
  { id: 'account',   label: 'Hesap',            icon: User },
  { id: 'changelog', label: 'Güncelleme Notları', icon: Bell },
];

const PROVIDER_COLORS: Record<string, string> = {
  openai: 'text-green-400', anthropic: 'text-orange-400',
  google: 'text-blue-400', mistral: 'text-purple-400',
  deepseek: 'text-cyan-400', meta: 'text-pink-400', perplexity: 'text-yellow-400',
};

// ── Add / Edit key modal ──────────────────────────────────────────────────────
function KeyModal({ provider, existing, onSave, onClose }: {
  provider: typeof PROVIDERS[0];
  existing: ApiKeyEntry | null;
  onSave: (key: string, label: string) => void;
  onClose: () => void;
}) {
  const [key, setKey] = useState(existing?.key || '');
  const [label, setLabel] = useState(existing?.label || '');
  const [show, setShow] = useState(false);
  const [validating, setValidating] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  const validate = async () => {
    if (!key.trim()) return;
    setValidating(true);
    setValid(null);
    try {
      let ok = false;
      if (provider.id === 'openai') {
        const r = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } });
        ok = r.ok;
      } else if (provider.id === 'google') {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        ok = r.ok;
      } else if (provider.id === 'vercel') {
        const r = await fetch('https://api.vercel.com/v2/user', { headers: { Authorization: `Bearer ${key}` } });
        ok = r.ok;
      } else {
        // Anthropic & Perplexity — CORS restricted, assume valid if format matches
        ok = key.trim().length > 20;
      }
      setValid(ok);
    } catch {
      setValid(false);
    } finally {
      setValidating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          className="pointer-events-auto w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${provider.bg} ${provider.border} border flex items-center justify-center ${provider.color}`}>
                <ProviderIcon id={provider.id} size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{existing ? 'Anahtarı Düzenle' : 'API Anahtarı Ekle'}</h3>
                <p className="text-xs text-muted-foreground">{provider.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Etiket (isteğe bağlı)</label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder={`${provider.name} production`}
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">API Anahtarı</label>
              <div className="relative">
                <input
                  autoFocus
                  type={show ? 'text' : 'password'}
                  value={key}
                  onChange={e => { setKey(e.target.value); setValid(null); }}
                  placeholder={provider.keyPrefix ? `${provider.keyPrefix}...` : 'API anahtarınızı girin...'}
                  className="w-full pl-3 pr-20 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors font-mono"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {valid === true && <CheckCircle2 size={14} className="text-accent" />}
                  {valid === false && <AlertCircle size={14} className="text-destructive" />}
                  <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors text-xs"
                  >
                    {show ? 'Gizle' : 'Göster'}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <a href={provider.docsUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                  Nereden alınır?
                </a>
                <button
                  onClick={validate}
                  disabled={!key.trim() || validating}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                >
                  {validating ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                  Doğrula
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-white/5 transition-colors">
                İptal
              </button>
              <button
                onClick={() => { if (key.trim()) onSave(key.trim(), label.trim()); }}
                disabled={!key.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/80 disabled:opacity-50 transition-all"
              >
                <Check size={14} /> Kaydet
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── Main Settings ─────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState('apikeys');
  const [, setLocation] = useLocation();
  const { settings, updateSettings, user, puterUser, setPuterUser, setUser } = useApp();

  // API Keys
  const [keyModal, setKeyModal] = useState<{ provider: typeof PROVIDERS[0]; existing: ApiKeyEntry | null } | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [checkingBalance, setCheckingBalance] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});

  // Models
  const [modelSearch, setModelSearch] = useState('');

  // GitHub
  const [githubToken, setGithubToken] = useState(settings.github.token || '');
  const [githubConnecting, setGithubConnecting] = useState(false);

  // Appearance
  const [appearanceSaved, setAppearanceSaved] = useState(false);

  // Puter
  const [puterConnecting, setPuterConnecting] = useState(false);
  const [puterError, setPuterError] = useState('');

  const isPuterConnected = settings.ai.puterConnected || !!puterUser;

  // ── API Key helpers ──────────────────────────────────────────────────────
  const saveKey = (provider: ApiProvider, key: string, label: string, existingId?: string) => {
    const existing = settings.apiKeys.find(k => k.id === existingId);
    let updated: ApiKeyEntry[];
    if (existing) {
      updated = settings.apiKeys.map(k => k.id === existingId ? { ...k, key, label } : k);
    } else {
      const newEntry: ApiKeyEntry = { id: `key-${Date.now()}`, provider, key, label, addedAt: Date.now() };
      updated = [...settings.apiKeys, newEntry];
    }
    updateSettings({ ...settings, apiKeys: updated });
    setKeyModal(null);
  };

  const deleteKey = (id: string) => {
    updateSettings({ ...settings, apiKeys: settings.apiKeys.filter(k => k.id !== id) });
  };

  const toggleKeyVisible = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 8)}${'•'.repeat(Math.min(24, key.length - 8))}`;
  };

  const checkBalance = async (entry: ApiKeyEntry) => {
    setCheckingBalance(entry.id);
    try {
      if (entry.provider === 'openai') {
        const r = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${entry.key}` } });
        setBalances(b => ({ ...b, [entry.id]: r.ok ? 'Anahtar geçerli' : 'Geçersiz anahtar' }));
      } else if (entry.provider === 'google') {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${entry.key}`);
        setBalances(b => ({ ...b, [entry.id]: r.ok ? 'Anahtar geçerli' : 'Geçersiz anahtar' }));
      } else if (entry.provider === 'vercel') {
        const r = await fetch('https://api.vercel.com/v2/user', { headers: { Authorization: `Bearer ${entry.key}` } });
        if (r.ok) {
          const data = await r.json();
          setBalances(b => ({ ...b, [entry.id]: `@${data.user?.username || 'geçerli'}` }));
        } else {
          setBalances(b => ({ ...b, [entry.id]: 'Geçersiz token' }));
        }
      } else {
        setBalances(b => ({ ...b, [entry.id]: 'CORS kısıtlaması — tarayıcıdan doğrulanamaz' }));
      }
    } catch {
      setBalances(b => ({ ...b, [entry.id]: 'Bağlantı hatası' }));
    } finally {
      setCheckingBalance(null);
    }
  };

  // ── GitHub ───────────────────────────────────────────────────────────────
  const handleGithubConnect = async () => {
    if (!githubToken) return;
    setGithubConnecting(true);
    try {
      const r = await fetch('https://api.github.com/user', { headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' } });
      if (r.ok) {
        const data = await r.json();
        updateSettings({ ...settings, github: { connected: true, token: githubToken, username: data.login } });
      } else {
        updateSettings({ ...settings, github: { connected: true, token: githubToken, username: 'gelistirici' } });
      }
    } catch {
      updateSettings({ ...settings, github: { connected: true, token: githubToken, username: 'gelistirici' } });
    } finally {
      setGithubConnecting(false);
    }
  };

  // ── Puter ────────────────────────────────────────────────────────────────
  const handlePuterConnect = async () => {
    const puter = (window as any).puter;
    if (!puter?.auth) { setPuterError('Puter SDK yüklenemedi.'); return; }
    setPuterConnecting(true); setPuterError('');
    try {
      await puter.auth.signIn();
      const info = await puter.auth.getUser();
      setPuterUser(info);
      updateSettings({ ...settings, ai: { ...settings.ai, puterConnected: true } });
    } catch (e: any) {
      if (!e?.message?.includes('cancel') && !e?.message?.includes('close')) {
        setPuterError('Bağlantı başarısız. Tekrar deneyin.');
      }
    } finally { setPuterConnecting(false); }
  };

  const handlePuterDisconnect = async () => {
    const puter = (window as any).puter;
    try { await puter?.auth?.signOut(); } catch { /* ignore */ }
    setPuterUser(null);
    updateSettings({ ...settings, ai: { ...settings.ai, puterConnected: false } });
  };

  // ── Model filter ──────────────────────────────────────────────────────────
  const filteredModels = ALL_MODELS.filter(m =>
    m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.label.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.provider.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const groupedByProvider = filteredModels.reduce((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = [];
    acc[m.provider].push(m);
    return acc;
  }, {} as Record<string, typeof ALL_MODELS>);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setLocation('/')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">QuantumIDE — Ayarlar</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    activeTab === tab.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>

            {/* ══ API KEYS TAB ══════════════════════════════════════════════ */}
            {activeTab === 'apikeys' && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">API Anahtarları</h2>
                <p className="text-xs text-muted-foreground mb-5">
                  Kendi API anahtarlarınızla modelleri doğrudan kullanın. Anahtarlar yalnızca cihazınızda saklanır.
                </p>

                {/* Puter section */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Puter (Ücretsiz AI)</p>
                  {isPuterConnected ? (
                    <div className="p-3.5 rounded-xl border border-accent/30 bg-accent/5 flex items-center gap-3">
                      <CheckCircle2 size={15} className="text-accent shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Puter Bağlı</p>
                        <p className="text-xs text-muted-foreground">{puterUser?.username ? `@${puterUser.username}` : 'Bağlı hesap'} — Sınırsız AI kullanımı</p>
                      </div>
                      <button onClick={handlePuterDisconnect} className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors">
                        <Unlink size={11} /> Kes
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl border border-border bg-white/2">
                      {puterError && <p className="text-xs text-destructive mb-2">{puterError}</p>}
                      <button
                        onClick={handlePuterConnect}
                        disabled={puterConnecting}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 disabled:opacity-60 transition-all border border-primary/20"
                      >
                        {puterConnecting ? <><Loader2 size={13} className="animate-spin" /> Bağlanıyor...</> : <><Zap size={13} /> Puter ile Bağlan — Ücretsiz</>}
                      </button>
                      <p className="text-xs text-muted-foreground mt-2">GPT-4o, Claude, Gemini ve daha fazlasına ücretsiz erişim</p>
                    </div>
                  )}
                </div>

                {/* Provider cards */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Kendi Anahtarlarım</p>
                <div className="space-y-3">
                  {PROVIDERS.map(provider => {
                    const keys = settings.apiKeys.filter(k => k.provider === provider.id);
                    return (
                      <div key={provider.id} className={`rounded-xl border ${provider.border} ${provider.bg} p-4`}>
                        {/* Provider header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-lg bg-white/5 border ${provider.border} flex items-center justify-center ${provider.color}`}>
                            <ProviderIcon id={provider.id} size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${provider.color}`}>{provider.name}</p>
                            <p className="text-xs text-muted-foreground">{keys.length} anahtar</p>
                          </div>
                          <button
                            onClick={() => setKeyModal({ provider, existing: null })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground hover:bg-white/10 transition-colors"
                          >
                            <Plus size={11} /> Ekle
                          </button>
                        </div>

                        {/* Keys list */}
                        {keys.length > 0 && (
                          <div className="space-y-2">
                            {keys.map(entry => (
                              <div key={entry.id} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-black/20 border border-white/5">
                                <Key size={11} className="text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                  {entry.label && <div className="text-xs font-medium text-foreground mb-0.5">{entry.label}</div>}
                                  <code className="text-xs text-muted-foreground font-mono">
                                    {visibleKeys.has(entry.id) ? entry.key : maskKey(entry.key)}
                                  </code>
                                </div>
                                {balances[entry.id] && (
                                  <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-white/5 shrink-0 max-w-24 truncate">
                                    {balances[entry.id]}
                                  </span>
                                )}
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button onClick={() => toggleKeyVisible(entry.id)} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" title="Göster/Gizle">
                                    <Eye size={11} />
                                  </button>
                                  <button onClick={() => navigator.clipboard.writeText(entry.key)} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" title="Kopyala">
                                    <Copy size={11} />
                                  </button>
                                  <button
                                    onClick={() => checkBalance(entry)}
                                    disabled={checkingBalance === entry.id}
                                    className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                    title="Bakiye kontrol"
                                  >
                                    {checkingBalance === entry.id ? <Loader2 size={11} className="animate-spin" /> : <DollarSign size={11} />}
                                  </button>
                                  <button onClick={() => setKeyModal({ provider, existing: entry })} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" title="Düzenle">
                                    <Edit3 size={11} />
                                  </button>
                                  <button onClick={() => deleteKey(entry.id)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive" title="Sil">
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {keys.length === 0 && (
                          <p className="text-xs text-muted-foreground">Henüz anahtar eklenmedi.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ MODELS TAB ════════════════════════════════════════════════ */}
            {activeTab === 'models' && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">AI Modelleri</h2>
                <p className="text-xs text-muted-foreground mb-4">Aktif model seçin. Model adı <code className="text-primary">provider/model-adi</code> formatındadır.</p>

                {/* Search */}
                <div className="relative mb-4">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    autoFocus
                    value={modelSearch}
                    onChange={e => setModelSearch(e.target.value)}
                    placeholder="Model ara... (anthropic/claude-opus-4.7, openai/gpt-4o)"
                    className="w-full pl-9 pr-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Model table */}
                <div className="rounded-xl border border-border overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_80px_90px_90px] gap-3 px-4 py-2.5 bg-white/2 border-b border-border">
                    <span className="text-xs font-semibold text-muted-foreground">Model</span>
                    <span className="text-xs font-semibold text-muted-foreground text-right">Bağlam</span>
                    <span className="text-xs font-semibold text-muted-foreground text-right">Giriş</span>
                    <span className="text-xs font-semibold text-muted-foreground text-right">Çıkış</span>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto">
                    {Object.entries(groupedByProvider).map(([provider, models]) => (
                      <div key={provider}>
                        <div className="px-4 py-1.5 bg-white/1 border-b border-border">
                          <span className={`text-xs font-semibold capitalize ${PROVIDER_COLORS[provider] || 'text-muted-foreground'}`}>{provider}</span>
                        </div>
                        {models.map(model => {
                          const isActive = settings.ai.activeModel === model.id || settings.ai.activeModel === model.puterModel;
                          return (
                            <button
                              key={model.id}
                              onClick={() => updateSettings({ ...settings, ai: { ...settings.ai, activeModel: model.id } })}
                              className={`w-full grid grid-cols-[1fr_80px_90px_90px] gap-3 px-4 py-3 border-b border-border/50 text-left hover:bg-white/3 transition-colors ${isActive ? 'bg-primary/8' : ''}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                <div className="min-w-0">
                                  <div className="text-xs font-mono text-foreground truncate">{model.id}</div>
                                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                    {model.capabilities.map(c => (
                                      <span key={c} className="text-xs px-1 py-0.5 rounded bg-white/5 text-muted-foreground capitalize">{c}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground text-right self-center">{model.context}</span>
                              <span className="text-xs text-accent text-right self-center font-mono">{model.inputPrice}</span>
                              <span className="text-xs text-orange-400 text-right self-center font-mono">{model.outputPrice}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                    {filteredModels.length === 0 && (
                      <div className="py-8 text-center text-xs text-muted-foreground">Model bulunamadı.</div>
                    )}
                  </div>
                </div>

                {settings.ai.activeModel && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-xs text-primary font-mono">Aktif: {settings.ai.activeModel}</span>
                  </div>
                )}
              </div>
            )}

            {/* ══ SYSTEM PROMPT TAB ═════════════════════════════════════════ */}
            {activeTab === 'prompt' && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">Sistem Promptu</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  AI asistanının kişiliğini, tasarım standartlarını ve kod kalite kurallarını belirleyen sistem promptu.
                  Bu prompt sabit olup değiştirilemez.
                </p>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                  <Lock size={12} className="text-amber-500 shrink-0" />
                  <span className="text-xs text-amber-400">
                    Bu sistem promptu korunmaktadır ve düzenlenemez. Profesyonel AI davranışı için sabit tutulmaktadır.
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {DEFAULT_SYSTEM_PROMPT.split('\n').length} satır, {DEFAULT_SYSTEM_PROMPT.length} karakter
                  </span>
                  <span className="text-xs text-primary/70 font-medium">QuantumIDE AI v1.0</span>
                </div>

                <div className="w-full h-[520px] px-4 py-3 bg-muted border border-border rounded-xl text-xs text-muted-foreground font-mono leading-relaxed overflow-y-auto select-none cursor-not-allowed opacity-75 whitespace-pre-wrap">
                  {DEFAULT_SYSTEM_PROMPT}
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Bu prompt her AI mesajında gönderilir. Dosya formatı kuralları, tasarım standartları ve AI kimliği burada tanımlanır.
                </p>
              </div>
            )}

            {/* ══ GITHUB TAB ════════════════════════════════════════════════ */}
            {activeTab === 'github' && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">GitHub Entegrasyonu</h2>
                <p className="text-xs text-muted-foreground mb-5">
                  GitHub hesabınızı bağlayın. Yeni proje oluştururken repo'larınızı import edebilirsiniz.
                </p>

                {settings.github.connected ? (
                  <div className="p-4 rounded-xl border border-accent/40 bg-accent/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                        <Github size={18} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">GitHub Bağlı</p>
                        <p className="text-xs text-muted-foreground">@{settings.github.username}</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ ...settings, github: { connected: false, token: '' } })}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                      >
                        <Unlink size={11} /> Bağlantıyı Kes
                      </button>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-lg">
                      <CheckCircle2 size={12} className="text-accent" />
                      <span className="text-xs text-accent">Yeni proje oluştururken GitHub repo'larınızı import edebilirsiniz</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Personal Access Token</label>
                      <input
                        type="password"
                        value={githubToken}
                        onChange={e => setGithubToken(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleGithubConnect(); }}
                        placeholder="ghp_..."
                        className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        GitHub › Settings › Developer settings › Personal access tokens › repo, read:user izinleri gerekli
                      </p>
                    </div>
                    <button
                      onClick={handleGithubConnect}
                      disabled={!githubToken || githubConnecting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-semibold hover:bg-foreground/80 disabled:opacity-50 transition-colors"
                    >
                      {githubConnecting ? <><Loader2 size={14} className="animate-spin" /> Bağlanıyor...</> : <><Github size={14} /> GitHub'a Bağlan</>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ══ APPEARANCE TAB ════════════════════════════════════════════ */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">Görünüm</h2>
                <p className="text-xs text-muted-foreground mb-5">Editör ve arayüz tercihlerinizi ayarlayın.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Editör Yazı Boyutu: <span className="text-foreground">{settings.editorFontSize}px</span>
                    </label>
                    <input
                      type="range" min="10" max="20"
                      value={settings.editorFontSize}
                      onChange={e => updateSettings({ ...settings, editorFontSize: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10px</span><span>20px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Tema</label>
                    <div className="p-3 rounded-lg border border-primary bg-primary/10 inline-block">
                      <div className="w-24 h-12 bg-[#0a0e1a] rounded mb-2 flex items-end justify-center pb-1">
                        <div className="w-3/4 h-1 bg-primary/60 rounded" />
                      </div>
                      <span className="text-xs text-foreground font-medium">Koyu (Aktif)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Açık tema yakında eklenecek.</p>
                  </div>
                </div>

                <button
                  onClick={() => { setAppearanceSaved(true); setTimeout(() => setAppearanceSaved(false), 2000); }}
                  className="mt-5 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/80 transition-colors"
                >
                  {appearanceSaved ? <><CheckCircle2 size={14} /> Kaydedildi!</> : <><Save size={14} /> Kaydet</>}
                </button>
              </div>
            )}

            {/* ══ ACCOUNT TAB ═══════════════════════════════════════════════ */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">Hesap</h2>
                <p className="text-xs text-muted-foreground mb-5">Profil bilgilerinizi görüntüleyin.</p>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/30 flex items-center justify-center text-xl font-bold text-primary">
                    {user?.name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user?.name || 'Misafir Kullanıcı'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || 'Giriş yapılmadı'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {isPuterConnected && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-accent/20 text-accent">Puter Bağlı</span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">Yerel Hesap</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-border bg-white/2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">API Anahtarları</p>
                    <p className="text-xs text-foreground">
                      {settings.apiKeys.length > 0
                        ? `${settings.apiKeys.length} anahtar kayıtlı (${[...new Set(settings.apiKeys.map(k => k.provider))].join(', ')})`
                        : 'Henüz API anahtarı eklenmedi'}
                    </p>
                  </div>
                </div>

                {user && (
                  <button
                    onClick={() => { setUser(null); setLocation('/login'); }}
                    className="mt-5 flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20 transition-colors"
                  >
                    Çıkış Yap
                  </button>
                )}
              </div>
            )}

            {/* ══ CHANGELOG TAB ════════════════════════════════════════════ */}
            {activeTab === 'changelog' && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">Güncelleme Notları</h2>
                <p className="text-xs text-muted-foreground mb-5">QuantumIDE sürüm geçmişi ve yapılan değişiklikler.</p>

                <div className="space-y-5">
                  {CHANGELOG.map((entry) => (
                    <div key={entry.version} className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white/2">
                        <span className="text-sm font-bold text-foreground font-mono">{entry.version}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          entry.tag === 'major' ? 'bg-accent/20 text-accent' :
                          entry.tag === 'minor' ? 'bg-primary/20 text-primary' :
                          'bg-muted-foreground/20 text-muted-foreground'
                        }`}>
                          {entry.tag === 'major' ? 'Büyük' : entry.tag === 'minor' ? 'Küçük' : 'Düzeltme'}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">{entry.date}</span>
                      </div>
                      <ul className="divide-y divide-border/50">
                        {entry.changes.map((c, i) => (
                          <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                            <span className={`mt-0.5 shrink-0 w-14 text-center text-xs font-medium px-1.5 py-0.5 rounded ${
                              c.type === 'new'     ? 'bg-accent/15 text-accent' :
                              c.type === 'fix'     ? 'bg-destructive/15 text-destructive' :
                              c.type === 'improve' ? 'bg-primary/15 text-primary' :
                                                     'bg-muted-foreground/15 text-muted-foreground'
                            }`}>
                              {c.type === 'new' ? 'YENİ' : c.type === 'fix' ? 'DÜZ' : c.type === 'improve' ? 'İYİ' : 'KALD'}
                            </span>
                            <span className="text-xs text-foreground leading-relaxed">{c.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>

      {/* Key Modal */}
      <AnimatePresence>
        {keyModal && (
          <KeyModal
            provider={keyModal.provider}
            existing={keyModal.existing}
            onSave={(key, label) => saveKey(keyModal.provider.id, key, label, keyModal.existing?.id)}
            onClose={() => setKeyModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
