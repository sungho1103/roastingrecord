-- Create bean_names table for syncing bean list across devices
CREATE TABLE IF NOT EXISTS bean_names (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default Korean bean names
INSERT INTO bean_names (name) VALUES
  ('에티오피아'),
  ('콜롬비아'),
  ('브라질'),
  ('케냐'),
  ('과테말라'),
  ('코스타리카'),
  ('기타')
ON CONFLICT (name) DO NOTHING;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_bean_names_created_at ON bean_names(created_at);
