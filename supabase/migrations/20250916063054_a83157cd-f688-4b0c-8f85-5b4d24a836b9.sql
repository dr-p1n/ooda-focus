-- Create project_invitations table for project collaboration
CREATE TABLE public.project_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL,
  invited_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for project invitations
CREATE POLICY "Users can create project invitations" 
ON public.project_invitations 
FOR INSERT 
WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Users can view invitations they sent or received" 
ON public.project_invitations 
FOR SELECT 
USING ((auth.uid() = invited_by) OR (auth.email() = invited_email));

CREATE POLICY "Users can update invitation status for emails they own" 
ON public.project_invitations 
FOR UPDATE 
USING (auth.email() = invited_email);

-- Add trigger for timestamps
CREATE TRIGGER update_project_invitations_updated_at
BEFORE UPDATE ON public.project_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add policies for projects to allow invited users to view them
CREATE POLICY "Users can view projects they're invited to" 
ON public.projects 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.project_invitations 
  WHERE project_invitations.project_id = projects.id 
  AND project_invitations.invited_email = auth.email() 
  AND project_invitations.status = 'accepted'
));

-- Allow invited users to view tasks within projects they have access to
CREATE POLICY "Users can view tasks in projects they're invited to" 
ON public.tasks 
FOR SELECT 
USING (
  project_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.project_invitations 
    WHERE project_invitations.project_id = tasks.project_id 
    AND project_invitations.invited_email = auth.email() 
    AND project_invitations.status = 'accepted'
  )
);