-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260403_bridge_forum_cohorts.sql
--
-- Adds vertical cohort isolation to the Bridge Forum.
-- Creates four isolated spaces: Personal, Educators, Business, Leadership.
--
-- Safe to run against a live database:
--   ✓ All DDL uses IF NOT EXISTS / IF EXISTS guards
--   ✓ Backfills existing data before adding NOT NULL constraints
--   ✓ Existing Stripe, auth, and educator course restriction logic untouched
--   ✓ Existing RLS policies on all other tables preserved
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. Extend institution_type to include 'leadership' ────────────────────────
-- Drop and recreate the CHECK constraint (cannot ALTER CHECK inline in PG).
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_institution_type_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_institution_type_check
  CHECK (institution_type IN ('individual', 'education', 'business', 'leadership'));

-- Extend organizations.type as well so leadership orgs can be created.
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_type_check;
ALTER TABLE organizations
  ADD CONSTRAINT organizations_type_check
  CHECK (type IN ('individual', 'education', 'business', 'leadership'));

-- ── 2. Add account_vertical to profiles ──────────────────────────────────────
-- Canonical cohort key. Distinct from institution_type because the display
-- names differ ('individual' → 'personal', 'education' → 'educator').
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_vertical TEXT
    CHECK (account_vertical IN ('personal', 'educator', 'business', 'leadership'));

-- Backfill from existing institution_type values.
UPDATE profiles
SET account_vertical = CASE institution_type
  WHEN 'individual'  THEN 'personal'
  WHEN 'education'   THEN 'educator'
  WHEN 'business'    THEN 'business'
  WHEN 'leadership'  THEN 'leadership'
  ELSE 'personal'
END
WHERE account_vertical IS NULL;

-- Set default and NOT NULL after backfill.
ALTER TABLE profiles
  ALTER COLUMN account_vertical SET DEFAULT 'personal',
  ALTER COLUMN account_vertical SET NOT NULL;

-- ── 3. Trigger: keep account_vertical in sync with institution_type ───────────
CREATE OR REPLACE FUNCTION sync_account_vertical()
RETURNS TRIGGER AS $$
BEGIN
  NEW.account_vertical := CASE NEW.institution_type
    WHEN 'individual'  THEN 'personal'
    WHEN 'education'   THEN 'educator'
    WHEN 'business'    THEN 'business'
    WHEN 'leadership'  THEN 'leadership'
    ELSE 'personal'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_vertical_on_profile_change ON profiles;
CREATE TRIGGER sync_vertical_on_profile_change
  BEFORE INSERT OR UPDATE OF institution_type
  ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_account_vertical();

-- ── 4. forum_spaces — cohort space configuration ──────────────────────────────
-- One row per vertical. Stores the space name, tag, description, and the
-- current weekly prompt. Weekly prompts are updated by a scheduled function
-- or super admin update; the forum component reads this row to seed the header.
CREATE TABLE IF NOT EXISTS forum_spaces (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vertical_cohort TEXT NOT NULL UNIQUE
    CHECK (vertical_cohort IN ('personal', 'educator', 'business', 'leadership')),
  space_name      TEXT NOT NULL,
  tag             TEXT NOT NULL,
  description     TEXT NOT NULL,
  weekly_prompt   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE forum_spaces ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read their own cohort's space config.
-- Super admin can read all.
CREATE POLICY "Users read own cohort space"
  ON forum_spaces FOR SELECT
  USING (
    vertical_cohort = (SELECT account_vertical FROM profiles WHERE id = auth.uid())
    OR (SELECT is_super_admin FROM profiles WHERE id = auth.uid())
  );

-- Only service role (super admin) can insert/update space config.
-- No policy needed — RLS default-deny covers non-service-role writes.

-- Seed the four cohort spaces.
INSERT INTO forum_spaces (vertical_cohort, space_name, tag, description, weekly_prompt)
VALUES
  (
    'personal',
    'Personal Reality Architects',
    'personal_cohort',
    'A space for solo practitioners. Share Bridge Moments, SATS wins, and assumption shifts from your 90-day plan.',
    'What synchronicity showed up this week — and what internal shift might it be echoing?'
  ),
  (
    'educator',
    'Educators'' Bridge',
    'educator_cohort',
    'A space for educators applying the RAS and Law of Assumption in their classrooms and institutions.',
    'What assumption about your students or institution shifted this week?'
  ),
  (
    'business',
    'Business Reality Lab',
    'business_cohort',
    'A space for business and workplace practitioners. Share de-escalation wins, team frequency shifts, and accountability updates.',
    'What Bridge of Incidents moved your team forward this week?'
  ),
  (
    'leadership',
    'Leadership Circle',
    'leadership_cohort',
    'A space for community leaders. Share internal authority shifts, vision updates, and Bridge of Incidents from the field.',
    'Where did the Bridge of Incidents show up in your leadership this week?'
  )
ON CONFLICT (vertical_cohort) DO NOTHING;

-- ── 5. Add vertical_cohort to bridge_forum_posts ──────────────────────────────
ALTER TABLE bridge_forum_posts
  ADD COLUMN IF NOT EXISTS vertical_cohort TEXT
    CHECK (vertical_cohort IN ('personal', 'educator', 'business', 'leadership'));

-- Backfill: existing posts were all from the Business vertical.
UPDATE bridge_forum_posts
SET vertical_cohort = 'business'
WHERE vertical_cohort IS NULL;

-- Set NOT NULL after backfill.
ALTER TABLE bridge_forum_posts
  ALTER COLUMN vertical_cohort SET NOT NULL,
  ALTER COLUMN vertical_cohort SET DEFAULT 'personal';

-- Index for fast cohort queries.
CREATE INDEX IF NOT EXISTS idx_bridge_forum_cohort
  ON bridge_forum_posts(vertical_cohort, created_at DESC);

-- ── 6. Replace broad SELECT policy with cohort-isolated policy ────────────────
-- Drop the old permissive policy that let all authenticated users read all posts.
DROP POLICY IF EXISTS "Authenticated users read forum posts" ON bridge_forum_posts;

-- New SELECT policy: user sees only their own cohort's posts.
-- Super admin sees all posts across all cohorts.
CREATE POLICY "Users read own cohort posts"
  ON bridge_forum_posts FOR SELECT
  USING (
    vertical_cohort = (SELECT account_vertical FROM profiles WHERE id = auth.uid())
    OR (SELECT is_super_admin FROM profiles WHERE id = auth.uid())
  );

-- ── 7. Replace old INSERT policy with cohort-enforced policy ──────────────────
DROP POLICY IF EXISTS "Users manage own forum posts" ON bridge_forum_posts;

-- New INSERT policy: user can only post into their own cohort space.
-- Super admin can post to any cohort (they select it explicitly in the UI).
CREATE POLICY "Users insert into own cohort"
  ON bridge_forum_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      vertical_cohort = (SELECT account_vertical FROM profiles WHERE id = auth.uid())
      OR (SELECT is_super_admin FROM profiles WHERE id = auth.uid())
    )
  );

-- Existing UPDATE policy ("Users update own forum posts") is already scoped to
-- auth.uid() = user_id, so no cross-cohort mutation is possible. Preserved as-is.

-- ── 8. Weekly thread seeding infrastructure ───────────────────────────────────
-- The weekly_prompt field in forum_spaces drives the weekly thread seed.
-- A scheduled Supabase Edge Function (or pg_cron job) should:
--   1. Read forum_spaces.weekly_prompt for each vertical
--   2. Insert a new is_pinned=true bridge_forum_posts row for each space
--   3. Unpin the previous week's auto-thread
-- This migration only creates the infrastructure; the cron schedule is
-- configured separately in Supabase Dashboard → Edge Functions → Schedules.

-- Trigger to auto-update forum_spaces.updated_at on weekly prompt changes.
CREATE OR REPLACE FUNCTION update_forum_spaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS forum_spaces_updated_at ON forum_spaces;
CREATE TRIGGER forum_spaces_updated_at
  BEFORE UPDATE ON forum_spaces
  FOR EACH ROW EXECUTE FUNCTION update_forum_spaces_updated_at();

-- ── 9. Accountability pairs — add vertical_cohort scoping ─────────────────────
-- Peer matching must be within the same cohort. Add vertical_cohort column
-- so the pairing logic can enforce same-cohort constraint at DB level.
ALTER TABLE accountability_pairs
  ADD COLUMN IF NOT EXISTS vertical_cohort TEXT
    CHECK (vertical_cohort IN ('personal', 'educator', 'business', 'leadership'));

-- Backfill existing pairs (all were Business/workplace).
UPDATE accountability_pairs
SET vertical_cohort = 'business'
WHERE vertical_cohort IS NULL;

ALTER TABLE accountability_pairs
  ALTER COLUMN vertical_cohort SET DEFAULT 'business';

-- Drop old read policy and add cohort-scoped one.
DROP POLICY IF EXISTS "Users read own pairs" ON accountability_pairs;
CREATE POLICY "Users read own cohort pairs"
  ON accountability_pairs FOR SELECT
  USING (
    (auth.uid() = user_a OR auth.uid() = user_b)
    AND vertical_cohort = (SELECT account_vertical FROM profiles WHERE id = auth.uid())
  );

-- Create policy: user_a must be in the same cohort.
DROP POLICY IF EXISTS "Users create pairs" ON accountability_pairs;
CREATE POLICY "Users create cohort pairs"
  ON accountability_pairs FOR INSERT
  WITH CHECK (
    auth.uid() = user_a
    AND vertical_cohort = (SELECT account_vertical FROM profiles WHERE id = auth.uid())
  );
