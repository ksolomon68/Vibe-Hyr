-- ─────────────────────────────────────────────────────────────────────────────
-- VIBE HYR — INSTITUTION ACCESS CONTROL
-- Adds: institutions table, course_access table,
--       institution_type + institution_id on profiles,
--       tier-cap trigger.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. INSTITUTIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS institutions (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name               TEXT NOT NULL,
  type               TEXT NOT NULL CHECK (type IN ('individual','education','business')),
  plan               TEXT NOT NULL CHECK (plan IN ('free','architect','elite')),
  seat_limit         INTEGER NOT NULL DEFAULT 50,
  seats_used         INTEGER NOT NULL DEFAULT 0,
  admin_user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  billing_email      TEXT,
  domain_restriction TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Institution admin can read/update their own institution
CREATE POLICY "Institution admin read own"
  ON institutions FOR SELECT
  USING (admin_user_id = auth.uid());

CREATE POLICY "Institution admin update own"
  ON institutions FOR UPDATE
  USING (admin_user_id = auth.uid());

-- Regular members can read the institution they belong to
CREATE POLICY "Members read own institution"
  ON institutions FOR SELECT
  USING (
    id IN (
      SELECT institution_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ── 2. PROFILES — add institution columns ────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS institution_type TEXT NOT NULL DEFAULT 'individual'
    CHECK (institution_type IN ('individual','education','business')),
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL;

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON profiles(institution_id);

-- ── 3. COURSE ACCESS ─────────────────────────────────────────────────────────
-- Explicit per-user or per-institution course grants (bypasses tier checks).
CREATE TABLE IF NOT EXISTS course_access (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  course_slug    TEXT NOT NULL,
  granted_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_slug)
);

ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;

-- Users can read their own grants
CREATE POLICY "Users read own course access"
  ON course_access FOR SELECT
  USING (user_id = auth.uid());

-- Institution admins can read access grants for their members
CREATE POLICY "Institution admins read org course access"
  ON course_access FOR SELECT
  USING (
    institution_id IN (
      SELECT id FROM institutions WHERE admin_user_id = auth.uid()
    )
  );

-- Institution admins can grant access to members of their institution
CREATE POLICY "Institution admins insert course access"
  ON course_access FOR INSERT
  WITH CHECK (
    institution_id IN (
      SELECT id FROM institutions WHERE admin_user_id = auth.uid()
    )
  );

-- Institution admins can revoke access from members of their institution
CREATE POLICY "Institution admins delete course access"
  ON course_access FOR DELETE
  USING (
    institution_id IN (
      SELECT id FROM institutions WHERE admin_user_id = auth.uid()
    )
  );

-- ── 4. TIER CAP TRIGGER ───────────────────────────────────────────────────────
-- Prevents a user's membership_tier from exceeding their institution's plan.
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

  SELECT plan INTO inst_plan FROM institutions WHERE id = NEW.institution_id;
  IF inst_plan IS NULL THEN
    RETURN NEW;
  END IF;

  -- Assign numeric ranks
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

  -- Cap tier to institution plan if user tier exceeds it
  IF tier_rank > plan_rank THEN
    NEW.membership_tier := inst_plan;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS cap_tier_on_profile_change ON profiles;

CREATE TRIGGER cap_tier_on_profile_change
  BEFORE INSERT OR UPDATE OF membership_tier, institution_id
  ON profiles
  FOR EACH ROW EXECUTE FUNCTION cap_user_tier_to_institution_plan();
