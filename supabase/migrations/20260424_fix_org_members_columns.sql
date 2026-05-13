-- ─────────────────────────────────────────────────────────────────────────────
-- FIX organization_members MISSING COLUMNS
-- Adds invited_at (and other columns from 20260317_manage_members.sql) that
-- may be absent when the table was created before that migration ran.
-- Safe to re-run: all statements use IF NOT EXISTS guards.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE organization_members
  ADD COLUMN IF NOT EXISTS invited_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invited_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS joined_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ NOT NULL DEFAULT now();

-- No back-fill needed: invited_at DEFAULT now() already covers existing rows.

-- Ensure the updated_at trigger exists (no-op if already present)
DROP TRIGGER IF EXISTS org_members_updated_at ON organization_members;
CREATE TRIGGER org_members_updated_at
  BEFORE UPDATE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
