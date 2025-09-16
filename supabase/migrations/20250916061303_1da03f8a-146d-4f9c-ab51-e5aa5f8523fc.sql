-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create task invitations table
CREATE TABLE public.task_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  invited_by UUID NOT NULL,
  invited_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.task_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for task invitations
CREATE POLICY "Users can view invitations they sent or received" 
ON public.task_invitations 
FOR SELECT 
USING (auth.uid() = invited_by OR auth.email() = invited_email);

CREATE POLICY "Users can create invitations" 
ON public.task_invitations 
FOR INSERT 
WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Users can update invitation status for emails they own" 
ON public.task_invitations 
FOR UPDATE 
USING (auth.email() = invited_email);

-- Create tasks table (enhanced version with project support)
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  notes TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  
  -- Scoring system (1-5 scale)
  importance INTEGER NOT NULL DEFAULT 3 CHECK (importance >= 1 AND importance <= 5),
  urgency INTEGER NOT NULL DEFAULT 3 CHECK (urgency >= 1 AND urgency <= 5),
  impact INTEGER NOT NULL DEFAULT 3 CHECK (impact >= 1 AND impact <= 5),
  effort INTEGER NOT NULL DEFAULT 3 CHECK (effort >= 1 AND effort <= 5),
  
  -- Time estimates
  estimated_time INTEGER NOT NULL DEFAULT 60, -- In minutes
  
  -- Status and metadata
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'in-progress', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deadline TIMESTAMP WITH TIME ZONE,
  
  -- Scheduling
  year_assignment INTEGER,
  month_assignment INTEGER,
  week_assignment INTEGER,
  scheduled_date TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks" 
ON public.tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view tasks they're invited to" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.task_invitations 
    WHERE task_id = tasks.id 
    AND invited_email = auth.email() 
    AND status = 'accepted'
  )
);

CREATE POLICY "Users can create their own tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Invited users can update task status" 
ON public.tasks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.task_invitations 
    WHERE task_id = tasks.id 
    AND invited_email = auth.email() 
    AND status = 'accepted'
  )
);

CREATE POLICY "Users can delete their own tasks" 
ON public.tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for timestamp updates
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_invitations_updated_at
BEFORE UPDATE ON public.task_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();