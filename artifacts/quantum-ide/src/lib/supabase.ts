import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://blifnflcwuadrryntskw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaWZuZmxjd3VhZHJyeW50c2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDc5MzEsImV4cCI6MjA5NDA4MzkzMX0.vu8TBlqja1e_3KOtYTc-OWdy1Arqepb0Pi9UF4fRhP0';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_ANON_KEY) return null;
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

export async function supabaseSignUp(email: string, password: string, fullName: string) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase yapılandırılmamış. VITE_SUPABASE_ANON_KEY eksik.');
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function supabaseSignIn(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase yapılandırılmamış. VITE_SUPABASE_ANON_KEY eksik.');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function supabaseSignOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

export async function supabaseGetSession() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

export async function supabaseSaveProjects(userId: string, projects: any[]) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('user_data').upsert({
      user_id: userId,
      key: 'projects',
      value: JSON.stringify(projects),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,key' });
  } catch { /* silent */ }
}

export async function supabaseLoadProjects(userId: string): Promise<any[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.from('user_data')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'projects')
      .single();
    if (data?.value) return JSON.parse(data.value);
    return null;
  } catch { return null; }
}

export async function supabaseSaveConversations(userId: string, conversations: any[]) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('user_data').upsert({
      user_id: userId,
      key: 'conversations',
      value: JSON.stringify(conversations),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,key' });
  } catch { /* silent */ }
}

export async function supabaseLoadConversations(userId: string): Promise<any[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.from('user_data')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'conversations')
      .single();
    if (data?.value) return JSON.parse(data.value);
    return null;
  } catch { return null; }
}

export async function supabaseSaveSettings(userId: string, settings: any) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const safe = { ...settings };
    await sb.from('user_data').upsert({
      user_id: userId,
      key: 'settings',
      value: JSON.stringify(safe),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,key' });
  } catch { /* silent */ }
}

export async function supabaseLoadSettings(userId: string): Promise<any | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.from('user_data')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'settings')
      .single();
    if (data?.value) return JSON.parse(data.value);
    return null;
  } catch { return null; }
}

export async function supabaseLoadAllData(userId: string) {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.from('user_data')
      .select('key,value')
      .eq('user_id', userId);
    if (!data) return null;
    const result: Record<string, any> = {};
    for (const row of data) {
      try { result[row.key] = JSON.parse(row.value); } catch { /* skip */ }
    }
    return result;
  } catch { return null; }
}
