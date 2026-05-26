-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  embed_code TEXT NOT NULL,
  host TEXT NOT NULL DEFAULT 'wistia' CHECK (host IN ('wistia', 'youtube', 'vimeo', 'other')),
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_display_order ON videos(display_order);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read published videos
CREATE POLICY "Public can read published videos"
  ON videos
  FOR SELECT
  TO public
  USING (status = 'published');

-- Authenticated users can perform all CRUD operations
CREATE POLICY "Authenticated users can insert videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING (true);

-- Enable realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE videos;
