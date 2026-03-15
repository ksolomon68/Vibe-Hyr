-- ─────────────────────────────────────────────────────────────────────────────
-- VIBE HYR — COURSES TABLE
-- Adds: courses table for dynamic course management.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS courses (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug               TEXT NOT NULL UNIQUE,
  title              TEXT NOT NULL,
  subtitle           TEXT,
  description        TEXT,
  tier               TEXT NOT NULL CHECK (tier IN ('free', 'architect', 'elite')),
  order_index        INTEGER NOT NULL,
  thumbnail_url      TEXT,
  total_lessons      INTEGER NOT NULL DEFAULT 0,
  total_quizzes      INTEGER NOT NULL DEFAULT 0,
  estimated_hours    NUMERIC(4,1),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Everyone can read courses
CREATE POLICY "Everyone can read courses"
  ON courses FOR SELECT
  USING (TRUE);

-- Only super admins can manage courses
CREATE POLICY "Super admins manage courses"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- Auto-update updated_at
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert initial courses
INSERT INTO courses (slug, title, subtitle, description, tier, order_index, total_lessons, total_quizzes, estimated_hours) VALUES
('programming-the-gatekeeper', 'Programming the Gatekeeper', 'The Neuroscience of Focus & the Reticular Activating System', 'Your brain receives 11 million bits of information per second but consciously processes only 50. The Reticular Activating System decides what you see — and you can program it. This course teaches you how.', 'free', 1, 5, 1, 2),
('mastery-of-the-law-of-assumption', 'Mastery of the Law of Assumption', 'From "Thinking Of" to "Thinking From" — Consciousness Objectified', 'The Law of Assumption states that whatever you assume to be true becomes your reality. This is not attraction — it''s selection. Learn to inhabit the end result now, and let the bridge appear.', 'architect', 2, 7, 2, 3),
('subconscious-reprogramming-sats', 'Subconscious Reprogramming via SATS', 'The Hypnagogic Window — Where New Realities Are Seeded', 'The State Akin to Sleep is a 5-10 minute window each night where your brain enters Theta waves and the critical factor falls away. This is your direct line to the subconscious. Learn to use it with precision.', 'architect', 3, 8, 2, 3.5),
('navigating-the-echo-theory-delay', 'Navigating the Echo Theory Delay', 'The Mental Diet & Staying Faithful When Reality Lags', 'Current reality is an echo of your past thoughts — typically 60-90 days behind your internal shifts. This course teaches you to persist through the delay, maintain the mental diet, and trust the bridge when 3D evidence contradicts your assumption.', 'elite', 4, 9, 3, 4)
ON CONFLICT (slug) DO NOTHING;