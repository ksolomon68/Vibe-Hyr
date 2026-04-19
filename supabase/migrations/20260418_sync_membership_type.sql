-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260418_sync_membership_type.sql
--
-- Adds profiles.membership_type (human-readable alias for membership_tier)
-- and keeps it in sync via trigger on every INSERT or UPDATE of membership_tier.
--
-- Safe to re-run: uses ADD COLUMN IF NOT EXISTS and DROP TRIGGER IF EXISTS.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. Add the column ─────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS membership_type TEXT
    CHECK (membership_type IN ('free', 'architect', 'elite'));

-- ── 2. Backfill from existing membership_tier values ─────────────────────────
UPDATE profiles
SET membership_type = membership_tier
WHERE membership_type IS NULL;

-- ── 3. Sync function ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_membership_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Mirror membership_tier directly; both share the same allowed values.
  NEW.membership_type := NEW.membership_tier;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 4. Trigger (fires BEFORE INSERT and BEFORE UPDATE of membership_tier) ─────
DROP TRIGGER IF EXISTS trg_sync_membership_type ON profiles;

CREATE TRIGGER trg_sync_membership_type
  BEFORE INSERT OR UPDATE OF membership_tier
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_membership_type();
