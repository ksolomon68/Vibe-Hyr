-- ─────────────────────────────────────────────────────────────────────────────
-- 20260330_lesson_progress.sql
--
-- Adds the user_lesson_progress table (detailed per-lesson tracking), RLS
-- policies, and mark_lesson_complete / unmark_lesson_complete helper functions.
--
-- The existing `course_progress` table continues to serve as the write target
-- for the API routes and hook. This migration also fortifies its RLS and adds
-- the SQL convenience functions that call into it.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. user_lesson_progress table ────────────────────────────────────────────

create table if not exists user_lesson_progress (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  lesson_id    uuid        not null,
  course_id    integer     not null,
  completed    boolean     not null default false,
  completed_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(user_id, lesson_id)
);

-- Index for fast per-user queries
create index if not exists idx_ulp_user_course
  on user_lesson_progress(user_id, course_id);

-- Updated_at auto-trigger
create or replace function _set_ulp_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_ulp_updated_at on user_lesson_progress;
create trigger trg_ulp_updated_at
  before update on user_lesson_progress
  for each row execute function _set_ulp_updated_at();

-- ── 2. RLS for user_lesson_progress ──────────────────────────────────────────

alter table user_lesson_progress enable row level security;

-- Users can read their own rows
drop policy if exists "ulp_user_read" on user_lesson_progress;
create policy "ulp_user_read"
  on user_lesson_progress for select
  using (user_id = auth.uid());

-- Users can insert their own rows
drop policy if exists "ulp_user_insert" on user_lesson_progress;
create policy "ulp_user_insert"
  on user_lesson_progress for insert
  with check (user_id = auth.uid());

-- Users can update their own rows
drop policy if exists "ulp_user_update" on user_lesson_progress;
create policy "ulp_user_update"
  on user_lesson_progress for update
  using (user_id = auth.uid());

-- Super admin can read all rows
drop policy if exists "ulp_super_admin_read" on user_lesson_progress;
create policy "ulp_super_admin_read"
  on user_lesson_progress for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.is_super_admin = true
    )
  );

-- No public (anon) access

-- ── 3. RLS for course_progress (ensure policies exist) ───────────────────────

alter table if exists course_progress enable row level security;

drop policy if exists "cp_user_read" on course_progress;
create policy "cp_user_read"
  on course_progress for select
  using (user_id = auth.uid());

drop policy if exists "cp_user_insert" on course_progress;
create policy "cp_user_insert"
  on course_progress for insert
  with check (user_id = auth.uid());

drop policy if exists "cp_user_update" on course_progress;
create policy "cp_user_update"
  on course_progress for update
  using (user_id = auth.uid());

drop policy if exists "cp_user_delete" on course_progress;
create policy "cp_user_delete"
  on course_progress for delete
  using (user_id = auth.uid());

drop policy if exists "cp_super_admin_read" on course_progress;
create policy "cp_super_admin_read"
  on course_progress for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.is_super_admin = true
    )
  );

-- ── 4. mark_lesson_complete (writes to course_progress) ──────────────────────

create or replace function mark_lesson_complete(
  p_lesson_id uuid,
  p_course_id text   -- course_progress uses text course_id (e.g. 'c01')
)
returns void
language plpgsql
security definer
as $$
begin
  insert into course_progress (user_id, lesson_id, course_id, completed_at, updated_at)
  values (auth.uid(), p_lesson_id::text, p_course_id, now(), now())
  on conflict (user_id, course_id, lesson_id)
  do update set
    completed_at = now(),
    updated_at   = now();
end;
$$;

-- ── 5. unmark_lesson_complete ─────────────────────────────────────────────────

create or replace function unmark_lesson_complete(
  p_lesson_id uuid,
  p_course_id text
)
returns void
language plpgsql
security definer
as $$
begin
  delete from course_progress
  where user_id   = auth.uid()
    and lesson_id = p_lesson_id::text
    and course_id = p_course_id;
end;
$$;

-- ── 6. Grant execute permissions ──────────────────────────────────────────────

grant execute on function mark_lesson_complete(uuid, text)   to authenticated;
grant execute on function unmark_lesson_complete(uuid, text) to authenticated;
