-- Fix SECURITY DEFINER views flagged by Supabase security advisor
--
-- dashboard_stats: old view had no per-user WHERE filter — any authenticated
--   user could see all other users' stats. Now uses security_invoker so RLS
--   on underlying tables applies, plus explicit WHERE p.id = auth.uid().
--
-- user_progress_summary: old view joined auth.users directly, exposing
--   internal auth data to authenticated/anon roles. Now uses public.profiles
--   (which has RLS) instead of auth.users, plus security_invoker = true.

-- ── Fix 1: dashboard_stats ────────────────────────────────────────────────────

DROP VIEW IF EXISTS public.dashboard_stats;

CREATE VIEW public.dashboard_stats
WITH (security_invoker = true)
AS
SELECT
  p.id                                          AS user_id,
  p.journal_streak,
  p.membership_tier,
  COALESCE(je.total_entries, 0)                 AS total_journal_entries,
  COALESCE(cp.courses_in_progress, 0)           AS courses_in_progress,
  COALESCE(cp.courses_completed, 0)             AS courses_completed,
  COALESCE(a.active_count, 0)                   AS active_assumptions,
  COALESCE(a.manifested_count, 0)               AS manifested_count,
  COALESCE(qa.avg_score, 0)                     AS quiz_avg_score
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) AS total_entries
  FROM public.journal_entries GROUP BY user_id
) je ON je.user_id = p.id
LEFT JOIN (
  SELECT user_id,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS courses_completed,
    COUNT(*) FILTER (WHERE completed_at IS NULL)     AS courses_in_progress
  FROM public.course_progress GROUP BY user_id
) cp ON cp.user_id = p.id
LEFT JOIN (
  SELECT user_id,
    COUNT(*) FILTER (WHERE status = 'active')     AS active_count,
    COUNT(*) FILTER (WHERE status = 'manifested') AS manifested_count
  FROM public.assumptions GROUP BY user_id
) a ON a.user_id = p.id
LEFT JOIN (
  SELECT user_id, AVG(score_percent)::INTEGER AS avg_score
  FROM public.quiz_attempts GROUP BY user_id
) qa ON qa.user_id = p.id
WHERE p.id = auth.uid();

GRANT SELECT ON public.dashboard_stats TO authenticated;

-- ── Fix 2: user_progress_summary ─────────────────────────────────────────────

DROP VIEW IF EXISTS public.user_progress_summary;

CREATE VIEW public.user_progress_summary
WITH (security_invoker = true)
AS
SELECT
  p.id                                              AS user_id,
  COUNT(wp.id)                                      AS total_lessons_completed,
  COUNT(DISTINCT wp.track_id)                       AS tracks_touched,
  COUNT(tc.id)                                      AS tracks_fully_completed,
  MAX(wp.completed_at)                              AS last_activity,
  ARRAY_AGG(DISTINCT tc.track_id)
    FILTER (WHERE tc.track_id IS NOT NULL)          AS completed_tracks
FROM public.profiles p
LEFT JOIN public.workplace_progress wp ON wp.user_id = p.id
LEFT JOIN public.track_completions   tc ON tc.user_id = p.id
WHERE p.id = auth.uid()
GROUP BY p.id;

GRANT SELECT ON public.user_progress_summary TO authenticated;
