import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, Mail, RefreshCw, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { getSupabase } from "@/lib/supabase";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLocation('/');
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setLocation('/login');
        return;
      }
      const u = data.session.user;
      setEmail(u.email || '');
      if (u.email_confirmed_at) {
        setVerified(true);
        setTimeout(() => setLocation('/'), 1500);
      }
    });

    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email_confirmed_at) {
        setVerified(true);
        setTimeout(() => setLocation('/'), 1500);
      }
    });

    return () => { listener.subscription.unsubscribe(); };
  }, [setLocation]);

  const handleCheckNow = async () => {
    setChecking(true);
    const sb = getSupabase();
    if (!sb) { setChecking(false); return; }
    const { data } = await sb.auth.getUser();
    if (data.user?.email_confirmed_at) {
      setVerified(true);
      setTimeout(() => setLocation('/'), 1500);
    }
    setChecking(false);
  };

  const handleResend = async () => {
    setResending(true);
    const sb = getSupabase();
    if (!sb || !email) { setResending(false); return; }
    await sb.auth.resend({ type: 'signup', email });
    setResent(true);
    setResending(false);
    setTimeout(() => setResent(false), 5000);
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
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl" style={{ boxShadow: '0 0 40px rgba(124,58,237,0.15)' }}>
          {verified ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-accent" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-2">E-posta Doğrulandı!</h2>
              <p className="text-xs text-muted-foreground">IDE'ye yönlendiriliyorsunuz...</p>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground mb-2">E-postanızı Doğrulayın</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">{email}</span> adresine doğrulama bağlantısı gönderdik.
                  Lütfen e-postanızı kontrol edin ve bağlantıya tıklayın.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckNow}
                  disabled={checking}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/80 disabled:opacity-60 transition-all"
                >
                  {checking
                    ? <><Loader2 size={14} className="animate-spin" /> Kontrol ediliyor...</>
                    : <><CheckCircle2 size={14} /> Doğrulandı mı kontrol et</>
                  }
                </button>

                <button
                  onClick={handleResend}
                  disabled={resending || resent}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-muted border border-border text-foreground rounded-lg text-sm font-medium hover:bg-white/5 disabled:opacity-60 transition-all"
                >
                  {resending
                    ? <><Loader2 size={14} className="animate-spin" /> Gönderiliyor...</>
                    : resent
                    ? <><CheckCircle2 size={14} className="text-accent" /> Tekrar gönderildi!</>
                    : <><RefreshCw size={14} /> E-postayı tekrar gönder</>
                  }
                </button>

                <button
                  onClick={() => setLocation('/login')}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={12} /> Giriş sayfasına dön
                </button>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  E-posta gelmedi mi? <strong className="text-foreground">Spam klasörünü</strong> kontrol edin
                  ya da yukarıdaki butona tıklayarak yeniden gönderin.
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
