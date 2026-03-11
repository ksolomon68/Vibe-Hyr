-- Create education_progress table
CREATE TABLE IF NOT EXISTS public.education_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id text NOT NULL,
  module_id text NOT NULL,
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, program_id, module_id)
);

-- Enable RLS
ALTER TABLE public.education_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own education progress"
  ON public.education_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own education progress"
  ON public.education_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education progress"
  ON public.education_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create education_certifications table
CREATE TABLE IF NOT EXISTS public.education_certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id text NOT NULL,
  cert_title text NOT NULL,
  earned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, program_id)
);

-- Enable RLS
ALTER TABLE public.education_certifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own certifications"
  ON public.education_certifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certifications"
  ON public.education_certifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
