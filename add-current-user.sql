-- Add current-user with proper UUID
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@salesboy.ai',
  'Admin User',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Add test phone number to whitelist
INSERT INTO whitelists (user_id, phone_number, name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '2349058653283@c.us',
  'Test User',
  NOW()
)
ON CONFLICT (user_id, phone_number) DO NOTHING;
