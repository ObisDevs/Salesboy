-- Add business context fields to bot_config
ALTER TABLE bot_config 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_email TEXT;