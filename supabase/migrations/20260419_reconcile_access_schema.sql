-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 20260419_reconcile_access_schema.sql
--
-- 1. Standardizes profiles schema (renames legacy institution columns).
-- 2. Seeds course_catalog with Business and Educator tracks.
-- 3. Updates access helper functions to use standardized column names.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. PROFILES SCHEMA RECONCILIATION ─────────────────────────────────────────

-- Ensure org_id exists (standardize from institution_id if needed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'institution_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'org_id') THEN
        ALTER TABLE profiles RENAME COLUMN institution_id TO org_id;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'org_id') THEN
        ALTER TABLE profiles ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Ensure vertical exists (standardize from institution_type or membership_type if needed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'institution_type') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'vertical') THEN
        ALTER TABLE profiles RENAME COLUMN institution_type TO vertical;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'vertical') THEN
        ALTER TABLE profiles ADD COLUMN vertical TEXT;
    END IF;
END $$;

-- Backfill org_id from profiles if missing but institution_id was present (precaution)
UPDATE profiles SET org_id = org_id WHERE org_id IS NULL; -- Placeholder if logic required

-- Ensure course_access uses org_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_access' AND column_name = 'institution_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_access' AND column_name = 'org_id') THEN
        ALTER TABLE course_access RENAME COLUMN institution_id TO org_id;
    END IF;
END $$;

-- ── 2. SEED COURSE CATALOG (BUSINESS & EDUCATOR) ─────────────────────────────

INSERT INTO course_catalog (
  slug, title, subtitle, description,
  vertical, tier_required, order_index, course_lesson_id,
  duration_estimate, color_hex, total_lessons, total_quizzes, estimated_hours
) VALUES
-- Business Tracks (Mapped to course_id 5-8)
(
  'common-sense-in-the-workplace',
  'Common Sense in the Workplace',
  'Interpersonal Awareness & Organizational IQ',
  'Success in the workplace is 20% technical skill and 80% social intelligence. Learn the unwritten rules of professional excellence, from radical accountability to the art of the proactive solution.',
  'business', 'free', 1, 5,
  '90 min', '#E8621A', 4, 1, 1.5
),
(
  'from-reaction-to-response',
  'From Reaction to Response',
  'Emotional Regulation for High-Stakes Environments',
  'Stress is inevitable; suffering is optional. Retrain your nervous system to pause between stimulus and response. Master the tools of de-escalation and emotional stabilization for a high-frequency work life.',
  'business', 'architect', 2, 6,
  '2 hr', '#C9A84C', 5, 2, 2.0
),
(
  'know-yourself-lead-yourself',
  'Know Yourself, Lead Yourself',
  'The Architecture of Self-Leadership',
  'You cannot lead others until you have mastered the internal authority. Identify your triggers, stabilize your frequency, and install the habit of self-revision. Leadership starts at the center of your own consciousness.',
  'business', 'architect', 3, 7,
  '2.5 hr', '#A855F7', 6, 2, 2.5
),
(
  'the-high-frequency-team',
  'The High Frequency Team',
  'Co-Regulation & Cultural Transformation',
  'The final stage. Learn to synchronize the collective RAS of a team. When every member inhabits the same vision of success, the Bridge of Incidents accelerates. Master the elite art of organizational manifestation.',
  'business', 'elite', 4, 8,
  '3 hr', '#0F505A', 7, 3, 3.0
),
-- Educator Tracks (Mapped to course_id 9-12)
(
  'the-educator-reset',
  'The Educator Reset',
  'Neuroscience-Based Wellness for the Modern Classroom',
  'Teacher burnout is a physiological state, not a personality flaw. Learn to reset your nervous system, program your RAS for student wins, and reclaim your authority from a place of neurological peace.',
  'educator', 'free', 1, 9,
  '1 hr', '#E8621A', 5, 1, 1.0
),
(
  'vibrational-leadership',
  'Vibrational Leadership',
  'The Teacher as a Frequency Holder',
  'The emotional climate of the classroom begins with the teacher. Master the art of assumption in the classroom. When you assume the brilliance of your students, their neurology begins to mirror your expectation.',
  'educator', 'architect', 2, 10,
  '2 hr', '#C9A84C', 6, 2, 2.0
),
(
  'co-regulation-mastery',
  'Co-Regulation Mastery',
  'Stabilizing the Classroom Ecosystem',
  'Behavior management is co-regulation. Learn to use your own stabilized presence to pull dysregulated students back across the threshold. A master educator is a thermostat, not a thermometer.',
  'educator', 'architect', 3, 11,
  '2.5 hr', '#A855F7', 6, 2, 2.5
),
(
  'the-retained-educator',
  'The Retained Educator',
  'Sustaining the Elite Educator Identity',
  'Move from surviving to thriving. Install the identity of the Master Architect in your career. Learn to use the Echo Theory to navigate school-year cycles and remain anchored in your vision of educational excellence.',
  'educator', 'elite', 4, 12,
  '3 hr', '#0F505A', 7, 3, 3.0
)
ON CONFLICT (slug) DO UPDATE SET
  vertical = EXCLUDED.vertical,
  course_lesson_id = EXCLUDED.course_lesson_id,
  tier_required = EXCLUDED.tier_required;

-- ── 3. UPDATE ACCESS HELPERS ─────────────────────────────────────────────────

-- Update get_org_vertical to use standardized column name
CREATE OR REPLACE FUNCTION public.get_org_vertical(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT o.vertical 
  FROM public.organizations o
  JOIN public.profiles p ON p.org_id = o.id
  WHERE p.id = p_user_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Update tier-cap trigger to use standardized column names
CREATE OR REPLACE FUNCTION cap_user_tier_to_institution_plan()
RETURNS TRIGGER AS $$
DECLARE
  inst_plan TEXT;
  tier_rank  INT;
  plan_rank  INT;
BEGIN
  -- No organization → no cap
  IF NEW.org_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT content_tier INTO inst_plan FROM organizations WHERE id = NEW.org_id;
  IF inst_plan IS NULL THEN
    -- Fallback to 'plan' column for backward compatibility with old migrations
    SELECT plan INTO inst_plan FROM organizations WHERE id = NEW.org_id;
  END IF;

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

  -- Cap tier to organization plan if user tier exceeds it
  IF tier_rank > plan_rank THEN
    NEW.membership_tier := inst_plan;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
