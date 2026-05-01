-- China Express Supabase Schema
-- Run this in Supabase SQL Editor
-- IMPORTANT: Drop existing tables first if you already ran this script

DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS shipping_options CASCADE;
DROP TABLE IF EXISTS trackings CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS how_it_works CASCADE;

-- Table: products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] NOT NULL,
  badge TEXT,
  badge_color TEXT,
  description TEXT NOT NULL,
  retail_price INTEGER NOT NULL,
  wholesale_price INTEGER NOT NULL,
  min_retail INTEGER NOT NULL,
  min_wholesale INTEGER NOT NULL,
  suggested_sell_price INTEGER NOT NULL,
  weight_kg NUMERIC NOT NULL,
  dimensions TEXT NOT NULL,
  rating NUMERIC NOT NULL,
  reviews INTEGER NOT NULL,
  trending BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: shipping_options
CREATE TABLE shipping_options (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  price_per_kg INTEGER NOT NULL,
  price_per_cbm INTEGER,
  estimated_days TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Table: trackings
CREATE TABLE trackings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  product TEXT NOT NULL,
  weight TEXT NOT NULL,
  transport TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  estimated_delivery TEXT NOT NULL,
  current_step INTEGER NOT NULL,
  history JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: faqs
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER UNIQUE NOT NULL
);

-- Table: how_it_works
CREATE TABLE how_it_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE trackings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE how_it_works ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon role (public app)
CREATE POLICY "Allow all on products"
  ON products FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all on shipping_options"
  ON shipping_options FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all on trackings"
  ON trackings FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all on faqs"
  ON faqs FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all on how_it_works"
  ON how_it_works FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_trending ON products (trending);
CREATE INDEX IF NOT EXISTS idx_trackings_code ON trackings (code);
