-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260419_expand_admin_roles.sql (Updated)
--
-- Expands exactly which 'role' values are allowed in:
--   • profiles
--   • organization_members
--
-- This includes both administrative roles (admin, institution_admin, super_admin)
-- and student/vertical roles (personal, business, educator, leader, member).
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. profiles.role ─────────────────────────────────────────────────────────
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
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

-- ── 2. organization_members.role ──────────────────────────────────────────────
ALTER TABLE organization_members
  DROP CONSTRAINT IF EXISTS organization_members_role_check;

ALTER TABLE organization_members
  ADD CONSTRAINT organization_members_role_check
    CHECK (role IN (
      'admin', 
      'member', 
      'leader', 
      'institution_admin',
      'personal', 
      'business', 
      'educator'
    ));
