-- ─────────────────────────────────────────────────────────────────────────────
-- Course CMS — course_lessons table
-- Super admin can manage all content; authenticated users read based on tier.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists course_lessons (
  id           uuid        primary key default gen_random_uuid(),
  course_id    integer     not null check (course_id between 1 and 4),
  title        text        not null,
  type         text        not null check (type in ('video', 'text', 'header')),
  youtube_url  text,
  content      text,
  sort_order   integer     not null default 0,
  is_published boolean     not null default true,
  is_preview   boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Fast queries per course
create index if not exists course_lessons_course_order_idx
  on course_lessons (course_id, sort_order);

-- Auto-update updated_at
create or replace function update_course_lessons_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_course_lessons_updated_at on course_lessons;
create trigger trg_course_lessons_updated_at
  before update on course_lessons
  for each row execute function update_course_lessons_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table course_lessons enable row level security;

-- Super admin: full access
create policy "cms_super_admin_all" on course_lessons
  for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.is_super_admin = true
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.is_super_admin = true
    )
  );

-- Authenticated users: read published lessons they can access
create policy "cms_auth_read" on course_lessons
  for select
  using (
    is_published = true
    and auth.uid() is not null
    and exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and (
          -- Super admin sees all
          p.is_super_admin = true
          or
          -- Preview lessons available to every authenticated user
          course_lessons.is_preview = true
          or
          -- Architect: courses 1–3
          (p.membership_tier = 'architect' and course_lessons.course_id in (1, 2, 3))
          or
          -- Elite / Reality Master: all courses
          (p.membership_tier = 'elite')
          or
          -- Education institutions: courses 1, 2, 4 (course 3 blocked)
          (p.institution_type = 'education' and course_lessons.course_id in (1, 2, 4))
          or
          -- Business institutions: all courses
          (p.institution_type = 'business')
        )
    )
  );

-- Anonymous: preview-only
create policy "cms_anon_preview" on course_lessons
  for select
  using (
    is_published = true
    and is_preview = true
    and auth.uid() is null
  );
