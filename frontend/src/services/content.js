import { supabase } from '@/lib/supabase';

export async function getFAQs() {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getHowItWorks() {
  const { data, error } = await supabase
    .from('how_it_works')
    .select('*')
    .order('step', { ascending: true });
  if (error) throw error;
  return data;
}
