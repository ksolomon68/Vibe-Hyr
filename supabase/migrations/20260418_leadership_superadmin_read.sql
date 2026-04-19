-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260418_leadership_superadmin_read.sql
--
-- Adds a super admin SELECT policy to both leadership progress tables,
-- matching the ulp_super_admin_read pattern from 20260330_lesson_progress.sql.
--
-- Pattern (from user_lesson_progress):
--   USING (
--     auth.uid() = user_id
--     or exists (
--       select 1 from profiles
--       where id = auth.uid()
--       and profiles.is_super_admin = true
--     )
--   )
--
-- Safe to re-run: uses DROP POLICY IF EXISTS before CREATE.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── leadership_progress ────────────────────────────────────────────────────────

drop policy if exists "lp_super_admin_read" on leadership_progress;

create policy "lp_super_admin_read"
  on leadership_progress
  for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from profiles
      where id = auth.uid()
        and profiles.is_super_admin = true
    )
  );

-- ── leadership_course_completions ─────────────────────────────────────────────

drop policy if exists "lcc_super_admin_read" on leadership_course_completions;

create policy "lcc_super_admin_read"
  on leadership_course_completions
  for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from profiles
      where id = auth.uid()
        and profiles.is_super_admin = true
    )
  );
