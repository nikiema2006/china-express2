-- Add product_url column to products table for admin source link tracking
-- This field stores the direct link to the product on Chinese platforms (1688, Taobao, etc.)
-- It is only visible/usable in the admin panel, not on the public-facing site

ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_url TEXT;

-- Add index for faster filtering/searching by source URL
CREATE INDEX IF NOT EXISTS idx_products_product_url ON products (product_url);
