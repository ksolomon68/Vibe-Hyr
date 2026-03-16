-- ─────────────────────────────────────────────────────────────────────────────
-- VIBE HYR — SUPER ADMIN
-- Adds: is_super_admin + bypass tracking on profiles/institutions,
--       admin_audit_log table. Seeds k.solomon@live.com as super admin.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. EXTEND PROFILES ───────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_super_admin  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_bypassed     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bypass_reason   TEXT,
  ADD COLUMN IF NOT EXISTS bypass_expiry   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bypass_notes    TEXT,
  ADD COLUMN IF NOT EXISTS bypass_added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── 2. EXTEND ORGANIZATIONS ───────────────────────────────────────────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS is_bypassed     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bypass_reason   TEXT,
  ADD COLUMN IF NOT EXISTS bypass_expiry   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bypass_notes    TEXT,
  ADD COLUMN IF NOT EXISTS bypass_added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mrr             NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'inactive')),
  ADD COLUMN IF NOT EXISTS website         TEXT,
  ADD COLUMN IF NOT EXISTS industry        TEXT;

-- ── 3. ADMIN AUDIT LOG ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  action      TEXT NOT NULL,
  target_type TEXT NOT NULL,  -- 'user' | 'institution' | 'course_access' | 'settings'
  target_id   TEXT,
  target_name TEXT,
  details     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS; no policies needed for normal users.

-- ── 4. UPDATE TIER-CAP TRIGGER: BYPASS EXEMPT ────────────────────────────────
-- Bypass users are exempt from institution tier cap.
CREATE OR REPLACE FUNCTION cap_user_tier_to_institution_plan()
RETURNS TRIGGER AS $$
DECLARE
  inst_plan TEXT;
  tier_rank  INT;
  plan_rank  INT;
BEGIN
  -- No institution → no cap
  IF NEW.institution_id IS NULL THEN RETURN NEW; END IF;
  -- Bypassed users are exempt from tier cap
  IF NEW.is_bypassed = TRUE THEN RETURN NEW; END IF;

  SELECT plan INTO inst_plan FROM institutions WHERE id = NEW.institution_id;
  IF inst_plan IS NULL THEN RETURN NEW; END IF;

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

  IF tier_rank > plan_rank THEN
    NEW.membership_tier := inst_plan;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. SEED SUPER ADMIN ──────────────────────────────────────────────────────
UPDATE profiles
SET
  is_super_admin  = TRUE,
  membership_tier = 'elite',
  full_name       = COALESCE(full_name, 'Keisha Solomon')
WHERE email = 'k.solomon@live.com';
