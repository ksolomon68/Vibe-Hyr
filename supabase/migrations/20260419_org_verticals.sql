-- 2A — Add vertical column to organizations if missing
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS vertical TEXT 
CHECK (vertical IN ('education', 'business', 'leadership'))
NOT NULL DEFAULT 'education';

-- 2B — Add content_tier column if missing
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS content_tier TEXT
CHECK (content_tier IN ('free', 'architect', 'elite'))
NOT NULL DEFAULT 'architect';

-- 2C — Add remaining columns referenced by the admin insert
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS domain_restriction TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT,
  ADD COLUMN IF NOT EXISTS seat_limit INTEGER NOT NULL DEFAULT 0;

-- 2D — Backfill existing orgs from profile institution_type
UPDATE public.organizations o
SET vertical = p.institution_type
FROM public.profiles p
WHERE p.org_id = o.id
AND p.institution_type IN ('education','business','leadership');

-- 2E — Add index
CREATE INDEX IF NOT EXISTS idx_organizations_vertical 
ON public.organizations (vertical);

-- 3A — Update course_catalog RLS to enforce org vertical
-- Note: course_catalog uses 'vertical' column (not 'access_level')

-- Education org members see education content only
DROP POLICY IF EXISTS "org_education_courses"
  ON public.course_catalog;
CREATE POLICY "org_education_courses"
  ON public.course_catalog FOR SELECT
  USING (
    vertical = 'education'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.organizations o ON o.id = p.org_id
      WHERE p.id = auth.uid()
      AND o.vertical = 'education'
      AND p.membership_type = 'education'
    )
  );

-- Business org members see business content only
DROP POLICY IF EXISTS "org_business_courses"
  ON public.course_catalog;
CREATE POLICY "org_business_courses"
  ON public.course_catalog FOR SELECT
  USING (
    vertical = 'business'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.organizations o ON o.id = p.org_id
      WHERE p.id = auth.uid()
      AND o.vertical = 'business'
      AND p.membership_type = 'business'
    )
  );

-- Leadership org members see leadership content only
DROP POLICY IF EXISTS "org_leadership_courses"
  ON public.course_catalog;
CREATE POLICY "org_leadership_courses"
  ON public.course_catalog FOR SELECT
  USING (
    vertical = 'leadership'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.organizations o ON o.id = p.org_id
      WHERE p.id = auth.uid()
      AND o.vertical = 'leadership'
      AND p.membership_type = 'leadership'
    )
  );

-- 3B — Check function
CREATE OR REPLACE FUNCTION public.get_org_vertical(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT o.vertical 
  FROM public.organizations o
  JOIN public.profiles p ON p.org_id = o.id
  WHERE p.id = p_user_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
