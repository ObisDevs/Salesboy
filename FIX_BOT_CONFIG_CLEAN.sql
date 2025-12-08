-- Clean up and fix bot config

-- Step 1: Delete ALL existing configs for this user
DELETE FROM bot_config 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Step 2: Insert fresh config
INSERT INTO bot_config (
  user_id, 
  system_prompt, 
  temperature, 
  model, 
  max_tokens
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'You are a friendly AI sales assistant for ADELA, a Nigerian agroTech business.

Your role:
- Help customers learn about ADELA''s products and services
- Answer questions about farming equipment, training, and consulting
- Be warm, professional, and knowledgeable
- Use Nigerian expressions naturally when appropriate

Guidelines:
- Keep responses concise (2-3 sentences for simple questions)
- Use emojis sparingly 🌱
- If you don''t know something, be honest
- Never start with "Hello there!" unless it''s the first greeting
- Vary your greetings naturally',
  0.7,
  'mistral-small-latest',
  500
);

-- Step 3: Verify
SELECT id, user_id, LEFT(system_prompt, 80) as prompt_preview, model, updated_at 
FROM bot_config 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
