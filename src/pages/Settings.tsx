import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Bot, Github, Eye, User, Save, CheckCircle2, Loader2, Code2,
  Sparkles, Unlink, Zap
} from "lucide-react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { PUTER_MODELS } from "@/lib/ai";

const TABS = [
  { id: 'ai', label: 'AI Modelleri', icon: Bot },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'appearance', label: 'Görünüm', icon: Eye },
  { id: 'account', label: 'Hesap', icon: User },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('ai');
  const [, setLocation] = useLocation();
  const { settings, updateSettings, user, puterUser, setPuterUser, setUser } = useApp();
  const [githubConnecting, setGithubConnecting] = useState(false);
  const [githubToken, setGithubToken] = useState(settings.github.token || '');
  const [saved, setSaved] = useState(false);
  const [puterConnecting, setPuterConnecting] = useState(false);
  const [puterError, setPuterError] = useState('');

  const handlePuterConnect = async () => {
    const puter = (window as any).puter;
    if (!puter?.auth) { setPuterError('Puter SDK yüklenemedi.'); return; }
    setPuterConnecting(true);
    setPuterError('');
    try {
      await puter.auth.signIn();
      const info = await puter.auth.getUser();
      setPuterUser(info);
      updateSettings({ ...settings, ai: { ...settings.ai, puterConnected: true } });
      if (!user) {
        const name = info?.username || 'Puter Kullanıcısı';
        const email = info?.email || `${info?.username}@puter.com`;
        setUser({ id: `puter-${info?.uuid || Date.now()}`, name, email, puterUsername: info?.username });
      }
    } catch (e: any) {
      if (!e?.message?.includes('cancel') && !e?.message?.includes('close')) {
        setPuterError('Bağlantı başarısız. Tekrar deneyin.');
      }
    } finally {
      setPuterConnecting(false);
    }
  };

  const handlePuterDisconnect = async () => {
    const puter = (window as any).puter;
    try { await puter?.auth?.signOut(); } catch { /* ignore */ }
    setPuterUser(null);
    updateSettings({ ...settings, ai: { ...settings.ai, puterConnected: false } });
  };

  const handleGithubConnect = async () => {
    if (!githubToken) return;
    setGithubConnecting(true);
    await new Promise(r => setTimeout(r, 1200));
    updateSettings({ ...settings, github: { connected: true, token: githubToken, username: 'gelistirici' } });
    setGithubConnecting(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isPuterConnected = settings.ai.puterConnected || !!puterUser;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <button
          data-testid="btn-back"
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

      <div className="max-w-3xl mx-auto p-6 flex gap-6">
        <div className="w-44 shrink-0">
          <nav className="space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  data-testid={`settings-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${activeTab === tab.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>

            {/* AI Models Tab */}
            {activeTab === 'ai' && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">AI Modelleri</h2>
                <p className="text-xs text-muted-foreground mb-5">
                  Puter hesabınızla bağlanarak tüm AI modellerine ücretsiz ve sınırsız erişin.
                </p>

                {/* Puter Connection Card */}
                {isPuterConnected ? (
                  <div className="p-4 rounded-xl border border-accent/40 bg-accent/5 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Puter Bağlı</p>
                        <p className="text-xs text-muted-foreground">
                          {puterUser?.username ? `@${puterUser.username}` : 'Bağlı hesap'}
                        </p>
                      </div>
                      <button
                        onClick={handlePuterDisconnect}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                      >
                        <Unlink size={11} /> Bağlantıyı Kes
                      </button>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-lg">
                      <Zap size={12} className="text-accent" />
                      <span className="text-xs text-accent font-medium">Sınırsız AI kullanımı aktif</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Code2 size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Puter Hesabı Gerekli</p>
                        <p className="text-xs text-muted-foreground">AI modellerini kullanmak için bağlanın</p>
                      </div>
                    </div>
                    {puterError && (
                      <p className="text-xs text-destructive mb-2 px-1">{puterError}</p>
                    )}
                    <button
                      data-testid="btn-connect-puter"
                      onClick={handlePuterConnect}
                      disabled={puterConnecting}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/80 disabled:opacity-60 transition-all"
                    >
                      {puterConnecting
                        ? <><Loader2 size={14} className="animate-spin" /> Bağlanıyor...</>
                        : <><Code2 size={14} /> Puter ile Bağlan</>}
                    </button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Ücretsiz bir Puter hesabı açmak için de kullanabilirsiniz.
                    </p>
                  </div>
                )}

                {/* Active Model Selector */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Aktif Model</p>
                  <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                    {PUTER_MODELS.map(model => (
                      <button
                        key={model.id}
                        data-testid={`model-${model.id}`}
                        onClick={() => updateSettings({ ...settings, ai: { ...settings.ai, activeModel: model.id } })}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                          settings.ai.activeModel === model.id
                            ? 'border-primary/40 bg-primary/10'
                            : 'border-border bg-card hover:bg-white/5'
                        }`}
                      >
                        <Sparkles size={13} className={model.color} />
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium ${model.color}`}>{model.label}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{model.provider}</span>
                        </div>
                        {settings.ai.activeModel === model.id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary shrink-0">Aktif</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GitHub Tab */}
            {activeTab === 'github' && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">GitHub Entegrasyonu</h2>
                <p className="text-xs text-muted-foreground mb-5">GitHub hesabınızı bağlayın ve projelerinizi import edin.</p>

                {settings.github.connected ? (
                  <div className="p-4 rounded-xl border border-accent/40 bg-accent/5 flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">GitHub Bağlı</p>
                      <p className="text-xs text-muted-foreground">@{settings.github.username}</p>
                    </div>
                    <button
                      data-testid="btn-disconnect-github"
                      onClick={() => updateSettings({ ...settings, github: { connected: false, token: '' } })}
                      className="ml-auto text-xs text-destructive hover:text-destructive/80 transition-colors"
                    >
                      Bağlantıyı Kes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Personal Access Token</label>
                      <input
                        data-testid="input-github-token"
                        type="password"
                        value={githubToken}
                        onChange={e => setGithubToken(e.target.value)}
                        placeholder="ghp_..."
                        className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        GitHub › Settings › Developer settings › Personal access tokens
                      </p>
                    </div>
                    <button
                      data-testid="btn-connect-github"
                      onClick={handleGithubConnect}
                      disabled={!githubToken || githubConnecting}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/80 disabled:opacity-50 transition-colors"
                    >
                      {githubConnecting ? <><Loader2 size={14} className="animate-spin" /> Bağlanıyor...</> : <><Github size={14} /> GitHub'a Bağlan</>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">Görünüm</h2>
                <p className="text-xs text-muted-foreground mb-5">Editör ve arayüz tercihlerinizi ayarlayın.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Editör Yazı Boyutu: {settings.editorFontSize}px</label>
                    <input
                      data-testid="slider-font-size"
                      type="range"
                      min="10"
                      max="20"
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
                    <div className="p-3 rounded-lg border border-primary bg-primary/10 text-center max-w-32">
                      <div className="w-full h-10 bg-gray-900 rounded mb-2 flex items-end justify-center pb-1">
                        <div className="w-3/4 h-1 bg-primary/60 rounded" />
                      </div>
                      <span className="text-xs text-foreground font-medium">Koyu (Aktif)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Açık tema yakında eklenecek.</p>
                  </div>
                </div>

                <button
                  data-testid="btn-save-appearance"
                  onClick={handleSave}
                  className="mt-5 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/80 transition-colors"
                >
                  {saved ? <><CheckCircle2 size={14} /> Kaydedildi!</> : <><Save size={14} /> Kaydet</>}
                </button>
              </div>
            )}

            {/* Account Tab */}
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
                    {isPuterConnected && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-accent/20 text-accent">Puter Bağlı</span>
                    )}
                    {!isPuterConnected && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">Yerel Hesap</span>
                    )}
                  </div>
                </div>

                {!isPuterConnected && (
                  <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
                    AI modellerini kullanmak için AI Modelleri sekmesinden Puter hesabınızı bağlayın.
                  </div>
                )}

                {user && (
                  <button
                    onClick={() => {
                      setUser(null);
                      setLocation('/login');
                    }}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20 transition-colors"
                  >
                    Çıkış Yap
                  </button>
                )}
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
