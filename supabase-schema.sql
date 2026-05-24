-- ═══════════════════════════════════════════════════════════════════════════
-- QuantumIDE — Supabase SQL Şeması
-- Supabase SQL Editor'da çalıştır:
-- https://supabase.com/dashboard/project/blifnflcwuadrryntskw/sql/new
--
-- Bu dosya idempotent'tır: birden fazla kez çalıştırılabilir.
-- ═══════════════════════════════════════════════════════════════════════════

-- UUID desteği
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES — Kullanıcı profili (kayıt olunca otomatik oluşur)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes kendi profilini görebilir" ON profiles;
CREATE POLICY "Herkes kendi profilini görebilir"
  ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Kullanici kendi profilini olusturabilir" ON profiles;
CREATE POLICY "Kullanici kendi profilini olusturabilir"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Kullanici kendi profilini guncelleyebilir" ON profiles;
CREATE POLICY "Kullanici kendi profilini guncelleyebilir"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. USER_DATA — Tüm uygulama verisi (key-value JSON depo)
--    key='projects'      → Projeler + dosyalar
--    key='conversations' → AI sohbetleri
--    key='settings'      → API anahtarları, GitHub token, editor ayarları
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_data (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       TEXT NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, key)
);

CREATE INDEX IF NOT EXISTS idx_user_data_user_id     ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_key    ON user_data(user_id, key);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanici kendi verisini okuyabilir" ON user_data;
CREATE POLICY "Kullanici kendi verisini okuyabilir"
  ON user_data FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanici kendi verisini ekleyebilir" ON user_data;
CREATE POLICY "Kullanici kendi verisini ekleyebilir"
  ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanici kendi verisini guncelleyebilir" ON user_data;
CREATE POLICY "Kullanici kendi verisini guncelleyebilir"
  ON user_data FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanici kendi verisini silebilir" ON user_data;
CREATE POLICY "Kullanici kendi verisini silebilir"
  ON user_data FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TRIGGER — updated_at otomatik güncelle
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_data_updated_at ON user_data;
CREATE TRIGGER trg_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TRIGGER — Yeni kullanıcı kayıt olunca profil oluştur
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. DOĞRULAMA — Kurulum başarılı mı kontrol et
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- user_data tablosu var mı?
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_data') THEN
    RAISE NOTICE '✅ user_data tablosu hazır';
  ELSE
    RAISE EXCEPTION '❌ user_data tablosu oluşturulamadı!';
  END IF;

  -- profiles tablosu var mı?
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE NOTICE '✅ profiles tablosu hazır';
  ELSE
    RAISE EXCEPTION '❌ profiles tablosu oluşturulamadı!';
  END IF;

  RAISE NOTICE '✅ QuantumIDE Supabase şeması başarıyla kuruldu!';
  RAISE NOTICE '👉 Sonraki adım: Supabase Dashboard > Authentication > Settings > Enable email confirmations';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. VERİ YAPISI REFERANSI
-- ─────────────────────────────────────────────────────────────────────────────
--
-- key = 'projects'  →  JSON Array:
-- [
--   {
--     "id": "proj-xxx",
--     "name": "Proje Adı",
--     "files": [
--       { "id": "f-xxx", "name": "index.ts", "type": "file", "content": "..." },
--       { "id": "f-yyy", "name": "src", "type": "folder", "children": [...] }
--     ]
--   }
-- ]
--
-- key = 'conversations'  →  JSON Array:
-- [
--   {
--     "id": "conv-xxx",
--     "title": "Sohbet Adı",
--     "messages": [
--       { "id": "m-xxx", "role": "user", "content": "...", "timestamp": 1234567890 },
--       { "id": "m-yyy", "role": "assistant", "content": "...", "timestamp": 1234567891 }
--     ],
--     "createdAt": 1234567890,
--     "updatedAt": 1234567891
--   }
-- ]
--
-- key = 'settings'  →  JSON Object:
-- {
--   "ai": { "activeModel": "gpt-4o", "puterConnected": false },
--   "github": { "connected": false, "token": "ghp_xxx", "username": "..." },
--   "editorFontSize": 14,
--   "systemPrompt": "...",
--   "activeKeyId": "key-xxx",
--   "apiKeys": [
--     { "id": "key-xxx", "label": "OpenAI", "provider": "openai", "key": "sk-..." }
--   ]
-- }
