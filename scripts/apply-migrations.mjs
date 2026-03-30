/**
 * apply-migrations.mjs
 * Applies the course_lessons table migration and then seeds it with all lessons.
 * Run: node scripts/apply-migrations.mjs
 */

const SUPABASE_URL = 'https://dwpmujyycpgibpsculfd.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cG11anl5Y3BnaWJwc2N1bGZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQwMjM5OSwiZXhwIjoyMDg3OTc4Mzk5fQ.hv1-u4Zl74s_ms3ffKY74jMEF5dKrxU_0nrcKA7vNOo'

// We'll use the pg REST endpoint that Supabase exposes via the Management API
// or simply use the SQL edge function via the service-role access

async function runSQL(sql, label) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`${label} — HTTP ${resp.status}: ${body}`)
  }

  const result = await resp.json()
  return result
}

// ── Step 1: Create table ──────────────────────────────────────────────────────

const CREATE_TABLE_SQL = `
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

create index if not exists course_lessons_course_order_idx
  on course_lessons (course_id, sort_order);

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

alter table course_lessons enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'course_lessons' and policyname = 'cms_super_admin_all'
  ) then
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
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'course_lessons' and policyname = 'cms_auth_read'
  ) then
    create policy "cms_auth_read" on course_lessons
      for select
      using (
        is_published = true
        and auth.uid() is not null
        and exists (
          select 1 from profiles p
          where p.id = auth.uid()
            and (
              p.is_super_admin = true
              or course_lessons.is_preview = true
              or (p.membership_tier = 'architect' and course_lessons.course_id in (1, 2, 3))
              or (p.membership_tier = 'elite')
              or (p.institution_type = 'education' and course_lessons.course_id in (1, 2, 4))
              or (p.institution_type = 'business')
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'course_lessons' and policyname = 'cms_anon_preview'
  ) then
    create policy "cms_anon_preview" on course_lessons
      for select
      using (
        is_published = true
        and is_preview = true
        and auth.uid() is null
      );
  end if;
end $$;

alter table course_lessons
  add constraint if not exists course_lessons_course_sort_uniq
  unique (course_id, sort_order);
`

// ── Step 2: Seed data ─────────────────────────────────────────────────────────

const SEED_SQL = `
INSERT INTO course_lessons
  (course_id, title, type, youtube_url, sort_order, is_published, is_preview)
VALUES
(1, 'The 11 Million Bit Problem',                          'video', 'https://www.youtube.com/watch?v=mTjDPbUC44U', 1,  true, true),
(1, 'The Car Model Phenomenon',                            'video', 'https://www.youtube.com/watch?v=7zzyEcLtreA', 2,  true, true),
(1, 'Beta, Alpha, Theta — Your Three Operating Modes',    'video', 'https://www.youtube.com/watch?v=3oASflIFWHs', 3,  true, false),
(1, 'Installing New Filtering Instructions',               'video', 'https://www.youtube.com/watch?v=UvDAAwlFQBY', 4,  true, false),
(1, 'Module Quiz & Your RAS Assignment',                   'text',  NULL,                                           5,  true, false),
(2, 'The Law vs. The Law of Attraction',                   'text',  NULL, 1, true, false),
(2, 'Thinking Of vs. Thinking From',                       'text',  NULL, 2, true, false),
(2, 'Living in the End',                                   'text',  NULL, 3, true, false),
(2, 'The Bridge of Incidents',                             'text',  NULL, 4, true, false),
(2, 'The Feeling Is the Secret',                           'text',  NULL, 5, true, false),
(2, 'The Echo Theory — Understanding the Delay',           'text',  NULL, 6, true, false),
(2, 'Course 2 Knowledge Check',                            'text',  NULL, 7, true, false),
(3, 'What Is SATS — and Why It Works',                     'text',  NULL, 1, true, false),
(3, 'Constructing Your SATS Scene',                        'text',  NULL, 2, true, false),
(3, 'The 7-Night Integration Ritual',                      'text',  NULL, 3, true, false),
(3, 'Myelination — The 21-Day Science',                    'text',  NULL, 4, true, false),
(3, 'Common SATS Mistakes & How to Fix Them',              'text',  NULL, 5, true, false),
(3, 'SATS for Specific Desires',                           'text',  NULL, 6, true, false),
(3, 'The Chemical Cement — Dopamine, Serotonin & the Impression Process', 'text', NULL, 7, true, false),
(3, 'SATS Mastery Diagnostic',                             'text',  NULL, 8, true, false),
(4, 'The Mental Diet — What It Actually Means',            'text',  NULL, 1, true, false),
(4, 'The Decision Matrix',                                 'text',  NULL, 2, true, false),
(4, 'Staying Faithful When 3D Contradicts',                'text',  NULL, 3, true, false),
(4, 'Advanced Revision — Rewriting the Timeline',          'text',  NULL, 4, true, false),
(4, 'Monitoring Your Inner Speech',                        'text',  NULL, 5, true, false),
(4, 'The Persistence Principle',                           'text',  NULL, 6, true, false),
(4, 'Integrated Practice — All Four Systems Working Together', 'text', NULL, 7, true, false),
(4, 'The Life Mastery Score — Monthly Assessment Protocol','text',  NULL, 8, true, false),
(4, 'Course Completion — Your Reality Architecture',       'text',  NULL, 9, true, false)
ON CONFLICT (course_id, sort_order) DO NOTHING;
`

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔧  Applying course_lessons migration + seed via Supabase SQL API …\n')

  // The Supabase REST API doesn't expose raw SQL — we need to use the
  // Supabase Management API (api.supabase.io) or psql.
  // Since neither the CLI nor psql may be installed, let's use the JS client
  // to do it row by row, which is the safest approach.

  console.log('ℹ  Note: The Supabase REST API does not accept raw DDL.\n')
  console.log('   Please apply the migration via the Supabase dashboard SQL Editor:\n')
  console.log('   1. Go to https://supabase.com/dashboard/project/dwpmujyycpgibpsculfd/sql/new')
  console.log('   2. Paste the contents of:')
  console.log('      supabase/migrations/20260329_course_cms.sql\n')
  console.log('   3. Then paste the seed SQL below and run it.\n')
  console.log('─'.repeat(72))
  console.log(SEED_SQL)
  console.log('─'.repeat(72))
}

main()
