-- Setup user and whitelist for testing
-- Run this in Supabase SQL Editor

-- First, create a user in auth.users (required for foreign key)
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'test@example.com',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert user profile
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'test@example.com',
  'Test User',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET full_name = 'Test User';

-- Insert whitelist entry for your phone number
INSERT INTO whitelists (user_id, phone_number, name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '2349058653283@c.us',
  'Test Phone',
  NOW()
) ON CONFLICT (user_id, phone_number) DO NOTHING;

-- Verify the records
SELECT * FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001';
SELECT * FROM whitelists WHERE user_id = '00000000-0000-0000-0000-000000000001';