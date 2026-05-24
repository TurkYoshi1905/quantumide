# QuantumIDE

Yapay Zeka destekli bulut tabanlı IDE — dark purple tema, Türkçe arayüz, Puter + Supabase entegrasyonu.

## Run & Operate

- `pnpm --filter @workspace/quantum-ide run dev` — IDE'yi başlat (port dinamik)
- `pnpm run typecheck` — tüm paketlerde TypeScript kontrolü
- `pnpm run build` — typecheck + build
- `./github-sync.sh` — projeyi GitHub'a senkronize et (GITHUB_PAT ve GITHUB_REPO gerekli)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- UI: React 19, Vite, Tailwind v4, framer-motion, wouter, lucide-react
- Editor: Monaco Editor (react-resizable-panels)
- AI: Puter SDK (ücretsiz), OpenAI, Anthropic, Google, Mistral, DeepSeek, Perplexity, Vercel API
- Auth/DB: Supabase (email+password, e-posta doğrulama), IndexedDB (offline fallback)
- Storage: @supabase/supabase-js, IndexedDB (lib/db.ts)

## Where things live

- `artifacts/quantum-ide/src/` — tüm frontend kaynak kodu
- `artifacts/quantum-ide/src/pages/` — Login, Register, IDE, Settings, VerifyEmail
- `artifacts/quantum-ide/src/components/` — AIPanel, Sidebar, EditorPanel, ShellPanel
- `artifacts/quantum-ide/src/contexts/AppContext.tsx` — merkezi state (projeler, sohbetler, ayarlar)
- `artifacts/quantum-ide/src/lib/supabase.ts` — Supabase client + sync fonksiyonları
- `artifacts/quantum-ide/src/lib/ai.ts` — AI provider entegrasyonları
- `artifacts/quantum-ide/src/types/index.ts` — TypeScript tip tanımları
- `supabase-schema.sql` — Supabase SQL şeması (Dashboard'da çalıştır)
- `github-sync.sh` — GitHub senkronizasyon scripti

## Architecture decisions

- Supabase yoksa (VITE_SUPABASE_ANON_KEY boş) IndexedDB+localStorage fallback'e geçer — uygulama her zaman çalışır
- activeProject, projects state'inden derive edilir (real-time sidebar güncellemeleri)
- Sohbetler (Conversation[]) mesajları içinde taşır — ayrı messages state yok
- AI provider listesi 'vercel' dahil tüm sağlayıcıları kapsar — "Demo modu" artık doğru
- Shell paneli Puter SDK varsa puter.shell.exec() ile gerçek komutlar çalıştırabilir

## Product

- Çoklu proje ve dosya yönetimi (folder/file tree)
- AI chat asistan — sohbet geçmişi, yeni sohbet, yeniden adlandırma, silme
- Dosya işlem ikonları: FilePlus (oluştur), FilePen (düzenle), FileMinus (sil)
- Shell terminal paneli (editor ile split view)
- Supabase ile kalıcı veri: projeler, sohbetler, API anahtarları, ayarlar
- E-posta doğrulama akışı (kayıt sonrası /verify-email sayfası)
- GitHub sync script (GITHUB_PAT ile)

## User preferences

- Türkçe UI
- Dark purple tema (#7c3aed primary)
- Puter birincil AI kaynağı (ücretsiz)

## Gotchas

- VITE_SUPABASE_ANON_KEY environment variable tanımlanmazsa Supabase devre dışı, yerel auth aktif
- E-posta doğrulama için Supabase Dashboard > Auth > Settings'de "Enable email confirmations" açık olmalı
- `supabase-schema.sql`'i Supabase SQL Editor'da bir kez çalıştır

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
