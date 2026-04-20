-- ═══════════════════════════════════════════════════════════════════════════════
-- DEFINITIVE SCHEMA FIX: Run this ONCE in the Supabase SQL Editor
-- File: 20260419_definitive_constraint_fix.sql
--
-- This script supersedes all previous constraint migrations and resolves every
-- known conflict. Run it regardless of which previous migrations you have run.
-- All operations are idempotent (safe to run multiple times).
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: DIAGNOSE (read-only, for your reference)
-- ─────────────────────────────────────────────────────────────────────────────

-- Uncomment these SELECTs to see the current state before applying fixes:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
-- WHERE conrelid = 'profiles'::regclass AND contype = 'c'
-- ORDER BY conname;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: FIX profiles.role CONSTRAINT
-- History of conflicts:
--   20260317_manage_members.sql     → ('admin','member','super_admin')
--   20260418_add_leader_role.sql    → + 'leader'
--   20260419_expand_admin_roles.sql → + 'institution_admin','personal','business','educator'
--   20260419_final_fix.sql          → + 'institution_admin' (kept it)
--   20260419_reconcile_schema_fix.sql → same set
--   20260419_unify_admin_role.sql   → removed 'institution_admin'
--   20260419_fix_admin_provisioning.sql → same without 'institution_admin'
--
-- WHICHEVER version your DB has, this replaces it with the final correct set.
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1: Normalize any rows with invalid/legacy role values BEFORE dropping constraint
UPDATE profiles
SET role = 'admin'
WHERE role = 'institution_admin';

UPDATE profiles
SET role = 'member'
WHERE role NOT IN (
  'admin', 'member', 'super_admin', 'leader',
  'personal', 'business', 'educator'
);

-- Step 2: Replace the constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN (
  'admin',        -- org admins provisioned by super admin
  'member',       -- standard org members
  'super_admin',  -- platform super admins
  'leader',       -- leadership vertical org admins
  'personal',     -- personal/individual vertical users
  'business',     -- business vertical users
  'educator'      -- education vertical users
));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: FIX profiles.membership_type CONSTRAINT
-- History of conflicts:
--   20260418_sync_membership_type.sql → CHECK IN ('free','architect','elite')
--     + trigger to mirror membership_tier
--   20260419_org_verticals.sql → RLS policies use membership_type = 'education'
--     (a value that violates the constraint above)
--
-- Resolution: membership_type holds the VERTICAL. membership_tier holds the TIER.
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 3: Drop the broken sync trigger that wrote tier values into membership_type
DROP TRIGGER IF EXISTS trg_sync_membership_type ON profiles;
DROP FUNCTION IF EXISTS sync_membership_type();

-- Step 4: Replace the membership_type constraint to accept vertical values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_membership_type_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_membership_type_check
CHECK (membership_type IN (
  'individual',    -- standalone/personal users
  'personal',      -- alias for individual
  'education',     -- education vertical
  'business',      -- business vertical
  'leadership',    -- leadership vertical
  'educator'       -- educator sub-type
) OR membership_type IS NULL);

-- Step 5: Backfill membership_type from vertical for rows that had wrong tier values
UPDATE profiles
SET membership_type = COALESCE(vertical, 'individual')
WHERE membership_type IN ('free', 'architect', 'elite')
   OR membership_type IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: FIX organization_members.role CONSTRAINT
-- Ensure it allows 'admin' and 'member' only (as defined in the table schema).
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 6: Normalize org member roles
UPDATE organization_members
SET role = 'member'
WHERE role NOT IN ('admin', 'member');

-- Step 7: Recreate clean constraint
ALTER TABLE organization_members DROP CONSTRAINT IF EXISTS organization_members_role_check;

ALTER TABLE organization_members
ADD CONSTRAINT organization_members_role_check
CHECK (role IN ('admin', 'member'));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: ENSURE UNIQUE INDEX EXISTS FOR UPSERT
-- ─────────────────────────────────────────────────────────────────────────────

-- The onConflict: 'org_id,email' upsert requires this constraint to exist.
-- UNIQUE (org_id, email) was defined in 20260317_manage_members.sql — confirm it's there.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'organization_members'::regclass
      AND contype = 'u'
      AND array_length(conkey, 1) = 2
  ) THEN
    ALTER TABLE organization_members ADD CONSTRAINT org_members_org_email_unique UNIQUE (org_id, email);
  END IF;
END $$;

-- Partial unique index for (org_id, user_id) lookups — only where user_id is set
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_members_org_user
  ON organization_members (org_id, user_id)
  WHERE user_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: BACKFILL EXISTING DATA
-- ─────────────────────────────────────────────────────────────────────────────

-- Stamp user_id on org member rows that have a matching profile email but no user_id
UPDATE organization_members om
SET user_id = p.id,
    status  = 'active'
FROM profiles p
WHERE om.email = p.email
  AND om.user_id IS NULL;

-- Ensure org admin profiles have role = 'admin' (not 'institution_admin')
UPDATE profiles
SET role = 'admin'
WHERE org_id IS NOT NULL
  AND role = 'institution_admin';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: SUPER ADMIN RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Super admins read all org members" ON organization_members;
CREATE POLICY "Super admins read all org members"
  ON organization_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "Super admins manage all org members" ON organization_members;
CREATE POLICY "Super admins manage all org members"
  ON organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION (run after applying to confirm clean state)
-- ─────────────────────────────────────────────────────────────────────────────

-- SELECT conname, pg_get_constraintdef(oid) AS definition
-- FROM   pg_constraint
-- WHERE  conrelid IN ('profiles'::regclass, 'organization_members'::regclass)
--   AND  contype = 'c'
-- ORDER  BY conrelid::text, conname;
