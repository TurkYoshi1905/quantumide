import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, X, Sparkles, Zap } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const EXAMPLE_PROMPTS = [
  "Basit bir hesap makinesi oluştur, HTML CSS ve JavaScript kullan",
  "Todo listesi uygulaması yap, ekle/sil/tamamla özellikleriyle",
  "Kişisel portföy sayfası oluştur, animasyonlar ekle",
  "Basit bir not alma uygulaması yap, localStorage ile kaydet",
  "Güzel bir hava durumu widget'ı tasarla",
  "Zaman sayacı (countdown timer) uygulaması oluştur",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
}

export default function VibeCodingModal({ open, onClose, onSend }: Props) {
  const [prompt, setPrompt] = useState('');
  const { createFile, activeProject } = useApp();

  const handleCreate = () => {
    if (!prompt.trim()) return;
    const fullPrompt = `VibeCoding isteği: ${prompt}\n\nLütfen bu uygulamayı oluşturmak için gerekli HTML, CSS ve JavaScript kodlarını yaz. Her dosya için ayrı kod bloğu kullan ve hangi dosyaya ait olduğunu belirt.`;
    onSend(fullPrompt);

    // Animate file creation
    if (activeProject) {
      const files = [
        { name: 'index.html', content: '<!-- Oluşturuluyor... -->' },
        { name: 'style.css', content: '/* Oluşturuluyor... */' },
        { name: 'script.js', content: '// Oluşturuluyor...' },
      ];
      files.forEach((f, i) => {
        setTimeout(() => {
          createFile(activeProject.id, null, f.name, 'file');
        }, i * 300);
      });
    }

    setPrompt('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="w-full max-w-lg bg-card border border-primary/30 rounded-2xl shadow-2xl overflow-hidden quantum-glow"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Wand2 size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">VibeCoding</h2>
                  <p className="text-xs text-muted-foreground">Hayalini kodla — gerisini biz halledelim</p>
                </div>
                <button
                  data-testid="btn-close-vibecoding"
                  onClick={onClose}
                  className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Ne yapmak istiyorsunuz?
              </label>
              <textarea
                data-testid="input-vibecoding-prompt"
                autoFocus
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleCreate(); }}
                placeholder="Örn: Müzik çalar uygulaması yap, oynatma listesi ve ilerleme çubuğu olsun..."
                rows={4}
                className="w-full px-3 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none transition-colors"
              />

              {/* Examples */}
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Sparkles size={11} /> Örnek istemler
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {EXAMPLE_PROMPTS.map((ex, i) => (
                    <button
                      key={i}
                      data-testid={`example-prompt-${i}`}
                      onClick={() => setPrompt(ex)}
                      className="text-left px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent hover:border-border transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                data-testid="btn-cancel-vibecoding"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 border border-border transition-colors"
              >
                Vazgeç
              </button>
              <button
                data-testid="btn-create-vibecoding"
                onClick={handleCreate}
                disabled={!prompt.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Zap size={14} /> Oluştur
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
