-- ─────────────────────────────────────────────────────────────────────────────
-- FIX ORG ADMIN FLOW
-- 1. Expand institution_type constraint to include 'leadership'
-- 2. Add UNIQUE (org_id, user_id) partial index so upsert can use it
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Ensure institution_type allows all four values (idempotent)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_institution_type_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_institution_type_check
  CHECK (institution_type IN ('individual', 'education', 'business', 'leadership'));

-- 2. Unique index on (org_id, user_id) for rows where user_id is known.
--    Allows upsert { onConflict: 'org_id,email' } to keep working AND
--    prevents duplicate membership rows for the same user+org.
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_members_org_user
  ON organization_members (org_id, user_id)
  WHERE user_id IS NOT NULL;
