-- Migration: Add shipping volume fields to products
-- Run this in Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS volume_per_lot NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS lot_size INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_note TEXT;
