import { supabase } from '@/lib/supabase';

function mapProduct(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    images: p.images,
    badge: p.badge,
    badgeColor: p.badge_color,
    description: p.description,
    retailPrice: p.retail_price,
    wholesalePrice: p.wholesale_price,
    minRetail: p.min_retail,
    minWholesale: p.min_wholesale,
    suggestedSellPrice: p.suggested_sell_price,
    weightKg: Number(p.weight_kg),
    dimensions: p.dimensions,
    rating: Number(p.rating),
    reviews: p.reviews,
    trending: p.trending,
  };
}

function mapShipping(s) {
  return {
    id: s.id,
    label: s.label,
    icon: s.icon,
    pricePerKg: s.price_per_kg,
    pricePerCbm: s.price_per_cbm,
    estimatedDays: s.estimated_days,
    description: s.description,
    color: s.color,
  };
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapProduct);
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function getTrendingProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('trending', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapProduct);
}

export async function getProductsByCategory(catId) {
  const query = supabase.from('products').select('*').order('created_at', { ascending: false });
  if (catId !== 'all') {
    query.eq('category', catId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapProduct);
}

export async function getShippingOptions() {
  const { data, error } = await supabase
    .from('shipping_options')
    .select('*')
    .order('id');
  if (error) throw error;
  return data.map(mapShipping);
}

export const CATEGORIES = [
  { id: "all", label: "Tout" },
  { id: "tech", label: "Tech & Gadgets" },
  { id: "mode", label: "Mode" },
  { id: "maison", label: "Maison" },
  { id: "beaute", label: "Beauté" },
  { id: "outils", label: "Outils Pro" },
];
