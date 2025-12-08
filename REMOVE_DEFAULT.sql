-- Remove the default value from system_prompt column
ALTER TABLE bot_config 
ALTER COLUMN system_prompt DROP DEFAULT;

-- Verify
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'bot_config' AND column_name = 'system_prompt';
