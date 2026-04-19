-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260418_fix_tier_cap_trigger.sql
--
-- Re-creates cap_user_tier_to_institution_plan() with an explicit reference to
-- the `organizations` table (not the old `institutions` alias that appeared in
-- early versions of the function). Drops the old trigger first so we can
-- DROP + RECREATE the function cleanly.
--
-- Safe to re-run: uses CREATE OR REPLACE + DROP TRIGGER IF EXISTS.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. Drop old trigger so the function can be replaced ───────────────────────
DROP TRIGGER IF EXISTS cap_tier_on_profile_change ON profiles;

-- ── 2. Drop & recreate the function with the correct table name ───────────────
CREATE OR REPLACE FUNCTION cap_user_tier_to_institution_plan()
RETURNS TRIGGER AS $$
DECLARE
  inst_plan TEXT;
  tier_rank  INT;
  plan_rank  INT;
BEGIN
  -- No institution → no cap
  IF NEW.institution_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Reference organizations (not the old institutions alias)
  SELECT plan INTO inst_plan
  FROM organizations
  WHERE id = NEW.institution_id;

  IF inst_plan IS NULL THEN
    RETURN NEW;
  END IF;

  -- Numeric rank for comparison
  tier_rank := CASE NEW.membership_tier
    WHEN 'free'      THEN 0
    WHEN 'architect' THEN 1
    WHEN 'elite'     THEN 2
    ELSE 0
  END;

  plan_rank := CASE inst_plan
    WHEN 'free'      THEN 0
    WHEN 'architect' THEN 1
    WHEN 'elite'     THEN 2
    ELSE 0
  END;

  -- Cap: user tier cannot exceed institution plan
  IF tier_rank > plan_rank THEN
    NEW.membership_tier := inst_plan;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. Recreate trigger ───────────────────────────────────────────────────────
CREATE TRIGGER cap_tier_on_profile_change
  BEFORE INSERT OR UPDATE OF membership_tier, institution_id
  ON profiles
  FOR EACH ROW EXECUTE FUNCTION cap_user_tier_to_institution_plan();
