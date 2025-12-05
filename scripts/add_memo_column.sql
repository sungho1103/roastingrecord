-- Add memo column to roasting_records table if it doesn't exist
ALTER TABLE roasting_records
ADD COLUMN IF NOT EXISTS memo TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roasting_records_date ON roasting_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_roasting_records_bean_name ON roasting_records(bean_name);
