-- Fix RLS policy for user_plans table to allow users to read their own plans

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can read own plan" ON public.user_plans;

-- Create new policy that allows users to read their own plan
CREATE POLICY "Users can read own plan" 
ON public.user_plans 
FOR SELECT 
USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON public.user_plans TO authenticated;
GRANT SELECT ON public.user_plans TO anon;
