-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260419_expand_admin_roles.sql
--
-- Adds 'institution_admin' to the allowed values for the role column on both:
--   • profiles (previously: 'admin' | 'member' | 'super_admin' | 'leader')
--   • organization_members (previously: 'admin' | 'member' | 'leader')
--
-- Note: 'admin' is still used for membership role mapping, but the internal
-- platform role in profiles uses 'institution_admin' for education/business.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. profiles.role ─────────────────────────────────────────────────────────
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'member', 'super_admin', 'leader', 'institution_admin'));

-- ── 2. organization_members.role ──────────────────────────────────────────────
ALTER TABLE organization_members
  DROP CONSTRAINT IF EXISTS organization_members_role_check;

ALTER TABLE organization_members
  ADD CONSTRAINT organization_members_role_check
    CHECK (role IN ('admin', 'member', 'leader', 'institution_admin'));
