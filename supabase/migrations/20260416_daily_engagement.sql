-- ============================================================
-- Daily Engagement: Neural Pulse Check-In + Mental Diet Tracker
-- 2026-04-16
-- ============================================================

-- ── Tables ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_checkins (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  checked_in_at   timestamptz NOT NULL DEFAULT now(),
  date            date NOT NULL DEFAULT CURRENT_DATE,
  state_label     text NOT NULL
    CHECK (state_label IN ('beta_resistance','alpha_aware','theta_receptive','identity_locked')),
  state_score     int NOT NULL CHECK (state_score BETWEEN 1 AND 4),
  journal_prompt  text,
  journal_response text,
  streak_count    int NOT NULL DEFAULT 1,
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS mental_diet_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at         timestamptz NOT NULL DEFAULT now(),
  date              date NOT NULL DEFAULT CURRENT_DATE,
  category          text NOT NULL
    CHECK (category IN ('thoughts','media','conversations','reactions')),
  entry_text        text NOT NULL,
  compliance_rating int NOT NULL CHECK (compliance_rating BETWEEN 1 AND 3),
  bridge_day        int
);

-- ── Profile columns ─────────────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS checkin_streak               int          DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_checkin_date            date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bridge_start_date            date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mental_diet_score            numeric(4,1) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS identity_score_contribution  numeric(4,1) DEFAULT 0;

-- ── Indexes ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date
  ON daily_checkins (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_mental_diet_logs_user_date
  ON mental_diet_logs (user_id, date DESC);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE daily_checkins  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_diet_logs ENABLE ROW LEVEL SECURITY;

-- daily_checkins: users own their rows
CREATE POLICY "checkins_select_own" ON daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "checkins_insert_own" ON daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checkins_update_own" ON daily_checkins
  FOR UPDATE USING (auth.uid() = user_id);

-- mental_diet_logs: users own their rows
CREATE POLICY "diet_select_own" ON mental_diet_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "diet_insert_own" ON mental_diet_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Super admin full access is handled via the service-role client (bypasses RLS).
-- No extra policy needed — service role key already skips RLS.
