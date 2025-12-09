-- Check what's in the database for the hardcoded USER_ID
-- Run this in Supabase SQL Editor

-- Check if this user exists
SELECT * FROM profiles 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Check files for this hardcoded user
SELECT id, filename, status, chunks_count, created_at 
FROM knowledge_base 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC;

-- Check ALL files in the database (regardless of user_id)
SELECT id, user_id, filename, status, chunks_count, created_at 
FROM knowledge_base 
ORDER BY created_at DESC;
