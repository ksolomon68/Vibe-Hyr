-- CONSOLIDATION: Unify 'institution_admin' -> 'admin' and Reconcile Schema
-- This script ensures all columns exist and roles are standardized.

-- 1. RECONCILE SCHEMA (Ensure modern column names)
DO $$ 
BEGIN 
  -- Profiles: institution_id -> org_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'institution_id') THEN
    ALTER TABLE profiles RENAME COLUMN institution_id TO org_id;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'org_id') THEN
    ALTER TABLE profiles ADD COLUMN org_id UUID;
  END IF;

  -- Profiles: institution_type -> vertical
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'institution_type') THEN
    ALTER TABLE profiles RENAME COLUMN institution_type TO vertical;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'vertical') THEN
    ALTER TABLE profiles ADD COLUMN vertical TEXT;
  END IF;
END $$;

-- 2. MIGRATE DATA (Unify roles)
UPDATE profiles 
SET role = 'admin' 
WHERE role = 'institution_admin';

-- 3. UPDATE CONSTRAINTS
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- New allowed list: admin, member, super_admin, leader, personal, business, educator
-- Note: 'institution_admin' is removed from this list.
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'member', 'super_admin', 'leader', 'personal', 'business', 'educator'));

-- 4. PROVISION TEST ACCOUNT
UPDATE profiles 
SET 
    vertical = 'business', 
    membership_tier = 'architect', 
    role = 'admin' -- Switched from 'business' to 'admin' (since they are an Org Admin in tests)
WHERE email = 'test.architect@vibehyr.com';

-- 5. CATALOG FIX
UPDATE course_catalog SET vertical = 'business' WHERE slug = 'common-sense-in-the-workplace';
