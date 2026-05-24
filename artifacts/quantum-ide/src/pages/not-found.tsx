import { useLocation } from "wouter";
import { Code2, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center p-8">
      <div>
        <Code2 size={40} className="text-primary/40 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">404 — Sayfa Bulunamadı</h1>
        <p className="text-sm text-muted-foreground mb-6">Aradığınız sayfa mevcut değil.</p>
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm mx-auto hover:bg-primary/80 transition-colors"
        >
          <ArrowLeft size={14} /> Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
}
