-- ─────────────────────────────────────────────────────────────────────────────
-- VIBE HYR — FIX ORGANIZATION CONSTRAINTS
-- Makes the 'domain' column nullable in the organizations table and updates
-- check constraints for segment and tier to match the Super Admin dashboard.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Make domain nullable (UI allows it to be optional)
ALTER TABLE organizations 
  ALTER COLUMN domain DROP NOT NULL,
  ALTER COLUMN website DROP NOT NULL,
  ALTER COLUMN industry DROP NOT NULL;

-- 2. Update status constraint if it's too restrictive (Super Admin allows 'active', 'pending', 'inactive')
ALTER TABLE organizations 
  DROP CONSTRAINT IF EXISTS organizations_status_check;

ALTER TABLE organizations 
  ADD CONSTRAINT organizations_status_check 
  CHECK (status IN ('active', 'pending', 'inactive', 'payment_failed', 'cancelled', 'over_seat_limit', 'trial'));

-- 3. Update segment constraint to match SuperAdminDashboard code
-- UI uses: 'corporate', 'smb', 'education', 'leadership', 'nonprofit'
ALTER TABLE organizations 
  DROP CONSTRAINT IF EXISTS organizations_segment_check;

ALTER TABLE organizations 
  ADD CONSTRAINT organizations_segment_check 
  CHECK (segment IN ('corporate', 'university', 'k12', 'small-business', 'smb', 'education', 'leadership', 'nonprofit', 'business'));

-- 4. Update tier constraint to match SuperAdminDashboard code 
-- UI uses: 'free', 'architect', 'elite', 'seeker', 'reality-master'
ALTER TABLE organizations 
  DROP CONSTRAINT IF EXISTS organizations_tier_check;

ALTER TABLE organizations 
  ADD CONSTRAINT organizations_tier_check 
  CHECK (tier IN ('free', 'architect', 'elite', 'seeker', 'reality-master', 'mastery'));
