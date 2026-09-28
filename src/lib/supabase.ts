import { createClient } from '@supabase/supabase-js';

// ─── Supabase Client ─────────────────────────────────────────────────────────
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://bxcenlvuckyiabsnunxe.supabase.co';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_PBcLgbUSxfaU6QWg7ducaA_yEVcM45P';

const hasSupabaseConfig =
  Boolean(supabaseUrl) &&
  supabaseUrl !== '' &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== 'PLACEHOLDER_ANON_KEY';

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseReady = hasSupabaseConfig;

// ─── TypeScript Interfaces matching the DB schema ─────────────────────────────

export interface Category {
  id: string;
  title: string;
  slug?: string;
  description?: string | null;
  icon: string;
  sort_order: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceRow {
  id: string;
  category_id: string;
  nama_perangkat: string;
  slug?: string;
  deskripsi_singkat?: string | null;
  status: string;
  supported_os?: string[] | null;
  specs?: string[] | null;
  tambah_os?: string[] | null;
  image_url?: string | null;
  faq?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface Step {
  id: string;
  device_id: string;
  title: string;
  description?: string | null;
  konten_windows?: string | null;
  konten_mac?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FaqRow {
  id: string;
  device_id?: string | null;
  question: string;
  answer: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// ─── UUID & Seeder Helpers ───────────────────────────────────────────────────

export function isValidUuid(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
}

/**
 * Mapping from seeder slugs/legacy IDs to fixed Supabase PostgreSQL UUIDs.
 */
export const SEED_DEVICE_UUID_MAP: Record<string, string> = {
  'epson-l3250': '22222222-2222-2222-2222-222222222201',
  'epson-ecotank-l3250': '22222222-2222-2222-2222-222222222201',
  'epson-wf-c879r': '22222222-2222-2222-2222-222222222202',
  'epson-workforce-wf-c879': '22222222-2222-2222-2222-222222222202',
  'epson-workforce-pro-wf-c879r': '22222222-2222-2222-2222-222222222202',
  'share-link-guide': '22222222-2222-2222-2222-222222222203',
  'panduan-pembagian-link-dokumen': '22222222-2222-2222-2222-222222222203',
  'samsung-smart-tv': '22222222-2222-2222-2222-222222222204',
  'samsung-crystal-uhd-4k-smart-tv': '22222222-2222-2222-2222-222222222204',
  'interactive-display-75': '22222222-2222-2222-2222-222222222205',
  'interactive-display-75-touchscreen': '22222222-2222-2222-2222-222222222205',
  'video-conference-lumens': '22222222-2222-2222-2222-222222222206',
  'lumens-ptz-camera-speakerphone': '22222222-2222-2222-2222-222222222206',
};

export function resolveDeviceUuid(deviceId: string, availableDevices?: Array<{ id: string; slug?: string }>): string {
  if (!deviceId) return '';
  const trimmed = deviceId.trim();
  if (isValidUuid(trimmed)) return trimmed;

  const mapped = SEED_DEVICE_UUID_MAP[trimmed] || SEED_DEVICE_UUID_MAP[trimmed.toLowerCase()];
  if (mapped) return mapped;

  if (availableDevices && availableDevices.length > 0) {
    const found = availableDevices.find((d) => d.slug === trimmed || d.id === trimmed);
    if (found && isValidUuid(found.id)) return found.id;
  }

  return trimmed;
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export async function signInWithPassword(emailOrUser: string, pass: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailOrUser,
    password: pass,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentAuthUser() {
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}


// ─── Categories CRUD ──────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as Category[]) ?? [];
}

export async function createCategory(cat: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const { data, error } = await supabase.from('categories').insert(cat).select().single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ─── Devices CRUD ─────────────────────────────────────────────────────────────

export async function fetchDevices(): Promise<DeviceRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('devices')
    .select('*, categories(*)')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as DeviceRow[]) ?? [];
}

export async function fetchDeviceById(id: string): Promise<DeviceRow | null> {
  if (!supabase) return null;
  const targetId = resolveDeviceUuid(id);
  const { data, error } = await supabase
    .from('devices')
    .select('*, categories(*)')
    .eq('id', targetId)
    .single();

  if (error || !data) return null;
  return data as DeviceRow;
}

export async function createDevice(device: Omit<DeviceRow, 'id' | 'created_at' | 'updated_at' | 'categories'>): Promise<DeviceRow> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const { data, error } = await supabase.from('devices').insert(device).select().single();
  if (error) throw error;
  return data as DeviceRow;
}

export async function updateDevice(id: string, updates: Partial<DeviceRow>): Promise<DeviceRow> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const targetId = resolveDeviceUuid(id);
  const { data, error } = await supabase
    .from('devices')
    .update(updates)
    .eq('id', targetId)
    .select()
    .single();
  if (error) throw error;
  return data as DeviceRow;
}

export async function deleteDevice(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const targetId = resolveDeviceUuid(id);
  const { error } = await supabase.from('devices').delete().eq('id', targetId);
  if (error) throw error;
}

export async function fetchDeviceBySlug(slug: string): Promise<DeviceRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('devices')
    .select('*, categories(*)')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as DeviceRow;
}

// ─── Steps CRUD ───────────────────────────────────────────────────────────────

export async function fetchAllSteps(): Promise<Step[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn('fetchAllSteps error:', error);
    return [];
  }
  return (data as Step[]) ?? [];
}

export async function fetchStepsByDeviceId(deviceId: string): Promise<Step[]> {
  if (!supabase) return [];
  const targetId = resolveDeviceUuid(deviceId);
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .eq('device_id', targetId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as Step[]) ?? [];
}

export async function createStep(step: Omit<Step, 'id' | 'created_at' | 'updated_at'>): Promise<Step> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const targetDeviceId = resolveDeviceUuid(step.device_id);
  const payload = {
    ...step,
    device_id: targetDeviceId,
  };
  const { data, error } = await supabase.from('steps').insert(payload).select().single();
  if (error) throw error;
  return data as Step;
}

export async function updateStep(id: string, updates: Partial<Step>): Promise<Step> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  if (!isValidUuid(id)) {
    const err: any = new Error(`ID langkah "${id}" bukan format UUID yang valid.`);
    err.code = '22P02';
    throw err;
  }

  const payload: Partial<Step> = { ...updates };
  if (payload.device_id) {
    payload.device_id = resolveDeviceUuid(payload.device_id);
  }

  const { data, error } = await supabase
    .from('steps')
    .update(payload)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const err: any = new Error(`Langkah dengan ID ${id} tidak ditemukan di database.`);
    err.code = 'PGRST116';
    throw err;
  }
  return data as Step;
}

export async function deleteStep(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  if (!isValidUuid(id)) return;
  const { error } = await supabase.from('steps').delete().eq('id', id);
  if (error) throw error;
}

export async function syncDeviceSteps(
  deviceId: string,
  steps: Array<{
    title: string;
    description?: string | null;
    konten_windows?: string | null;
    konten_mac?: string | null;
    sort_order?: number;
  }>
): Promise<Step[]> {
  if (!supabase) return [];
  const targetId = resolveDeviceUuid(deviceId);

  const { error: delError } = await supabase.from('steps').delete().eq('device_id', targetId);
  if (delError) throw delError;

  if (steps.length > 0) {
    const payload = steps.map((s, idx) => ({
      device_id: targetId,
      title: s.title,
      description: s.description || null,
      konten_windows: s.konten_windows || null,
      konten_mac: s.konten_mac || null,
      sort_order: s.sort_order ?? idx + 1,
    }));
    const { data, error: insError } = await supabase.from('steps').insert(payload).select();
    if (insError) throw insError;
    return (data as Step[]) ?? [];
  }
  return [];
}

// ─── FAQs CRUD ────────────────────────────────────────────────────────────────

export async function fetchAllFaqs(): Promise<FaqRow[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return [];
    return (data as FaqRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function fetchGeneralFaqs(): Promise<FaqRow[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .is('device_id', null)
      .order('sort_order', { ascending: true });

    if (error) return [];
    return (data as FaqRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function fetchFaqsByDeviceId(deviceId: string): Promise<FaqRow[]> {
  if (!supabase) return [];
  const targetId = resolveDeviceUuid(deviceId);
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('device_id', targetId)
      .order('sort_order', { ascending: true });

    if (error) return [];
    return (data as FaqRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function syncDeviceFaqs(
  deviceId: string,
  faqs: Array<{ question: string; answer: string; sort_order?: number }>
): Promise<void> {
  if (!supabase) return;
  const targetId = resolveDeviceUuid(deviceId);
  const { error: delError } = await supabase.from('faqs').delete().eq('device_id', targetId);
  if (delError) throw delError;

  if (faqs.length > 0) {
    const payload = faqs.map((f, idx) => ({
      device_id: targetId,
      question: f.question,
      answer: f.answer,
      sort_order: f.sort_order ?? idx + 1,
    }));
    const { error: insError } = await supabase.from('faqs').insert(payload);
    if (insError) throw insError;
  }
}

export async function syncGeneralFaqs(
  faqs: Array<{ question: string; answer: string; sort_order?: number }>
): Promise<void> {
  if (!supabase) return;
  const { error: delError } = await supabase.from('faqs').delete().is('device_id', null);
  if (delError) throw delError;

  if (faqs.length > 0) {
    const payload = faqs.map((f, idx) => ({
      device_id: null,
      question: f.question,
      answer: f.answer,
      sort_order: f.sort_order ?? idx + 1,
    }));
    const { error: insError } = await supabase.from('faqs').insert(payload);
    if (insError) throw insError;
  }
}

export async function createFaq(faq: {
  device_id?: string | null;
  question: string;
  answer: string;
  sort_order?: number;
}): Promise<FaqRow> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const targetDeviceId = faq.device_id ? resolveDeviceUuid(faq.device_id) : null;
  const payload = {
    device_id: targetDeviceId,
    question: faq.question.trim(),
    answer: faq.answer.trim(),
    sort_order: faq.sort_order ?? 0,
  };
  const { data, error } = await supabase.from('faqs').insert(payload).select().single();
  if (error) throw error;
  return data as FaqRow;
}

export async function updateFaq(id: string, updates: Partial<FaqRow>): Promise<FaqRow> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  if (!isValidUuid(id)) {
    const err: any = new Error(`ID FAQ "${id}" bukan format UUID yang valid.`);
    err.code = '22P02';
    throw err;
  }

  const payload: any = { ...updates };
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;
  if ('device_id' in payload) {
    payload.device_id = payload.device_id ? resolveDeviceUuid(payload.device_id) : null;
  }
  const { data, error } = await supabase
    .from('faqs')
    .update(payload)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const err: any = new Error(`FAQ dengan ID ${id} tidak ditemukan di database.`);
    err.code = 'PGRST116';
    throw err;
  }
  return data as FaqRow;
}

export async function deleteFaq(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  if (!isValidUuid(id)) return;
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) throw error;
}


