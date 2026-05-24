import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Mail, Lock, User, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { supabaseSignUp, getSupabase } from "@/lib/supabase";

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();
  const { setUser } = useApp();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Tüm alanları doldurun.'); return; }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    setLoading(true);
    setError('');

    const sb = getSupabase();
    if (sb) {
      try {
        const data = await supabaseSignUp(email, password, name);
        const sbUser = data.user;

        if (sbUser && !sbUser.email_confirmed_at) {
          setSuccess(true);
          setTimeout(() => setLocation('/verify-email'), 2000);
        } else if (sbUser?.email_confirmed_at) {
          setUser({
            id: `supabase-${sbUser.id}`,
            name,
            email: sbUser.email || email,
            supabaseId: sbUser.id,
            emailVerified: true,
          });
          setLocation('/');
        }
      } catch (e: any) {
        const msg = e?.message || '';
        if (msg.includes('User already registered') || msg.includes('already been registered')) {
          setError('Bu e-posta zaten kayıtlı. Giriş yapın.');
        } else if (msg.includes('Password should be at least')) {
          setError('Şifre en az 6 karakter olmalıdır.');
        } else if (msg.includes('invalid email') || msg.includes('Invalid email')) {
          setError('Geçersiz e-posta adresi.');
        } else {
          setError(msg || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        }
      }
    } else {
      await new Promise(r => setTimeout(r, 700));
      setUser({ id: `user-${Date.now()}`, name, email });
      setLocation('/');
    }
    setLoading(false);
  };

  const isSupabaseEnabled = !!getSupabase();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center quantum-glow">
              <Code2 size={24} className="text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">QuantumIDE</h1>
          <p className="text-sm text-muted-foreground mt-1">Hesabınızı oluşturun</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl" style={{ boxShadow: '0 0 40px rgba(124,58,237,0.15)' }}>
          <h2 className="text-base font-semibold text-foreground mb-5">Yeni Hesap</h2>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Hesap Oluşturuldu!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">{email}</span> adresine
                doğrulama e-postası gönderdik. Lütfen e-postanızı kontrol edin.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ad Soyad</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    data-testid="input-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full pl-9 pr-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full pl-9 pr-9 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {isSupabaseEnabled && (
                <p className="text-xs text-muted-foreground leading-relaxed bg-primary/5 border border-primary/20 px-3 py-2 rounded-lg">
                  Kayıt sonrası e-posta adresinize doğrulama bağlantısı gönderilecektir.
                </p>
              )}

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                  {error}
                </motion.p>
              )}

              <button
                data-testid="btn-register"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/80 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={14} className="animate-spin" /> Hesap oluşturuluyor...</> : 'Hesap Oluştur'}
              </button>
            </form>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-2 text-xs text-muted-foreground">zaten hesabınız var mı?</span></div>
          </div>

          <button
            data-testid="link-login"
            onClick={() => setLocation('/login')}
            className="w-full py-2.5 bg-muted border border-border text-foreground rounded-lg text-sm font-medium hover:bg-white/5 transition-all"
          >
            Giriş Yap
          </button>
        </div>
      </motion.div>
    </div>
  );
}
