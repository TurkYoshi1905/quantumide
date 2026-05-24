# QuantumIDE

Puter SDK tabanlı, AI destekli bulut geliştirme ortamı. Kullanıcılar metin yazarak sıfırdan proje başlatabilir, AI ile sohbet ederek kod yazabilir, Monaco editörüyle dosyaları düzenleyebilir ve projelerini doğrudan tarayıcıdan yönetebilir.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API sunucusunu başlat (port 5000)
- `pnpm --filter @workspace/quantum-ide run dev` — Frontend geliştirme sunucusu
- `pnpm run typecheck` — Tüm paketler için tip kontrolü
- `pnpm run build` — Tip kontrolü + derleme

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion
- Editör: Monaco Editor (@monaco-editor/react)
- Paneller: react-resizable-panels
- Routing: wouter
- State: React Context + localStorage
- AI: OpenAI, Anthropic, Gemini, Mistral doğrudan API çağrısı
- Puter SDK: window.puter (bulut OS entegrasyonu için hazır)

## Where things live

- `artifacts/quantum-ide/src/App.tsx` — Router ve auth guard
- `artifacts/quantum-ide/src/contexts/AppContext.tsx` — Global state (projeler, dosyalar, ayarlar, mesajlar)
- `artifacts/quantum-ide/src/components/Sidebar.tsx` — Sol panel: proje/dosya yönetimi
- `artifacts/quantum-ide/src/components/EditorPanel.tsx` — Orta panel: Monaco editör + önizleme
- `artifacts/quantum-ide/src/components/AIPanel.tsx` — Sağ panel: AI sohbet
- `artifacts/quantum-ide/src/components/VibeCodingModal.tsx` — VibeCoding (Text-to-App) modal
- `artifacts/quantum-ide/src/lib/ai.ts` — AI model entegrasyonları
- `artifacts/quantum-ide/src/pages/Login.tsx` — Giriş sayfası
- `artifacts/quantum-ide/src/pages/Settings.tsx` — Ayarlar (AI anahtarları, GitHub, görünüm)

## Architecture decisions

- Tüm UI tamamen Türkçe
- localStorage tabanlı state — Puter SDK ile değiştirilebilir yapıda tasarlandı
- AI API çağrıları doğrudan tarayıcıdan yapılır (API key gerektiren modeller için)
- API key yoksa akıllı demo yanıtlar üretilir
- Monaco Editor "vs-dark" teması, JetBrains Mono yazı tipi
- Elektrik moru (#7c3aed) + neon yeşil (#10b981) vurgu renk paleti

## Product

- Giriş/kayıt ekranı (basit mock auth, Google/Puter auth için hazır)
- Üç panel IDE: sol (proje/dosya ağacı), orta (Monaco editör + HTML önizleme), sağ (AI chat)
- AI model seçimi: GPT-4o, Claude 3.5, Gemini 1.5, Mistral Large
- API anahtarı yönetimi (Ayarlar > AI Modelleri)
- VibeCoding: "Text-to-App" özelliği
- Dosya animasyonları (framer-motion): yeni dosya parlama, kaydetme flash
- GitHub token bağlantısı (Ayarlar > GitHub)
- Sağ tıklama ile bağlam menüsü, yeniden boyutlandırılabilir paneller

## User preferences

- Dil: Türkçe (arayüz, açıklamalar, kullanıcı iletişimi)
- Koyu tema (dark mode) zorunlu
- Emojisiz arayüz

## Gotchas

- Anthropic API doğrudan tarayıcıdan CORS kısıtlamalarına takılabilir
- Puter SDK `<script src="https://js.puter.com/v2/"></script>` index.html'de
- localStorage'daki veriler `qide_projects`, `qide_user`, `qide_settings` anahtarlarında tutulur
