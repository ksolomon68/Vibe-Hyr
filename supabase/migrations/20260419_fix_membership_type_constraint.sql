-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260419_fix_membership_type_constraint.sql
--
-- The prior migration (20260418_sync_membership_type) defined membership_type
-- as a copy of membership_tier with CHECK IN ('free','architect','elite').
-- However, the org_verticals RLS policies (20260419_org_verticals) check
-- membership_type = 'education'/'business'/'leadership' — vertical values.
-- This mismatch causes profile upserts to fail with a CHECK constraint violation.
--
-- Fix:
--   1. Drop the wrong sync trigger (membership_type ≠ membership_tier)
--   2. Drop + recreate the CHECK constraint to accept vertical values
--   3. Backfill membership_type from institution_type for existing rows
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Drop the incorrect sync trigger and function
DROP TRIGGER IF EXISTS trg_sync_membership_type ON profiles;
DROP FUNCTION IF EXISTS sync_membership_type();

-- 2. Drop the old CHECK constraint and add the correct one
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_membership_type_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_membership_type_check
  CHECK (membership_type IN ('personal', 'education', 'business', 'leadership'));

-- 3. Backfill from institution_type for existing rows
UPDATE profiles
SET membership_type = institution_type
WHERE institution_type IN ('personal', 'education', 'business', 'leadership')
  AND (membership_type IS NULL OR membership_type NOT IN ('personal', 'education', 'business', 'leadership'));
