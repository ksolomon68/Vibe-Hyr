-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 20260419_fix_admin_provisioning.sql
--
-- Fixes organization admin provisioning failures by resolving three root causes:
--
-- 1. ROLE CONSTRAINT CONFLICT
--    The 'institution_admin' role was removed from profiles.role in
--    20260419_unify_admin_role.sql, but actions.ts was still writing it.
--    This migration ensures the final allowed role set is correct and includes
--    'leader' which is used for leadership vertical org admins.
--
-- 2. ORGANIZATION_MEMBERS UNIQUE CONSTRAINT
--    The table was defined with UNIQUE(org_id, email) but the insert logic
--    was trying to onConflict on (org_id, user_id) which has no unique index.
--    This migration adds the missing index so upserts on either pair work cleanly.
--
-- 3. RLS BYPASS FOR SUPER ADMIN CLIENT
--    The service-role client bypasses RLS automatically, but the dashboard read
--    of organization_members uses the standard admin.from() which uses service role.
--    Adding explicit super_admin select policies as a belt-and-suspenders fix.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. NORMALIZE LEGACY 'institution_admin' ROLE VALUES ──────────────────────
-- Remap any existing 'institution_admin' rows to 'admin' (the unified role).
UPDATE profiles
SET role = 'admin'
WHERE role = 'institution_admin';

-- ── 2. DROP & RECREATE ROLE CONSTRAINT WITH FINAL ALLOWED SET ────────────────
-- Final set: admin, member, super_admin, leader, personal, business, educator
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN (
  'admin',
  'member',
  'super_admin',
  'leader',
  'personal',
  'business',
  'educator'
));

-- ── 3. ENSURE organization_members UNIQUE CONSTRAINT ─────────────────────────
-- The table was defined with UNIQUE(org_id, email). Confirm the constraint name
-- and add a secondary unique index on (org_id, user_id) for cases where we
-- want to look up by user: this is NOT a duplicate-prevention constraint,
-- only a lookup index. The upsert onConflict target should remain (org_id, email).

-- Only add the user_id index if it doesn't already exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_members_org_user
  ON organization_members (org_id, user_id)
  WHERE user_id IS NOT NULL;  -- Partial index: excludes null user_id rows (pre-signup invites)

-- ── 4. SUPER ADMIN READ POLICY ON organization_members ───────────────────────
-- The service role bypasses RLS, so this is belt-and-suspenders for cases
-- where the admin panel query runs through a non-service-role client path.

DROP POLICY IF EXISTS "Super admins read all org members" ON organization_members;
CREATE POLICY "Super admins read all org members"
  ON organization_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_super_admin = TRUE
    )
  );

-- ── 5. SUPER ADMIN INSERT/UPDATE POLICY ON organization_members ───────────────
DROP POLICY IF EXISTS "Super admins manage all org members" ON organization_members;
CREATE POLICY "Super admins manage all org members"
  ON organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_super_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_super_admin = TRUE
    )
  );

-- ── 6. BACKFILL: Stamp user_id on org member rows that are missing it ─────────
-- For existing orgs, if a profile is linked to an org and has a matching email
-- in organization_members but no user_id, stamp it now.
UPDATE organization_members om
SET user_id = p.id
FROM profiles p
WHERE om.email = p.email
  AND om.user_id IS NULL
  AND p.id IS NOT NULL;

-- ── 7. BACKFILL: Ensure org admin profiles have role = 'admin' ────────────────
-- Any profile linked to an org via org_id that has role 'institution_admin'
-- should be normalized to 'admin'.
UPDATE profiles
SET role = 'admin'
WHERE role = 'institution_admin'
  AND org_id IS NOT NULL;

-- Grant audit trail
COMMENT ON INDEX idx_org_members_org_user IS 'Added 2026-04-19: lookup index for (org_id, user_id); unique where user_id is not null.';
