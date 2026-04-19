-- supabase/migrations/20260418_get_user_certificate.sql
-- RPC to fetch a user's certificate for a specific course

CREATE OR REPLACE FUNCTION public.get_user_certificate(p_course_id TEXT)
RETURNS public.certificates AS $$
  SELECT * FROM public.certificates 
  WHERE user_id = auth.uid() AND course_id = p_course_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
