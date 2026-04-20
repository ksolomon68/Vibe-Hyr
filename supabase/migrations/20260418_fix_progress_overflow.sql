-- ─────────────────────────────────────────────────────────────────────────────
-- 20260418_fix_progress_overflow.sql
--
-- 1. Removes duplicate lesson IDs from course_progress.completed_lessons arrays
--    (the primary cause of lessons_completed > total, leading to pct > 100%).
-- 2. Makes the mark_lesson_complete SQL helper idempotent via ON CONFLICT.
-- 3. Recalculates completed_at for rows that are genuinely 100% after dedup.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Deduplicate completed_lessons arrays ───────────────────────────────────
-- Any row where the array contains repeated IDs is corrected in place.

UPDATE course_progress
SET completed_lessons = ARRAY(
  SELECT DISTINCT elem
  FROM   unnest(completed_lessons) AS elem
  ORDER  BY elem
)
WHERE completed_lessons IS NOT NULL
  AND array_length(completed_lessons, 1) IS DISTINCT FROM (
    SELECT COUNT(DISTINCT elem)::int
    FROM   unnest(completed_lessons) AS elem
  );

-- ── 2. Idempotent lesson-completion helper ────────────────────────────────────
-- Replaces any existing mark_lesson_complete function so that inserting a
-- lesson the user already completed is a no-op (ON CONFLICT DO NOTHING).

CREATE OR REPLACE FUNCTION mark_lesson_complete(
  p_user_id   uuid,
  p_lesson_id text,
  p_course_id text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into user_lesson_progress (idempotent — unique constraint on user_id+lesson_id)
  INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, completed_at)
  VALUES (p_user_id, p_lesson_id::uuid, p_course_id::integer, true, now())
  ON CONFLICT (user_id, lesson_id) DO NOTHING;

  -- Update the completed_lessons array on course_progress, avoiding duplicates
  UPDATE course_progress
  SET completed_lessons = ARRAY(
        SELECT DISTINCT unnest(
          array_append(COALESCE(completed_lessons, ARRAY[]::text[]), p_lesson_id)
        )
      ),
      updated_at = now()
  WHERE user_id   = p_user_id
    AND course_id = p_course_id;

  -- Insert progress row if it didn't exist yet
  INSERT INTO course_progress (user_id, course_id, completed_lessons, updated_at)
  VALUES (p_user_id, p_course_id, ARRAY[p_lesson_id], now())
  ON CONFLICT (user_id, course_id) DO NOTHING;
END;
$$;

-- ── 3. Recalculate completed_at for rows that reached 100% ───────────────────
-- For each course_progress row, if the number of distinct completed lessons
-- equals or exceeds the total lessons in course_lessons, stamp completed_at.

UPDATE course_progress cp
SET    completed_at = COALESCE(cp.completed_at, now())
WHERE  cp.completed_at IS NULL
  AND  (
    SELECT COUNT(DISTINCT elem)::int
    FROM   unnest(cp.completed_lessons) AS elem
  ) >= (
    SELECT COUNT(*)::int
    FROM   course_lessons cl
    WHERE  cl.course_id::text = cp.course_id
      -- Exclude non-actionable lesson types if the column exists
      AND  COALESCE(cl.lesson_type, 'lesson') NOT IN ('draft', 'preview', 'header')
  );

-- ── 4. Ensure unique constraint exists on course_progress (user_id, course_id) ─

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE  conname = 'course_progress_user_id_course_id_key'
  ) THEN
    ALTER TABLE course_progress
      ADD CONSTRAINT course_progress_user_id_course_id_key
      UNIQUE (user_id, course_id);
  END IF;
END;
$$;
