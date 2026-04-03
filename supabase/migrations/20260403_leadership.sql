-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260403_leadership.sql
-- Adds the Leadership vertical progress tables.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── leadership_progress ────────────────────────────────────────────────────────
-- Tracks per-lesson completion for the Leadership vertical.
CREATE TABLE IF NOT EXISTS leadership_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    text NOT NULL,  -- e.g. 'leadership_course_1'
  lesson_id    text NOT NULL,  -- e.g. 'the-responsibility-formula'
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, lesson_id)
);

ALTER TABLE leadership_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own leadership progress"
  ON leadership_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own leadership progress"
  ON leadership_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own leadership progress"
  ON leadership_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ── leadership_course_completions ─────────────────────────────────────────────
-- Tracks full-course completion milestones (triggers email, unlocks next course).
CREATE TABLE IF NOT EXISTS leadership_course_completions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE leadership_course_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own leadership course completions"
  ON leadership_course_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own leadership course completions"
  ON leadership_course_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own leadership course completions"
  ON leadership_course_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leadership_progress_user     ON leadership_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_leadership_progress_course   ON leadership_progress (user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_leadership_completions_user  ON leadership_course_completions (user_id);
