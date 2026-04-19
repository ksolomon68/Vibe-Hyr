-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260418_add_leader_role.sql
--
-- Adds 'leader' to the allowed values for the role column on both:
--   • profiles (was: 'admin' | 'member' | 'super_admin')
--   • organization_members (was: 'admin' | 'member')
--
-- Postgres does not support ALTER CHECK inline, so we drop the old constraint
-- and add a new one. Safe to re-run: uses DROP CONSTRAINT IF EXISTS.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. profiles.role ─────────────────────────────────────────────────────────
-- Existing constraint name inferred from migration 20260317_manage_members.sql
-- where it was added as an inline CHECK (no explicit name → PG auto-names it).
-- We use IF EXISTS to make this idempotent.

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'member', 'super_admin', 'leader'));

-- ── 2. organization_members.role ──────────────────────────────────────────────
ALTER TABLE organization_members
  DROP CONSTRAINT IF EXISTS organization_members_role_check;

ALTER TABLE organization_members
  ADD CONSTRAINT organization_members_role_check
    CHECK (role IN ('admin', 'member', 'leader'));
