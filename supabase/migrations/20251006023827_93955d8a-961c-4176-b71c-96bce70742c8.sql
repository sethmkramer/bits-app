-- Create milestones table to store user's custom milestones
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for milestones
CREATE POLICY "Users can view own milestones" 
ON public.milestones 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own milestones" 
ON public.milestones 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones" 
ON public.milestones 
FOR DELETE 
USING (auth.uid() = user_id);