-- Contact Us table
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Plans table
CREATE TABLE user_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'agent_pro',
  paystack_subscription_code TEXT,
  paystack_customer_code TEXT,
  status TEXT NOT NULL DEFAULT 'inactive', -- active, inactive, cancelled
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Contact submissions - only admins can read
CREATE POLICY "Admin can read contact submissions" ON contact_submissions
  FOR SELECT USING (false); -- Will be updated when admin system is added

-- Anyone can insert contact submissions
CREATE POLICY "Anyone can insert contact submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Users can read their own plan
CREATE POLICY "Users can read own plan" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

-- System can manage user plans
CREATE POLICY "System can manage user plans" ON user_plans
  FOR ALL USING (true);