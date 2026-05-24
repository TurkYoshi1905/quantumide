import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [puterLoading, setPuterLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { setUser, setPuterUser, updateSettings, settings } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Tüm alanları doldurun.'); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    setUser({ id: `user-${Date.now()}`, name: email.split('@')[0], email });
    setLocation('/');
    setLoading(false);
  };

  const handlePuterLogin = async () => {
    const puter = (window as any).puter;
    if (!puter?.auth) {
      setError('Puter SDK yüklenemedi. Sayfayı yenileyin.');
      return;
    }
    setPuterLoading(true);
    setError('');
    try {
      await puter.auth.signIn();
      const info = await puter.auth.getUser();
      setPuterUser(info);
      updateSettings({ ...settings, ai: { ...settings.ai, puterConnected: true } });
      const name = info?.username || info?.name || 'Puter Kullanıcısı';
      const email = info?.email || `${info?.username}@puter.com`;
      setUser({ id: `puter-${info?.uuid || Date.now()}`, name, email, puterUsername: info?.username });
      setLocation('/');
    } catch (e: any) {
      if (!e?.message?.includes('cancel') && !e?.message?.includes('close')) {
        setError('Puter girişi başarısız. Lütfen tekrar deneyin.');
      }
    } finally {
      setPuterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center quantum-glow">
              <Code2 size={24} className="text-primary" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">QuantumIDE</h1>
          <p className="text-sm text-muted-foreground mt-1">Yapay Zeka Destekli Geliştirme Ortamı</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl" style={{ boxShadow: '0 0 40px rgba(124,58,237,0.15)' }}>
          <h2 className="text-base font-semibold text-foreground mb-5">Hesabınıza Giriş Yapın</h2>

          {/* Puter Login - Primary */}
          <button
            data-testid="btn-puter-login"
            onClick={handlePuterLogin}
            disabled={puterLoading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/80 disabled:opacity-60 disabled:cursor-not-allowed transition-all mb-4"
          >
            {puterLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Puter açılıyor...</>
            ) : (
              <><Code2 size={16} /> Puter ile Giriş Yap</>
            )}
          </button>

          <div className="text-xs text-muted-foreground text-center mb-4 px-2 leading-relaxed">
            Puter ile giriş yaparak tüm AI modellerine (GPT-4o, Claude, Gemini...) ücretsiz erişebilirsiniz.
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-2 text-xs text-muted-foreground">veya e-posta ile</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">E-posta</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  data-testid="input-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="siz@ornek.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Şifre</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  data-testid="input-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(o => !o)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </motion.p>
            )}

            <button
              data-testid="btn-login"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-muted border border-border text-foreground rounded-lg text-sm font-medium hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Giriş yapılıyor...</> : 'Giriş Yap'}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Hesabınız yok mu?{' '}
            <button
              data-testid="link-register"
              onClick={() => setLocation('/register')}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Hesap oluşturun
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Giriş yaparak{' '}
          <span className="text-primary cursor-pointer">Kullanım Koşulları</span>
          {'\'nı kabul etmiş olursunuz.'}
        </p>
      </motion.div>
    </div>
  );
}
