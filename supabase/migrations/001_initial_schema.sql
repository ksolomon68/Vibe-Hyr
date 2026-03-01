-- ─────────────────────────────────────────────────────────────────
-- VIBE HYR 2.0 · SUPABASE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor after creating your project
-- ─────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES ───────────────────────────────────────────────────
CREATE TABLE profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  full_name             TEXT,
  avatar_url            TEXT,
  membership_tier       TEXT NOT NULL DEFAULT 'free' CHECK (membership_tier IN ('free', 'architect', 'elite')),
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  journal_streak        INTEGER NOT NULL DEFAULT 0,
  last_journal_date     DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ── 2. JOURNAL ENTRIES ────────────────────────────────────────────
CREATE TABLE journal_entries (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  event_raw         TEXT NOT NULL,
  event_revised     TEXT NOT NULL,
  emotion_before    TEXT NOT NULL DEFAULT 'neutral',
  emotion_after     TEXT NOT NULL DEFAULT 'neutral',
  module_context    TEXT,
  active_assumption TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journal_user_date ON journal_entries(user_id, date DESC);

CREATE TRIGGER journal_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own journal entries" ON journal_entries
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-update streak when entry is saved
CREATE OR REPLACE FUNCTION update_journal_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_streak INTEGER;
BEGIN
  SELECT last_journal_date, journal_streak
    INTO last_date, current_streak
    FROM profiles WHERE id = NEW.user_id;

  IF last_date = CURRENT_DATE THEN
    -- Already journaled today, no change
    RETURN NEW;
  ELSIF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE profiles SET journal_streak = current_streak + 1, last_journal_date = CURRENT_DATE
    WHERE id = NEW.user_id;
  ELSE
    -- Streak broken
    UPDATE profiles SET journal_streak = 1, last_journal_date = CURRENT_DATE
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_journal_entry_created
  AFTER INSERT ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_journal_streak();

-- ── 3. ASSUMPTIONS ────────────────────────────────────────────────
CREATE TABLE assumptions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'manifested', 'released')),
  manifested_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE assumptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own assumptions" ON assumptions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 4. COURSE PROGRESS ────────────────────────────────────────────
CREATE TABLE course_progress (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id          TEXT NOT NULL,
  completed_lessons  TEXT[] NOT NULL DEFAULT '{}',
  progress_percent   INTEGER NOT NULL DEFAULT 0,
  completed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own course progress" ON course_progress
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER course_progress_updated_at
  BEFORE UPDATE ON course_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 5. LESSON NOTES ───────────────────────────────────────────────
CREATE TABLE lesson_notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id  TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own lesson notes" ON lesson_notes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 6. QUIZ ATTEMPTS ──────────────────────────────────────────────
CREATE TABLE quiz_attempts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id      TEXT NOT NULL,
  answers      JSONB NOT NULL DEFAULT '{}',
  score_percent INTEGER NOT NULL DEFAULT 0,
  passed       BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own quiz attempts" ON quiz_attempts
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 7. COMMUNITY POSTS ────────────────────────────────────────────
CREATE TABLE forum_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'general'
                 CHECK (category IN ('general', 'bridge_of_incidents', 'sats_wins', 'questions', 'accountability')),
  course_id    TEXT,
  upvotes      INTEGER NOT NULL DEFAULT 0,
  is_pinned    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_category   ON forum_posts(category, created_at DESC);
CREATE INDEX idx_posts_user       ON forum_posts(user_id, created_at DESC);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read posts"  ON forum_posts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts"          ON forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts"          ON forum_posts FOR DELETE USING (auth.uid() = user_id);

-- ── 8. FORUM COMMENTS ─────────────────────────────────────────────
CREATE TABLE forum_comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  upvotes    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read comments"  ON forum_comments FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated users can create comments" ON forum_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments"          ON forum_comments FOR DELETE USING (auth.uid() = user_id);

-- Auto-increment comment count on posts
CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts SET updated_at = NOW() WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON forum_comments
  FOR EACH ROW EXECUTE FUNCTION increment_comment_count();

-- ── 9. LIFE MASTERY SCORES ────────────────────────────────────────
CREATE TABLE life_mastery_scores (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month         TEXT NOT NULL,          -- 'YYYY-MM'
  relationships INTEGER NOT NULL DEFAULT 0 CHECK (relationships BETWEEN 0 AND 100),
  finances      INTEGER NOT NULL DEFAULT 0 CHECK (finances BETWEEN 0 AND 100),
  health        INTEGER NOT NULL DEFAULT 0 CHECK (health BETWEEN 0 AND 100),
  mindset       INTEGER NOT NULL DEFAULT 0 CHECK (mindset BETWEEN 0 AND 100),
  purpose       INTEGER NOT NULL DEFAULT 0 CHECK (purpose BETWEEN 0 AND 100),
  self_worth    INTEGER NOT NULL DEFAULT 0 CHECK (self_worth BETWEEN 0 AND 100),
  overall       INTEGER GENERATED ALWAYS AS (
    (relationships + finances + health + mindset + purpose + self_worth) / 6
  ) STORED,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);

ALTER TABLE life_mastery_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own scores" ON life_mastery_scores
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 10. USEFUL VIEWS ──────────────────────────────────────────────

-- Dashboard stats view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  p.id AS user_id,
  p.journal_streak,
  p.membership_tier,
  COALESCE(je.total_entries, 0)   AS total_journal_entries,
  COALESCE(cp.courses_in_progress, 0) AS courses_in_progress,
  COALESCE(cp.courses_completed, 0)   AS courses_completed,
  COALESCE(a.active_count, 0)     AS active_assumptions,
  COALESCE(a.manifested_count, 0) AS manifested_count,
  COALESCE(qa.avg_score, 0)       AS quiz_avg_score
FROM profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) AS total_entries FROM journal_entries GROUP BY user_id
) je ON je.user_id = p.id
LEFT JOIN (
  SELECT user_id,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS courses_completed,
    COUNT(*) FILTER (WHERE completed_at IS NULL)     AS courses_in_progress
  FROM course_progress GROUP BY user_id
) cp ON cp.user_id = p.id
LEFT JOIN (
  SELECT user_id,
    COUNT(*) FILTER (WHERE status = 'active')     AS active_count,
    COUNT(*) FILTER (WHERE status = 'manifested') AS manifested_count
  FROM assumptions GROUP BY user_id
) a ON a.user_id = p.id
LEFT JOIN (
  SELECT user_id, AVG(score_percent)::INTEGER AS avg_score FROM quiz_attempts GROUP BY user_id
) qa ON qa.user_id = p.id;
