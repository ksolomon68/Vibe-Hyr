-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260419_profiles_org_id.sql
--
-- The org_verticals RLS policies reference p.org_id but no migration ever
-- added that column to profiles. The super-admin bypass flow also writes
-- org_id when upserting org-admin profiles, causing a "column does not exist"
-- error that silently prevents profile setup from completing.
--
-- Safe to re-run: ADD COLUMN IF NOT EXISTS.
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);

-- Backfill: copy institution_id → org_id for existing rows
UPDATE profiles
SET org_id = institution_id
WHERE institution_id IS NOT NULL AND org_id IS NULL;
