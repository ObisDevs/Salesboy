-- Check if messages are in chat_logs table
SELECT * FROM chat_logs 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY timestamp DESC
LIMIT 10;
