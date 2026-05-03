-- China Express Supabase Storage Bucket for Product Images
-- Run this in Supabase SQL Editor

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to all files in the bucket
CREATE POLICY "Allow public read on product-images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- 3. Allow anonymous upload to the bucket
CREATE POLICY "Allow anonymous upload on product-images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'product-images');

-- 4. Allow users to update their own uploads
CREATE POLICY "Allow anonymous update on product-images"
  ON storage.objects FOR UPDATE
  TO anon
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- 5. Allow anonymous delete (for admin management)
CREATE POLICY "Allow anonymous delete on product-images"
  ON storage.objects FOR DELETE
  TO anon
  USING (bucket_id = 'product-images');
