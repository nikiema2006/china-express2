import { supabase } from '@/lib/supabase';

// Columns needed for product cards (listings)
const PRODUCT_CARD_COLUMNS = 'id, slug, name, category, images, badge, badge_color, retail_price, wholesale_price, min_wholesale, rating, reviews, trending, status, description';

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
    volumePerLot: p.volume_per_lot ? Number(p.volume_per_lot) : null,
    lotSize: p.lot_size || null,
    shippingNote: p.shipping_note || null,
    shippingCategory: p.shipping_category || 'MCO',
    rating: Number(p.rating),
    reviews: p.reviews,
    trending: p.trending,
    status: p.status,
    videoLinks: p.video_links || '',
  };
}

function mapProductCard(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    images: p.images,
    badge: p.badge,
    badgeColor: p.badge_color,
    retailPrice: p.retail_price,
    wholesalePrice: p.wholesale_price,
    minWholesale: p.min_wholesale,
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

const PUBLISHED = { status: 'published' };

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_CARD_COLUMNS)
    .match(PUBLISHED)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapProductCard);
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .match(PUBLISHED)
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .match(PUBLISHED)
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function getRelatedProducts(excludeId, category, limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_CARD_COLUMNS)
    .match(PUBLISHED)
    .neq('id', excludeId)
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(mapProductCard);
}

export async function getTrendingProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_CARD_COLUMNS)
    .match(PUBLISHED)
    .eq('trending', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapProductCard);
}

export async function getProductsByCategory(catId) {
  const query = supabase.from('products').select(PRODUCT_CARD_COLUMNS).match(PUBLISHED).order('created_at', { ascending: false });
  if (catId !== 'all') {
    query.eq('category', catId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapProductCard);
}

export async function getShippingOptions() {
  const { data, error } = await supabase
    .from('shipping_options')
    .select('id, label, icon, price_per_kg, price_per_cbm, estimated_days, description, color')
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
