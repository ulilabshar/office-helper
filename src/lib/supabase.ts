import { createClient } from '@supabase/supabase-js';

// ─── Supabase Client ─────────────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const hasSupabaseConfig =
  supabaseUrl &&
  supabaseUrl !== '' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'PLACEHOLDER_ANON_KEY';

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseReady = hasSupabaseConfig;

// ─── TypeScript Interfaces matching the DB schema ─────────────────────────────

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  role: 'admin' | 'superadmin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  description?: string;
  icon: string;
  available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  device_count?: number; // virtual, computed via join
}

export interface DeviceRow {
  id: string;
  category_id: string;
  nama_perangkat: string;
  deskripsi_singkat?: string;
  status: 'Ready' | 'Maintenance' | 'New';
  fitur_kunci?: string;
  tambah_os: string[];
  image_url?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // joined
  categories?: Category;
}

export interface Section {
  id: string;
  device_id: string;
  title: string;
  tab_label?: string;
  icon_name: string;
  badge?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Step {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  konten_windows?: string;
  konten_mac?: string;
  os_target: 'all' | 'windows' | 'mac';
  code_snippet?: string;
  warning?: string;
  tip?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  device_id?: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  username?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'AUTH' | 'SYSTEM';
  target: string;
  description?: string;
  ip_address?: string;
  created_at: string;
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/** Find the email for a given username by querying profiles */
export async function getEmailByUsername(username: string): Promise<string | null> {
  if (!supabase) return null;
  // profiles.id == auth.users.id, and auth.users has email
  // We stored username in profiles; we need to join with auth.users.
  // Approach: select profile, then use the id to look up session email.
  // Simpler: store email in profiles too, OR ask user to enter email directly.
  // For now, assume username IS the email prefix: username@supabase-domain.
  // The actual approach: query profiles where username = input, get id,
  // then try signInWithPassword using the stored email from user_metadata.
  // We'll handle this in AuthContext by trying username as email directly.
  return null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) return null;
  return data as Profile;
}

// ─── Categories CRUD ──────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as Category[]) ?? [];
}

export async function createCategory(cat: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('categories').insert(cat).select().single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ─── Devices CRUD ─────────────────────────────────────────────────────────────

export async function getDevices(): Promise<DeviceRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('devices')
    .select('*, categories(id, slug, title, icon)')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as DeviceRow[]) ?? [];
}

export async function getDeviceById(id: string): Promise<DeviceRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('devices')
    .select('*, categories(*)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as DeviceRow;
}

export async function createDevice(device: Omit<DeviceRow, 'id' | 'created_at' | 'updated_at' | 'categories'>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('devices').insert(device).select().single();
  if (error) throw error;
  return data as DeviceRow;
}

export async function updateDevice(id: string, updates: Partial<Omit<DeviceRow, 'id' | 'created_at' | 'updated_at' | 'categories'>>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('devices').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as DeviceRow;
}

export async function deleteDevice(id: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('devices').delete().eq('id', id);
  if (error) throw error;
}

// ─── Sections CRUD ────────────────────────────────────────────────────────────

export async function getSectionsByDevice(deviceId: string): Promise<Section[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('device_id', deviceId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as Section[]) ?? [];
}

export async function createSection(section: Omit<Section, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('sections').insert(section).select().single();
  if (error) throw error;
  return data as Section;
}

export async function updateSection(id: string, updates: Partial<Omit<Section, 'id' | 'created_at' | 'updated_at'>>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('sections').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Section;
}

export async function deleteSection(id: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('sections').delete().eq('id', id);
  if (error) throw error;
}

// ─── Steps CRUD ───────────────────────────────────────────────────────────────

export async function getStepsBySection(sectionId: string): Promise<Step[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .eq('section_id', sectionId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as Step[]) ?? [];
}

export async function createStep(step: Omit<Step, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('steps').insert(step).select().single();
  if (error) throw error;
  return data as Step;
}

export async function updateStep(id: string, updates: Partial<Omit<Step, 'id' | 'created_at' | 'updated_at'>>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('steps').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Step;
}

export async function deleteStep(id: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('steps').delete().eq('id', id);
  if (error) throw error;
}

// ─── FAQs CRUD ────────────────────────────────────────────────────────────────

export async function getFAQs(deviceId?: string): Promise<FAQ[]> {
  if (!supabase) return [];
  let query = supabase.from('faqs').select('*').order('sort_order', { ascending: true });
  if (deviceId) {
    query = query.eq('device_id', deviceId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as FAQ[]) ?? [];
}

export async function createFAQ(faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('faqs').insert(faq).select().single();
  if (error) throw error;
  return data as FAQ;
}

export async function updateFAQ(id: string, updates: Partial<Omit<FAQ, 'id' | 'created_at' | 'updated_at'>>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('faqs').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as FAQ;
}

export async function deleteFAQ(id: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) throw error;
}

// ─── Activity Logs ────────────────────────────────────────────────────────────

export async function getActivityLogs(limit = 50): Promise<ActivityLog[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as ActivityLog[]) ?? [];
}

export async function logActivity(
  log: Omit<ActivityLog, 'id' | 'created_at'>
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('activity_logs').insert(log);
  if (error) console.error('Failed to write activity log:', error.message);
}
