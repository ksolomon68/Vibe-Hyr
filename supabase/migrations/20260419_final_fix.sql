-- FINAL FIX: Expand Role Constraints and Provision Test Account
-- This MUST be run in the Supabase SQL Editor.

-- 1. Standardize existing data to 'member' if they have legacy/invalid roles
UPDATE profiles 
SET role = 'member' 
WHERE role NOT IN ('admin', 'member', 'super_admin', 'leader', 'institution_admin', 'personal', 'business', 'educator');

-- 2. Drop the restrictive role check if it exists
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
END $$;

-- 3. Add the expanded role check that supports all platform verticals
-- allowed: admin, member, super_admin, leader, institution_admin, personal, business, educator
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'member', 'super_admin', 'leader', 'institution_admin', 'personal', 'business', 'educator'));

-- 4. Correctly provision test.architect@vibehyr.com
-- This ensures they fall into the 'business' bucket and match the architect tier.
UPDATE profiles 
SET 
    vertical = 'business',
    institution_type = 'business',
    membership_tier = 'architect',
    role = 'business'
WHERE email = 'test.architect@vibehyr.com';

-- 5. Ensure the course_catalog has the correct vertical for the first business track
-- This helps the 'canAccessCourse' engine identify it correctly.
UPDATE course_catalog
SET vertical = 'business'
WHERE slug = 'common-sense-in-the-workplace';

-- 6. Grant audit trail
COMMENT ON CONSTRAINT profiles_role_check ON profiles IS 'Updated 2026-04-19 to support multi-vertical roles.';
