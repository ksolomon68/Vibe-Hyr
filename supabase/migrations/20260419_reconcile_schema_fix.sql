-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260419_reconcile_schema_fix.sql
--
-- This script fixes the 'profiles_role_check' violation by normalizing roles
-- and then proceeds to standardize the schema columns (org_id, vertical).
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. FIX ROLE CONSTRAINT VIOLATIONS
-- Identify any legacy or malformed roles and map them to 'member'
UPDATE profiles
SET role = 'member'
WHERE role NOT IN (
  'admin', 
  'member', 
  'super_admin', 
  'leader', 
  'institution_admin', 
  'personal', 
  'business', 
  'educator'
);

-- Re-apply the expanded role check
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'admin', 
    'member', 
    'super_admin', 
    'leader', 
    'institution_admin', 
    'personal', 
    'business', 
    'educator'
  ));

-- 2. RECONCILE COLUMN NAMES (if not already done)
-- Standardize profiles.institution_id -> org_id
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'institution_id') THEN
    ALTER TABLE profiles RENAME COLUMN institution_id TO org_id;
  END IF;
END $$;

-- Standardize profiles.institution_type -> vertical
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'institution_type') THEN
    ALTER TABLE profiles RENAME COLUMN institution_type TO vertical;
  END IF;
END $$;

-- Add vertical column to course_access if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_access' AND column_name = 'vertical') THEN
    ALTER TABLE course_access ADD COLUMN vertical TEXT;
  END IF;
END $$;

-- 3. SEED MISSING CATALOG ENTRIES (AUTHORITATIVE)
INSERT INTO course_catalog (slug, title, vertical, min_tier)
VALUES 
  ('common-sense-in-the-workplace', 'Common Sense in the Workplace', 'business', 'free'),
  ('critical-thinking-problem-solving', 'Critical Thinking & Problem Solving', 'business', 'architect'),
  ('effective-communication-at-work', 'Effective Communication at Work', 'business', 'architect'),
  ('high-frequency-team', 'The High Frequency Team', 'business', 'elite'),
  ('classroom-reality-management', 'Classroom Reality Management', 'educator', 'free'),
  ('pedagogy-of-the-gatekeeper', 'Pedagogy of the Gatekeeper', 'educator', 'architect'),
  ('conscious-curriculum-design', 'Conscious Curriculum Design', 'educator', 'architect'),
  ('educator-reality-mastery', 'Educator Reality Mastery', 'educator', 'elite')
ON CONFLICT (slug) DO UPDATE SET
  vertical = EXCLUDED.vertical,
  min_tier = EXCLUDED.min_tier;

-- 4. ENSURE RPC get_org_vertical IS UPDATED
CREATE OR REPLACE FUNCTION get_org_vertical(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT vertical FROM organizations
  WHERE id = (SELECT org_id FROM profiles WHERE id = p_user_id)
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
