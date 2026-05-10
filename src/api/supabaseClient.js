import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return profile ? { ...user, ...profile } : user;
}

export async function signOut() {
  return supabase.auth.signOut();
}

export const db = {
  async list(table, { filter = {}, order = 'created_at', ascending = false, limit = null } = {}) {
    let query = supabase.from(table).select('*').order(order, { ascending });
    Object.entries(filter).forEach(([key, value]) => { query = query.eq(key, value); });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  async get(table, id) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  async create(table, row) {
    const { data, error } = await supabase.from(table).insert(row).select().single();
    if (error) throw error;
    return data;
  },
  async update(table, id, updates) {
    const { data, error } = await supabase.from(table).update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  async filter(table, conditions = {}, { order = 'created_at', ascending = false, limit = null } = {}) {
    let query = supabase.from(table).select('*').order(order, { ascending });
    Object.entries(conditions).forEach(([key, value]) => {
      Array.isArray(value) ? query = query.in(key, value) : query = query.eq(key, value);
    });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
};