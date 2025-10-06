-- Add RLS policies for user_roles table
-- Users can view their own roles (needed for authorization checks)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only the system (via trigger) can insert roles
-- No INSERT policy for regular users ensures only the handle_new_user trigger can create roles

-- Prevent users from modifying their own roles
-- No UPDATE or DELETE policies means only service role can modify roles
-- This prevents privilege escalation attacks

-- Add a comment for documentation
COMMENT ON TABLE public.user_roles IS 'Stores user roles. Users can view their own roles but cannot modify them. Role assignment happens only via the handle_new_user trigger on signup.';