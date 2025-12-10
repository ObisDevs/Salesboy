-- Create intent_sessions table for tracking multi-message intent collection
CREATE TABLE IF NOT EXISTS intent_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('collecting', 'ready', 'cancelled')),
  payload JSONB DEFAULT '{}',
  missing_info TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active intent per user-phone combination
  UNIQUE(user_id, from_number)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_intent_sessions_user_phone 
ON intent_sessions(user_id, from_number);

-- Create RPC function to create table (for backwards compatibility)
CREATE OR REPLACE FUNCTION create_intent_sessions_table()
RETURNS void AS $$
BEGIN
  -- Table already created above, this is just for compatibility
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE intent_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own intent sessions"
ON intent_sessions
FOR ALL
USING (auth.uid() = user_id);