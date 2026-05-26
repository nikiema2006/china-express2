import { supabase } from '@/lib/supabase';

export async function getTrackingByCode(code) {
  const { data, error } = await supabase
    .from('trackings')
    .select('id, code, status, updated_at')
    .eq('code', code.toUpperCase())
    .single();
  if (error) throw error;
  return data;
}

export async function getAllTrackingCodes() {
  const { data, error } = await supabase
    .from('trackings')
    .select('code');
  if (error) throw error;
  return data.map((t) => t.code);
}
