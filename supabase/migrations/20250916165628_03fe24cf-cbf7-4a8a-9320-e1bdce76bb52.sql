-- Remove the overly permissive policy that exposes profiles to everyone
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a security definer function to check if users are collaborators
-- This prevents RLS recursion issues when checking relationships
CREATE OR REPLACE FUNCTION public.is_collaborator(profile_user_id uuid, requesting_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if users collaborate through accepted project invitations
  SELECT EXISTS (
    SELECT 1 FROM projects p
    JOIN project_invitations pi ON p.id = pi.project_id
    WHERE (p.user_id = profile_user_id AND pi.invited_email = (SELECT email FROM auth.users WHERE id = requesting_user_id) AND pi.status = 'accepted')
       OR (p.user_id = requesting_user_id AND pi.invited_email = (SELECT email FROM auth.users WHERE id = profile_user_id) AND pi.status = 'accepted')
  )
  OR EXISTS (
    -- Check if users collaborate through accepted task invitations
    SELECT 1 FROM tasks t
    JOIN task_invitations ti ON t.id = ti.task_id
    WHERE (t.user_id = profile_user_id AND ti.invited_email = (SELECT email FROM auth.users WHERE id = requesting_user_id) AND ti.status = 'accepted')
       OR (t.user_id = requesting_user_id AND ti.invited_email = (SELECT email FROM auth.users WHERE id = profile_user_id) AND ti.status = 'accepted')
  );
$$;

-- Create secure policies for profile access
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view collaborator profiles"
ON public.profiles
FOR SELECT  
TO authenticated
USING (public.is_collaborator(user_id, auth.uid()));