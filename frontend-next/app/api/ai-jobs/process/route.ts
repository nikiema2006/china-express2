import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_API_URL = process.env.KIMI_API_URL || 'https://api.moonshot.cn/v1';

const SYSTEM_PROMPT = `Tu es un expert en import Chine-Afrique. Analyse le produit et retourne UNIQUEMENT un JSON valide avec ces champs exacts:
- name: nom du produit en français
- slug: slug URL-friendly (minuscule, tirets)
- category: catégorie appropriée
- description: description courte et vendeuse (2-3 phrases)
- retail_price: prix de détail estimé en FCFA
- wholesale_price: prix de gros estimé en FCFA
- suggested_sell_price: prix de revente conseillé en FCFA
- min_retail: quantité minimum pour prix détail
- min_wholesale: quantité minimum pour prix gros
- weight_kg: poids estimé en kg
- dimensions: dimensions du produit (ex: "30x20x10 cm")
- badge: badge marketing (ex: "Nouveau", "Hot", "Promo")
- badge_color: couleur du badge hex (ex: "#C8102E")
- rating: note estimée sur 5
- reviews: nombre d'avis estimé
- url: URL source du produit
- images: array d'URLs d'images si visibles

Retourne UNIQUEMENT le JSON, rien d'autre.`;

async function callKimiAPI(imageBase64s: string[], url: string = '') {
  const content: any[] = [];

  if (url) {
    content.push({ type: 'text', text: `URL du produit: ${url}` });
  }

  for (const base64 of imageBase64s.slice(0, 5)) {
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    content.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${base64Data}` },
    });
  }

  content.push({
    type: 'text',
    text: 'Analyse ce(s) produit(s) et retourne les informations structurées en JSON.',
  });

  const response = await fetch(`${KIMI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.KIMI_MODEL || 'moonshot-v1-8k',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      temperature: 1,
      max_tokens: 45000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content_text = data.choices[0].message.content;

  try {
    const jsonMatch = content_text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Invalid JSON response from AI');
  }
}

async function importProductToSupabase(product: any) {
  const productData = {
    name: product.name || 'Produit sans nom',
    slug: product.slug || product.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `produit-${Date.now()}`,
    category: product.category || null,
    description: product.description || null,
    badge: product.badge || null,
    badge_color: product.badge_color || null,
    retail_price: product.retail_price || null,
    wholesale_price: product.wholesale_price || null,
    suggested_sell_price: product.suggested_sell_price || null,
    min_retail: product.min_retail || null,
    min_wholesale: product.min_wholesale || null,
    weight_kg: product.weight_kg || null,
    dimensions: product.dimensions || null,
    volume_per_lot: product.volume_per_lot || null,
    lot_size: product.lot_size || null,
    rating: product.rating || null,
    reviews: product.reviews || 0,
    trending: false,
    status: 'draft',
    product_url: product.url || null,
    images: product.images || [],
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function processNextJob() {
  const { data: job, error } = await supabase
    .from('ai_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !job) return;

  await supabase
    .from('ai_jobs')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', job.id);

  try {
    const imageBase64s = job.images_base64 || (job.image_base64 ? [job.image_base64] : []);

    const product = await callKimiAPI(imageBase64s, job.url);

    const imported = await importProductToSupabase(product);

    await supabase
      .from('ai_jobs')
      .update({
        status: 'completed',
        result: { product: imported },
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);
  } catch (err: any) {
    await supabase
      .from('ai_jobs')
      .update({
        status: 'error',
        error: err.message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);
  }
}

export async function POST() {
  try {
    await processNextJob();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
