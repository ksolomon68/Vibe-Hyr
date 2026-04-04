-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 20260403_course_lessons_expand.sql
-- Expands course_lessons to support all 16 courses (1-4 personal, 5-8 business,
-- 9-12 education, 13-16 leadership). Removes the 1-4 check constraint and
-- updates the RLS read policy to include leadership courses.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Drop the old 1–4 check constraint ─────────────────────────────────────
ALTER TABLE course_lessons
  DROP CONSTRAINT IF EXISTS course_lessons_course_id_check;

-- ── 2. Add updated constraint covering all 16 courses ────────────────────────
ALTER TABLE course_lessons
  ADD CONSTRAINT course_lessons_course_id_check
  CHECK (course_id BETWEEN 1 AND 16);

-- ── 3. Replace the authenticated read policy ─────────────────────────────────
DROP POLICY IF EXISTS "cms_auth_read" ON course_lessons;

CREATE POLICY "cms_auth_read" ON course_lessons
  FOR SELECT
  USING (
    is_published = true
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND (
          -- Super admin sees everything
          p.is_super_admin = true
          OR
          -- Preview lessons visible to all authenticated users
          course_lessons.is_preview = true
          OR
          -- Free / Seeker tier: course 1 only (personal + leadership course 1)
          (p.membership_tier = 'free' AND course_lessons.course_id IN (1, 13))
          OR
          -- Architect: personal 1–3, business 1–3, education 1–3, leadership 1–3
          (p.membership_tier = 'architect' AND course_lessons.course_id IN (1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15))
          OR
          -- Elite / Reality Master: all courses
          (p.membership_tier = 'elite')
          OR
          -- Education institutions: personal 1–2, personal 4, education 1–4
          (p.institution_type = 'education' AND course_lessons.course_id IN (1, 2, 4, 9, 10, 11, 12))
          OR
          -- Business institutions: personal + business courses
          (p.institution_type = 'business' AND course_lessons.course_id IN (1, 2, 3, 4, 5, 6, 7, 8))
          OR
          -- Leadership institutions: leadership courses
          (p.institution_type = 'leadership' AND course_lessons.course_id IN (13, 14, 15, 16))
        )
    )
  );
