-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260418_course_catalog.sql
--
-- Creates the canonical course_catalog table (reverse-engineered from the
-- courses table seed data + leadership curriculum.ts), then seeds:
--   • 4 personal courses (from 20260315_courses_table.sql)
--   • 4 leadership courses (from src/lib/leadership/curriculum.ts)
--
-- Safe to re-run: uses IF NOT EXISTS + ON CONFLICT DO NOTHING.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. Create course_catalog ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_catalog (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  slug              TEXT          NOT NULL UNIQUE,
  title             TEXT          NOT NULL,
  subtitle          TEXT,
  description       TEXT,
  vertical          TEXT          NOT NULL
    CHECK (vertical IN ('personal', 'educator', 'business', 'leadership')),
  tier_required     TEXT          NOT NULL DEFAULT 'free'
    CHECK (tier_required IN ('free', 'architect', 'elite')),
  order_index       INTEGER       NOT NULL,  -- within vertical (1-4)
  course_lesson_id  INTEGER,                 -- maps to course_lessons.course_id integer key
  duration_estimate TEXT,
  color_hex         TEXT,
  total_lessons     INTEGER       NOT NULL DEFAULT 0,
  total_quizzes     INTEGER       NOT NULL DEFAULT 0,
  estimated_hours   NUMERIC(4,1),
  is_published      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── 2. Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_course_catalog_vertical
  ON course_catalog (vertical, order_index);

CREATE INDEX IF NOT EXISTS idx_course_catalog_tier
  ON course_catalog (tier_required);

-- ── 3. Auto-update updated_at ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_course_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_course_catalog_updated_at ON course_catalog;
CREATE TRIGGER trg_course_catalog_updated_at
  BEFORE UPDATE ON course_catalog
  FOR EACH ROW EXECUTE FUNCTION update_course_catalog_updated_at();

-- ── 4. RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE course_catalog ENABLE ROW LEVEL SECURITY;

-- Everyone (including anon) can read published courses
CREATE POLICY "course_catalog_read_published"
  ON course_catalog FOR SELECT
  USING (is_published = TRUE);

-- Super admin can manage all rows
CREATE POLICY "course_catalog_super_admin_all"
  ON course_catalog FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = TRUE
    )
  );

-- ── 5. Seed: Personal courses ─────────────────────────────────────────────────
-- Reverse-engineered from 20260315_courses_table.sql seed data.
-- course_lesson_id matches the integer course_id in course_lessons table.

INSERT INTO course_catalog (
  slug, title, subtitle, description,
  vertical, tier_required, order_index, course_lesson_id,
  duration_estimate, color_hex, total_lessons, total_quizzes, estimated_hours
) VALUES
(
  'programming-the-gatekeeper',
  'Programming the Gatekeeper',
  'The Neuroscience of Focus & the Reticular Activating System',
  'Your brain receives 11 million bits of information per second but consciously processes only 50. The Reticular Activating System decides what you see — and you can program it. This course teaches you how.',
  'personal', 'free', 1, 1,
  '2 hr', '#E8621A', 5, 1, 2.0
),
(
  'mastery-of-the-law-of-assumption',
  'Mastery of the Law of Assumption',
  'From "Thinking Of" to "Thinking From" — Consciousness Objectified',
  'The Law of Assumption states that whatever you assume to be true becomes your reality. This is not attraction — it''s selection. Learn to inhabit the end result now, and let the bridge appear.',
  'personal', 'architect', 2, 2,
  '3 hr', '#C9A84C', 7, 2, 3.0
),
(
  'subconscious-reprogramming-sats',
  'Subconscious Reprogramming via SATS',
  'The Hypnagogic Window — Where New Realities Are Seeded',
  'The State Akin to Sleep is a 5-10 minute window each night where your brain enters Theta waves and the critical factor falls away. This is your direct line to the subconscious. Learn to use it with precision.',
  'personal', 'architect', 3, 3,
  '3.5 hr', '#A855F7', 8, 2, 3.5
),
(
  'navigating-the-echo-theory-delay',
  'Navigating the Echo Theory Delay',
  'The Mental Diet & Staying Faithful When Reality Lags',
  'Current reality is an echo of your past thoughts — typically 60-90 days behind your internal shifts. This course teaches you to persist through the delay, maintain the mental diet, and trust the bridge when 3D evidence contradicts your assumption.',
  'personal', 'elite', 4, 4,
  '4 hr', '#0F505A', 9, 3, 4.0
)
ON CONFLICT (slug) DO NOTHING;

-- ── 6. Seed: Leadership courses ───────────────────────────────────────────────
-- Sourced from src/lib/leadership/curriculum.ts
-- course_lesson_id maps to integers 13-16 (set in 20260403_course_lessons_expand.sql)

INSERT INTO course_catalog (
  slug, title, subtitle, description,
  vertical, tier_required, order_index, course_lesson_id,
  duration_estimate, color_hex, total_lessons, total_quizzes, estimated_hours
) VALUES
(
  'leadership-the-internal-authority',
  'The Internal Authority',
  'RAS Programming for Community Leaders',
  'Shift from Community Member to Community Architect by retraining your brain''s filter. Leadership is not a title—it is a neurological pattern of assumption. This course rewires the filter from the inside out.',
  'leadership', 'free', 1, 13,
  '75–90 min', '#E8621A', 6, 1, 1.5
),
(
  'leadership-visionary-architecture',
  'Visionary Architecture',
  'SATS and Mental Rehearsal for Community Leaders',
  'A vision without a felt internal state is just a plan. This course teaches leaders to use the hypnagogic threshold to install a living, emotionally charged picture of the thriving community—one the subconscious cannot distinguish from present reality.',
  'leadership', 'architect', 2, 14,
  '75–90 min', '#C9A84C', 6, 1, 1.5
),
(
  'leadership-bridge-of-incidents',
  'The Bridge of Incidents',
  'Execution, Navigation, and the Natural Unfolding',
  'Vision without execution is hallucination. This course teaches leaders to recognize the Bridge of Incidents—the chain of seemingly coincidental events that constitute the natural path from internal assumption to external reality—and to persist through the grind with strategic precision.',
  'leadership', 'architect', 3, 15,
  '75–90 min', '#A855F7', 6, 1, 1.5
),
(
  'leadership-echo-theory-mastery',
  'Echo Theory Mastery',
  'The Elite Identity and the Multiplier Effect',
  'The final course. This is where the leader and the community vision become one. The internal state is no longer something the leader manages—it is who the leader is. At this level, the stabilized frequency automatically elevates the entire group without deliberate effort.',
  'leadership', 'elite', 4, 16,
  '90–105 min', '#0F505A', 6, 1, 1.75
)
ON CONFLICT (slug) DO NOTHING;
