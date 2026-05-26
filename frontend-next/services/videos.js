import { supabase } from '@/lib/supabase';

export async function getVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('status', 'published')
    .order('display_order');
  if (error) throw error;
  return data;
}
