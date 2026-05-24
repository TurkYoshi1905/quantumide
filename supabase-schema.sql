-- ═══════════════════════════════════════════════════════════════════════════
-- QuantumIDE — Supabase SQL Şeması (Ayrı Tablolar)
-- Supabase SQL Editor'da çalıştır:
-- https://supabase.com/dashboard/project/blifnflcwuadrryntskw/sql/new
--
-- Bu dosya idempotent'tır — birden fazla kez güvenle çalıştırılabilir.
-- Her tablo ayrı olduğu için veriyi kolayca tespit edebilirsin.
-- ═══════════════════════════════════════════════════════════════════════════

-- UUID desteğini etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- YARDIMCI FONKSİYON — updated_at otomatik güncelle
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLO 1: PROFILES — Kullanıcı profilleri
-- Kayıt olunca otomatik oluşur (trigger ile)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profil güncellenince tarih otomatik değişsin
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Güvenlik: her kullanıcı sadece kendi profilini görebilir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Kullanici kendi profilini okuyabilir" ON profiles;
DROP POLICY IF EXISTS "Kullanici kendi profilini olusturabilir" ON profiles;
DROP POLICY IF EXISTS "Kullanici kendi profilini guncelleyebilir" ON profiles;
CREATE POLICY "Kullanici kendi profilini okuyabilir"    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Kullanici kendi profilini olusturabilir" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Kullanici kendi profilini guncelleyebilir" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Yeni kullanıcı kayıt olunca profil otomatik oluşsun
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
-- TABLO 2: PROJECTS — Projeler ve dosyalar
-- Her proje dosya ağacını JSON olarak içinde taşır
-- Örnek: SELECT * FROM projects WHERE user_id = auth.uid();
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Proje adı
  name        TEXT NOT NULL DEFAULT 'Yeni Proje',
  -- Dosya ağacı: [{ id, name, type, content, children }]
  files       JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hızlı sorgu için index
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated  ON projects(user_id, updated_at DESC);

-- Proje güncellenince tarih otomatik değişsin
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Güvenlik: her kullanıcı sadece kendi projelerini görebilir
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Kullanici kendi projelerini okuyabilir" ON projects;
DROP POLICY IF EXISTS "Kullanici kendi projelerini olusturabilir" ON projects;
DROP POLICY IF EXISTS "Kullanici kendi projelerini guncelleyebilir" ON projects;
DROP POLICY IF EXISTS "Kullanici kendi projelerini silebilir" ON projects;
CREATE POLICY "Kullanici kendi projelerini okuyabilir"       ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi projelerini olusturabilir"    ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi projelerini guncelleyebilir"  ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi projelerini silebilir"        ON projects FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLO 3: CONVERSATIONS — AI Sohbetleri
-- Her sohbet mesaj dizisini JSON olarak içinde taşır
-- Örnek: SELECT id, title, updated_at FROM conversations WHERE user_id = auth.uid();
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Sohbet başlığı (ilk mesajdan otomatik oluşur)
  title       TEXT NOT NULL DEFAULT 'Yeni Sohbet',
  -- Mesaj dizisi: [{ id, role, content, timestamp }]
  messages    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hızlı sorgu için index
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated  ON conversations(user_id, updated_at DESC);

-- Sohbet güncellenince tarih otomatik değişsin
DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations;
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Güvenlik: her kullanıcı sadece kendi sohbetlerini görebilir
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Kullanici kendi sohbetlerini okuyabilir" ON conversations;
DROP POLICY IF EXISTS "Kullanici kendi sohbetlerini olusturabilir" ON conversations;
DROP POLICY IF EXISTS "Kullanici kendi sohbetlerini guncelleyebilir" ON conversations;
DROP POLICY IF EXISTS "Kullanici kendi sohbetlerini silebilir" ON conversations;
CREATE POLICY "Kullanici kendi sohbetlerini okuyabilir"       ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi sohbetlerini olusturabilir"    ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi sohbetlerini guncelleyebilir"  ON conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi sohbetlerini silebilir"        ON conversations FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLO 4: API_KEYS — Kullanıcıların AI API Anahtarları
-- OpenAI, Anthropic, Google, Mistral, DeepSeek vb.
-- Örnek: SELECT provider, label FROM api_keys WHERE user_id = auth.uid();
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Hangi sağlayıcı: openai, anthropic, google, mistral, deepseek vb.
  provider     TEXT NOT NULL,
  -- Kullanıcının verdiği isim (örn: "İş OpenAI Anahtarı")
  label        TEXT NOT NULL DEFAULT '',
  -- Şifrelenmiş API anahtarı (production'da Vault kullanılması önerilir)
  key_value    TEXT NOT NULL,
  -- Bu anahtar aktif mi?
  is_active    BOOLEAN NOT NULL DEFAULT true,
  added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Aynı kullanıcı aynı provider için birden fazla anahtar ekleyebilir
  UNIQUE (user_id, id)
);

-- Hızlı sorgu için index
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id  ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(user_id, provider);

-- API anahtarı güncellenince tarih otomatik değişsin
DROP TRIGGER IF EXISTS trg_api_keys_updated_at ON api_keys;
CREATE TRIGGER trg_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Güvenlik: her kullanıcı sadece kendi API anahtarlarını görebilir
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Kullanici kendi api keylerini okuyabilir" ON api_keys;
DROP POLICY IF EXISTS "Kullanici kendi api keylerini olusturabilir" ON api_keys;
DROP POLICY IF EXISTS "Kullanici kendi api keylerini guncelleyebilir" ON api_keys;
DROP POLICY IF EXISTS "Kullanici kendi api keylerini silebilir" ON api_keys;
CREATE POLICY "Kullanici kendi api keylerini okuyabilir"       ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi api keylerini olusturabilir"    ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi api keylerini guncelleyebilir"  ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi api keylerini silebilir"        ON api_keys FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLO 5: GITHUB_INTEGRATIONS — GitHub Entegrasyonu
-- Her kullanıcının GitHub token ve repo bilgilerini tutar
-- Örnek: SELECT username, repo FROM github_integrations WHERE user_id = auth.uid();
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS github_integrations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- GitHub Personal Access Token (PAT)
  token           TEXT NOT NULL DEFAULT '',
  -- GitHub kullanıcı adı
  username        TEXT NOT NULL DEFAULT '',
  -- Varsayılan repo (örn: kullanici/repo-adi)
  default_repo    TEXT NOT NULL DEFAULT '',
  -- Varsayılan branch (genellikle main)
  default_branch  TEXT NOT NULL DEFAULT 'main',
  -- Bağlantı aktif mi?
  is_connected    BOOLEAN NOT NULL DEFAULT false,
  -- Son sync tarihi
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Her kullanıcının sadece bir GitHub entegrasyonu olabilir
  UNIQUE (user_id)
);

-- Hızlı sorgu için index
CREATE INDEX IF NOT EXISTS idx_github_user_id ON github_integrations(user_id);

-- GitHub entegrasyonu güncellenince tarih otomatik değişsin
DROP TRIGGER IF EXISTS trg_github_updated_at ON github_integrations;
CREATE TRIGGER trg_github_updated_at
  BEFORE UPDATE ON github_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Güvenlik: her kullanıcı sadece kendi GitHub entegrasyonunu görebilir
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Kullanici kendi github entegrasyonunu okuyabilir" ON github_integrations;
DROP POLICY IF EXISTS "Kullanici kendi github entegrasyonunu olusturabilir" ON github_integrations;
DROP POLICY IF EXISTS "Kullanici kendi github entegrasyonunu guncelleyebilir" ON github_integrations;
DROP POLICY IF EXISTS "Kullanici kendi github entegrasyonunu silebilir" ON github_integrations;
CREATE POLICY "Kullanici kendi github entegrasyonunu okuyabilir"       ON github_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi github entegrasyonunu olusturabilir"    ON github_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi github entegrasyonunu guncelleyebilir"  ON github_integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi github entegrasyonunu silebilir"        ON github_integrations FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLO 6: USER_SETTINGS — Editor ve uygulama ayarları
-- Font boyutu, tema, aktif model vb.
-- Örnek: SELECT * FROM user_settings WHERE user_id = auth.uid();
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Editor ayarları
  editor_font_size  INTEGER NOT NULL DEFAULT 14,
  -- Aktif AI modeli
  active_model      TEXT NOT NULL DEFAULT 'gpt-4o',
  -- Puter bağlı mı?
  puter_connected   BOOLEAN NOT NULL DEFAULT false,
  -- Aktif API key ID
  active_key_id     TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ayarlar güncellenince tarih otomatik değişsin
DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON user_settings;
CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Güvenlik: her kullanıcı sadece kendi ayarlarını görebilir
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Kullanici kendi ayarlarini okuyabilir" ON user_settings;
DROP POLICY IF EXISTS "Kullanici kendi ayarlarini olusturabilir" ON user_settings;
DROP POLICY IF EXISTS "Kullanici kendi ayarlarini guncelleyebilir" ON user_settings;
CREATE POLICY "Kullanici kendi ayarlarini okuyabilir"       ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi ayarlarini olusturabilir"    ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi ayarlarini guncelleyebilir"  ON user_settings FOR UPDATE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- GERIYE DÖNÜK UYUMLULUK — Eski user_data tablosu (varsa koru)
-- Eski veri varsa bu tablo üzerinden okunmaya devam edilir
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

CREATE INDEX IF NOT EXISTS idx_user_data_user_id  ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_key ON user_data(user_id, key);

DROP TRIGGER IF EXISTS trg_user_data_updated_at ON user_data;
CREATE TRIGGER trg_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Kullanici kendi datasini okuyabilir" ON user_data;
DROP POLICY IF EXISTS "Kullanici kendi datasini olusturabilir" ON user_data;
DROP POLICY IF EXISTS "Kullanici kendi datasini guncelleyebilir" ON user_data;
DROP POLICY IF EXISTS "Kullanici kendi datasini silebilir" ON user_data;
CREATE POLICY "Kullanici kendi datasini okuyabilir"       ON user_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi datasini olusturabilir"    ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi datasini guncelleyebilir"  ON user_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi datasini silebilir"        ON user_data FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- DOĞRULAMA — Kurulum başarılı mı?
-- SQL çalıştırınca burada "NOTICE" mesajları göreceksin
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  tbl TEXT;
  missing_tables TEXT[] := ARRAY[]::TEXT[];
  required_tables TEXT[] := ARRAY['profiles','projects','conversations','api_keys','github_integrations','user_settings','user_data'];
BEGIN
  FOREACH tbl IN ARRAY required_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      missing_tables := array_append(missing_tables, tbl);
    ELSE
      RAISE NOTICE '✅ Tablo hazır: %', tbl;
    END IF;
  END LOOP;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION '❌ Şu tablolar oluşturulamadı: %', array_to_string(missing_tables, ', ');
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🚀 QuantumIDE şeması başarıyla kuruldu! 7 tablo aktif.';
  RAISE NOTICE '👉 Sonraki adım: Authentication > Settings > Enable email confirmations';
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLO ÖZETI — Hangi tabloda ne var?
-- ─────────────────────────────────────────────────────────────────────────────
--
-- profiles           → Kullanıcı adı, avatar (kayıt olunca otomatik oluşur)
-- projects           → Projeler + dosya ağacı (JSONB)
-- conversations      → AI sohbetleri + mesaj dizisi (JSONB)
-- api_keys           → OpenAI, Anthropic, Google vb. anahtarlar
-- github_integrations → GitHub PAT, kullanıcı adı, repo, branch
-- user_settings      → Editor font, aktif model, Puter durumu
-- user_data          → Eski format (geriye dönük uyumluluk)
