-- ============================================================
-- Vibe Hyr — Workplace Training Series
-- Supabase migrations
-- Run in order in the Supabase SQL editor
-- ============================================================

-- ── 1. Workplace lesson progress ─────────────────────────────────────────────
create table if not exists public.workplace_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  track_id        text not null,      -- e.g. 't1', 't2', 't3', 't4'
  lesson_id       text not null,      -- e.g. 't1l1', 't2l3'
  completed_at    timestamptz not null default now(),

  unique(user_id, track_id, lesson_id)
);

-- RLS: users can only read/write their own rows
alter table public.workplace_progress enable row level security;

create policy "Users read own workplace progress"
  on public.workplace_progress for select
  using (auth.uid() = user_id);

create policy "Users insert own workplace progress"
  on public.workplace_progress for insert
  with check (auth.uid() = user_id);

create policy "Users upsert own workplace progress"
  on public.workplace_progress for update
  using (auth.uid() = user_id);

-- Index for fast per-user lookups
create index if not exists idx_workplace_progress_user
  on public.workplace_progress(user_id, track_id);


-- ── 2. Track completions (full track done) ────────────────────────────────────
create table if not exists public.track_completions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  track_id        text not null,
  completed_at    timestamptz not null default now(),

  unique(user_id, track_id)
);

alter table public.track_completions enable row level security;

create policy "Users read own completions"
  on public.track_completions for select
  using (auth.uid() = user_id);

create policy "Users insert own completions"
  on public.track_completions for insert
  with check (auth.uid() = user_id);

create policy "Users upsert own completions"
  on public.track_completions for update
  using (auth.uid() = user_id);


-- ── 3. SATS journal entries ────────────────────────────────────────────────────
-- Used by both the personal platform and the workplace revision journal
create table if not exists public.journal_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  entry_type      text not null check (entry_type in (
                    'sats',           -- State Akin to Sleep session
                    'revision',       -- Evening Revision (Neville technique)
                    'identity',       -- Identity/assumption note
                    'bridge_moment',  -- Bridge of Incidents win
                    'trigger_log',    -- Trigger mapping entry (Track 01)
                    'assumption_lab', -- Assumption Lab scenario response
                    'accountability'  -- Clean miss / commitment note
                  )),
  content         text not null,
  emotion_tags    text[] default '{}',
  track_ref       text,    -- optional: 't1', 't2', etc.
  lesson_ref      text,    -- optional: 't1l3', etc.
  is_private      boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

create policy "Users manage own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_journal_user_type
  on public.journal_entries(user_id, entry_type, created_at desc);


-- ── 4. Bridge Forum posts ─────────────────────────────────────────────────────
create table if not exists public.bridge_forum_posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  track_id        text,                  -- which track this relates to
  title           text not null,
  body            text not null,
  post_type       text not null default 'bridge_win'
                  check (post_type in ('bridge_win', 'question', 'insight', 'accountability_update')),
  upvotes         int not null default 0,
  reply_count     int not null default 0,
  is_pinned       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.bridge_forum_posts enable row level security;

create policy "Authenticated users read forum posts"
  on public.bridge_forum_posts for select
  using (auth.role() = 'authenticated');

create policy "Users manage own forum posts"
  on public.bridge_forum_posts for insert
  with check (auth.uid() = user_id);

create policy "Users update own forum posts"
  on public.bridge_forum_posts for update
  using (auth.uid() = user_id);

create index if not exists idx_bridge_forum_track
  on public.bridge_forum_posts(track_id, created_at desc);


-- ── 5. Accountability partners ─────────────────────────────────────────────────
create table if not exists public.accountability_pairs (
  id              uuid primary key default gen_random_uuid(),
  user_a          uuid not null references auth.users(id) on delete cascade,
  user_b          uuid not null references auth.users(id) on delete cascade,
  track_id        text not null,
  paired_at       timestamptz not null default now(),
  checkin_date    timestamptz,    -- scheduled 30-day check-in
  status          text not null default 'active'
                  check (status in ('active', 'completed', 'paused')),

  unique(user_a, user_b, track_id)
);

alter table public.accountability_pairs enable row level security;

create policy "Users read own pairs"
  on public.accountability_pairs for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users create pairs"
  on public.accountability_pairs for insert
  with check (auth.uid() = user_a);


-- ── 6. Identity audit results ─────────────────────────────────────────────────
-- Stores the 90-Day Identity Shift Plan (Track 03 capstone)
create table if not exists public.identity_plans (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  identity_state      text not null,     -- felt-sense description
  limiting_belief     text not null,     -- precise belief being shifted
  daily_stack_time    text,              -- e.g. '9:30pm'
  marker_30_day       text,              -- behavioral marker
  marker_60_day       text,
  marker_90_day       text,
  accountability_partner_id uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Only one active plan per user
  unique(user_id)
);

alter table public.identity_plans enable row level security;

create policy "Users manage own identity plan"
  on public.identity_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── 7. Team frequency anchors (Track 04) ─────────────────────────────────────
-- Stores team-level deliverables from the Team Frequency Design Session
create table if not exists public.team_anchors (
  id                  uuid primary key default gen_random_uuid(),
  team_name           text not null,
  org_id              text,              -- optional org/institution reference
  frequency_anchor    text not null,     -- the team's chosen baseline statement
  language_agreement  jsonb,             -- { term: definition } pairs
  accountability_charter text,           -- full charter text
  created_by          uuid not null references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.team_anchors enable row level security;

create policy "Team anchor creators read/write"
  on public.team_anchors for all
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);


-- ── 8. Quiz scores (optional analytics) ──────────────────────────────────────
create table if not exists public.quiz_attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  lesson_id       text not null,
  score           int not null,
  total           int not null,
  passed          boolean not null,
  attempted_at    timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "Users read own quiz attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Users insert own quiz attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

create index if not exists idx_quiz_user_lesson
  on public.quiz_attempts(user_id, lesson_id);


-- ── 9. Helper view: user_progress_summary ─────────────────────────────────────
create or replace view public.user_progress_summary as
select
  u.id                                          as user_id,
  count(wp.id)                                  as total_lessons_completed,
  count(distinct wp.track_id)                   as tracks_touched,
  count(tc.id)                                  as tracks_fully_completed,
  max(wp.completed_at)                          as last_activity,
  array_agg(distinct tc.track_id)
    filter (where tc.track_id is not null)      as completed_tracks
from auth.users u
left join public.workplace_progress wp on wp.user_id = u.id
left join public.track_completions   tc on tc.user_id = u.id
group by u.id;

-- RLS: users see only their own row
create policy "Users read own progress summary"
  on public.user_progress_summary for select
  using (auth.uid() = user_id);
