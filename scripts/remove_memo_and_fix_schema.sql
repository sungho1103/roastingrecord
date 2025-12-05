-- Remove memo column and add missing final_temp column

-- Add final_temp column if it doesn't exist
ALTER TABLE roasting_records 
ADD COLUMN IF NOT EXISTS final_temp NUMERIC;

-- Remove memo column if it exists
ALTER TABLE roasting_records 
DROP COLUMN IF EXISTS memo;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roasting_records_date ON roasting_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_roasting_records_bean_name ON roasting_records(bean_name);
