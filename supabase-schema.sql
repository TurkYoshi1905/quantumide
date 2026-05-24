-- =============================================================================
-- QuantumIDE — Supabase SQL Schema (Separate Tables)
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/blifnflcwuadrryntskw/sql/new
--
-- This file is idempotent — safe to run multiple times.
-- Each concern lives in its own table for easy identification.
-- =============================================================================

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- HELPER FUNCTION — Auto-update the updated_at column on every row change
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- TABLE 1: PROFILES — User profiles
-- Created automatically when a new user registers (via trigger)
-- Query example: SELECT * FROM profiles WHERE id = auth.uid();
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update timestamp on profile changes
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security: each user can only access their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile"  ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Automatically create a profile row when a new user signs up
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


-- =============================================================================
-- TABLE 2: PROJECTS — Projects and their file trees
-- Each project stores its entire file tree as a JSONB array
-- Query example: SELECT id, name, updated_at FROM projects WHERE user_id = auth.uid();
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Human-readable project name
  name        TEXT NOT NULL DEFAULT 'New Project',
  -- File tree: [{ id, name, type, content, children }]
  files       JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast user-scoped queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated  ON projects(user_id, updated_at DESC);

-- Auto-update timestamp when a project is saved
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security: each user can only access their own projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own projects"   ON projects;
DROP POLICY IF EXISTS "Users can create own projects"  ON projects;
DROP POLICY IF EXISTS "Users can update own projects"  ON projects;
DROP POLICY IF EXISTS "Users can delete own projects"  ON projects;
CREATE POLICY "Users can read own projects"   ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects"  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects"  ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects"  ON projects FOR DELETE USING (auth.uid() = user_id);


-- =============================================================================
-- TABLE 3: CONVERSATIONS — AI Chat conversations
-- Each conversation stores its full message history as a JSONB array
-- Query example: SELECT id, title, updated_at FROM conversations WHERE user_id = auth.uid();
-- =============================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Title auto-generated from the first message
  title       TEXT NOT NULL DEFAULT 'New Conversation',
  -- Message array: [{ id, role, content, timestamp }]
  messages    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast user-scoped queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated  ON conversations(user_id, updated_at DESC);

-- Auto-update timestamp when a conversation is saved
DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations;
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security: each user can only access their own conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own conversations"   ON conversations;
DROP POLICY IF EXISTS "Users can create own conversations"  ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations"  ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations"  ON conversations;
CREATE POLICY "Users can read own conversations"   ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations"  ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations"  ON conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations"  ON conversations FOR DELETE USING (auth.uid() = user_id);


-- =============================================================================
-- TABLE 4: API_KEYS — Per-user AI provider API keys
-- Stores keys for OpenAI, Anthropic, Google, Mistral, DeepSeek, etc.
-- Query example: SELECT provider, label FROM api_keys WHERE user_id = auth.uid();
-- =============================================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Provider identifier: openai | anthropic | google | mistral | deepseek | perplexity
  provider     TEXT NOT NULL,
  -- User-assigned label (e.g. "Work OpenAI Key")
  label        TEXT NOT NULL DEFAULT '',
  -- The API key value (consider Vault encryption in production)
  key_value    TEXT NOT NULL,
  -- Whether this key is currently active
  is_active    BOOLEAN NOT NULL DEFAULT true,
  added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A user may have multiple keys per provider
  UNIQUE (user_id, id)
);

-- Indexes for fast provider lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id  ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(user_id, provider);

-- Auto-update timestamp when a key is modified
DROP TRIGGER IF EXISTS trg_api_keys_updated_at ON api_keys;
CREATE TRIGGER trg_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security: each user can only access their own API keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own api keys"   ON api_keys;
DROP POLICY IF EXISTS "Users can create own api keys"  ON api_keys;
DROP POLICY IF EXISTS "Users can update own api keys"  ON api_keys;
DROP POLICY IF EXISTS "Users can delete own api keys"  ON api_keys;
CREATE POLICY "Users can read own api keys"   ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own api keys"  ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own api keys"  ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own api keys"  ON api_keys FOR DELETE USING (auth.uid() = user_id);


-- =============================================================================
-- TABLE 5: GITHUB_INTEGRATIONS — Per-user GitHub integration settings
-- Stores the GitHub Personal Access Token, username, repo, and branch
-- Query example: SELECT username, default_repo FROM github_integrations WHERE user_id = auth.uid();
-- =============================================================================
CREATE TABLE IF NOT EXISTS github_integrations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- GitHub Personal Access Token (PAT)
  token           TEXT NOT NULL DEFAULT '',
  -- GitHub username
  username        TEXT NOT NULL DEFAULT '',
  -- Default repository (e.g. username/repo-name)
  default_repo    TEXT NOT NULL DEFAULT '',
  -- Default branch (usually main)
  default_branch  TEXT NOT NULL DEFAULT 'main',
  -- Whether the integration is currently active
  is_connected    BOOLEAN NOT NULL DEFAULT false,
  -- Timestamp of the last successful sync
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Each user can have only one GitHub integration
  UNIQUE (user_id)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_github_user_id ON github_integrations(user_id);

-- Auto-update timestamp when the integration is modified
DROP TRIGGER IF EXISTS trg_github_updated_at ON github_integrations;
CREATE TRIGGER trg_github_updated_at
  BEFORE UPDATE ON github_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security: each user can only access their own GitHub integration
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own github integration"   ON github_integrations;
DROP POLICY IF EXISTS "Users can create own github integration"  ON github_integrations;
DROP POLICY IF EXISTS "Users can update own github integration"  ON github_integrations;
DROP POLICY IF EXISTS "Users can delete own github integration"  ON github_integrations;
CREATE POLICY "Users can read own github integration"   ON github_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own github integration"  ON github_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own github integration"  ON github_integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own github integration"  ON github_integrations FOR DELETE USING (auth.uid() = user_id);


-- =============================================================================
-- TABLE 6: USER_SETTINGS — Editor and application preferences
-- Stores font size, active AI model, Puter connection status, etc.
-- Query example: SELECT * FROM user_settings WHERE user_id = auth.uid();
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Monaco editor font size in pixels
  editor_font_size  INTEGER NOT NULL DEFAULT 14,
  -- Currently selected AI model ID
  active_model      TEXT NOT NULL DEFAULT 'gpt-4o',
  -- Whether Puter free AI is connected
  puter_connected   BOOLEAN NOT NULL DEFAULT false,
  -- ID of the currently active API key (references api_keys.id)
  active_key_id     TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update timestamp when settings are saved
DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON user_settings;
CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security: each user can only access their own settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own settings"   ON user_settings;
DROP POLICY IF EXISTS "Users can create own settings"  ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings"  ON user_settings;
CREATE POLICY "Users can read own settings"   ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own settings"  ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings"  ON user_settings FOR UPDATE USING (auth.uid() = user_id);


-- =============================================================================
-- TABLE 7: USER_DATA — Legacy key-value store (backward compatibility)
-- Kept for reading old data; new data goes into the dedicated tables above
-- Query example: SELECT key, value FROM user_data WHERE user_id = auth.uid();
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_data (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Logical key (e.g. "projects", "conversations", "settings")
  key         TEXT NOT NULL,
  -- JSON-serialized value
  value       TEXT NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, key)
);

-- Indexes for fast key lookups
CREATE INDEX IF NOT EXISTS idx_user_data_user_id  ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_key ON user_data(user_id, key);

-- Auto-update timestamp on every write
DROP TRIGGER IF EXISTS trg_user_data_updated_at ON user_data;
CREATE TRIGGER trg_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security: each user can only access their own legacy data
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own data"   ON user_data;
DROP POLICY IF EXISTS "Users can create own data"  ON user_data;
DROP POLICY IF EXISTS "Users can update own data"  ON user_data;
DROP POLICY IF EXISTS "Users can delete own data"  ON user_data;
CREATE POLICY "Users can read own data"   ON user_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own data"  ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data"  ON user_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data"  ON user_data FOR DELETE USING (auth.uid() = user_id);


-- =============================================================================
-- VALIDATION — Confirm all 7 tables were created successfully
-- You will see NOTICE messages in the SQL Editor output after running
-- =============================================================================
DO $$
DECLARE
  tbl TEXT;
  missing_tables TEXT[] := ARRAY[]::TEXT[];
  required_tables TEXT[] := ARRAY[
    'profiles',
    'projects',
    'conversations',
    'api_keys',
    'github_integrations',
    'user_settings',
    'user_data'
  ];
BEGIN
  FOREACH tbl IN ARRAY required_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      missing_tables := array_append(missing_tables, tbl);
    ELSE
      RAISE NOTICE 'OK — Table ready: %', tbl;
    END IF;
  END LOOP;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'FAILED — The following tables could not be created: %',
      array_to_string(missing_tables, ', ');
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'SUCCESS — QuantumIDE schema installed. 7 tables active.';
  RAISE NOTICE 'Next step: Supabase Dashboard > Authentication > Settings > Enable email confirmations';
END $$;


-- =============================================================================
-- TABLE SUMMARY
-- =============================================================================
--
-- profiles             User display name and avatar (auto-created on signup)
-- projects             Project list with full file tree stored as JSONB
-- conversations        AI chat history with full message array stored as JSONB
-- api_keys             OpenAI, Anthropic, Google, Mistral, DeepSeek keys
-- github_integrations  GitHub PAT, username, default repo and branch
-- user_settings        Editor font size, active model, Puter status
-- user_data            Legacy key-value store (backward compatibility only)
