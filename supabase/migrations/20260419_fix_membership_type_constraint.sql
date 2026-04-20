-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 20260419_fix_membership_type_constraint.sql
--
-- PROBLEM:
--   Two migrations created a conflict on profiles.membership_type:
--
--   1. 20260418_sync_membership_type.sql added:
--        membership_type TEXT CHECK (membership_type IN ('free','architect','elite'))
--      and syncs it from membership_tier via trigger.
--
--   2. 20260419_org_verticals.sql uses membership_type in RLS policies as a
--      VERTICAL identifier: p.membership_type = 'education' / 'business' / 'leadership'
--      — values that violate constraint #1 above.
--
-- RESOLUTION:
--   membership_type on profiles is repurposed to mean VERTICAL (not tier).
--   membership_tier continues to hold the tier value ('free','architect','elite').
--   The broken sync trigger is dropped and recreated to do nothing harmful.
--   The constraint is replaced to allow all vertical values.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Drop the broken sync trigger (mirrors tier→membership_type, wrong purpose)
DROP TRIGGER IF EXISTS trg_sync_membership_type ON profiles;
DROP FUNCTION IF EXISTS sync_membership_type();

-- ── 2. Drop the conflicting constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_membership_type_check;

-- ── 3. Redefine membership_type as the VERTICAL column (matches RLS policy usage)
--    Allowed values match the org vertical set + individual for standalone users.
ALTER TABLE profiles
  ADD CONSTRAINT profiles_membership_type_check
  CHECK (membership_type IN ('individual', 'personal', 'education', 'business', 'leadership', 'educator')
         OR membership_type IS NULL);

-- ── 4. Backfill membership_type from vertical where it's NULL or holds a tier value
--    (tier values like 'free','architect','elite' are wrong for this column)
UPDATE profiles
SET membership_type = vertical
WHERE membership_type IN ('free', 'architect', 'elite')
   OR membership_type IS NULL;

-- ── 5. For any remaining NULLs after backfill, default to 'individual'
UPDATE profiles
SET membership_type = COALESCE(vertical, 'individual')
WHERE membership_type IS NULL;
