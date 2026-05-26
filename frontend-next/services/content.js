import { supabase } from '@/lib/supabase';

export async function getFAQs() {
  const { data, error } = await supabase
    .from('faqs')
    .select('id, question, answer, order_index')
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getHowItWorks() {
  const { data, error } = await supabase
    .from('how_it_works')
    .select('id, title, description, icon, step')
    .order('step', { ascending: true });
  if (error) throw error;
  return data;
}
