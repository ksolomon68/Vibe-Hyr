-- ─────────────────────────────────────────────────────────────────────────────
-- 20260330_seed_course_lessons.sql
--
-- Seeds the course_lessons table with all 38 lessons from the static
-- TypeScript lesson data.  Safe to run multiple times — skips rows where
-- (course_id, sort_order) already exists.
--
-- course_id mapping:  c01→1  c02→2  c03→3  c04→4
-- type mapping:  has youtube_url → 'video',  no url → 'text'
-- youtube_url: stored as full watch URL (app converts to embed at read time)
-- ─────────────────────────────────────────────────────────────────────────────

-- Add unique constraint so we can upsert safely
ALTER TABLE course_lessons
  ADD CONSTRAINT IF NOT EXISTS course_lessons_course_sort_uniq
  UNIQUE (course_id, sort_order);

INSERT INTO course_lessons
  (course_id, title, type, youtube_url, sort_order, is_published, is_preview)
VALUES

-- ── COURSE 1 — Programming the Gatekeeper ────────────────────────────────────
(1, 'The 11 Million Bit Problem',
  'video', 'https://www.youtube.com/watch?v=mTjDPbUC44U', 1, true, true),

(1, 'The Car Model Phenomenon',
  'video', 'https://www.youtube.com/watch?v=7zzyEcLtreA', 2, true, true),

(1, 'Beta, Alpha, Theta — Your Three Operating Modes',
  'video', 'https://www.youtube.com/watch?v=3oASflIFWHs', 3, true, false),

(1, 'Installing New Filtering Instructions',
  'video', 'https://www.youtube.com/watch?v=UvDAAwlFQBY', 4, true, false),

(1, 'Module Quiz & Your RAS Assignment',
  'text',  NULL, 5, true, false),

-- ── COURSE 2 — Mastery of the Law of Assumption ──────────────────────────────
(2, 'The Law vs. The Law of Attraction',
  'text', NULL, 1, true, false),

(2, 'Thinking Of vs. Thinking From',
  'text', NULL, 2, true, false),

(2, 'Living in the End',
  'text', NULL, 3, true, false),

(2, 'The Bridge of Incidents',
  'text', NULL, 4, true, false),

(2, 'The Feeling Is the Secret',
  'text', NULL, 5, true, false),

(2, 'The Echo Theory — Understanding the Delay',
  'text', NULL, 6, true, false),

(2, 'Course 2 Knowledge Check',
  'text', NULL, 7, true, false),

-- ── COURSE 3 — SATS Reprogramming ────────────────────────────────────────────
(3, 'What Is SATS — and Why It Works',
  'text', NULL, 1, true, false),

(3, 'Constructing Your SATS Scene',
  'text', NULL, 2, true, false),

(3, 'The 7-Night Integration Ritual',
  'text', NULL, 3, true, false),

(3, 'Myelination — The 21-Day Science',
  'text', NULL, 4, true, false),

(3, 'Common SATS Mistakes & How to Fix Them',
  'text', NULL, 5, true, false),

(3, 'SATS for Specific Desires',
  'text', NULL, 6, true, false),

(3, 'The Chemical Cement — Dopamine, Serotonin & the Impression Process',
  'text', NULL, 7, true, false),

(3, 'SATS Mastery Diagnostic',
  'text', NULL, 8, true, false),

-- ── COURSE 4 — Navigating the Echo Theory Delay ──────────────────────────────
(4, 'The Mental Diet — What It Actually Means',
  'text', NULL, 1, true, false),

(4, 'The Decision Matrix',
  'text', NULL, 2, true, false),

(4, 'Staying Faithful When 3D Contradicts',
  'text', NULL, 3, true, false),

(4, 'Advanced Revision — Rewriting the Timeline',
  'text', NULL, 4, true, false),

(4, 'Monitoring Your Inner Speech',
  'text', NULL, 5, true, false),

(4, 'The Persistence Principle',
  'text', NULL, 6, true, false),

(4, 'Integrated Practice — All Four Systems Working Together',
  'text', NULL, 7, true, false),

(4, 'The Life Mastery Score — Monthly Assessment Protocol',
  'text', NULL, 8, true, false),

(4, 'Course Completion — Your Reality Architecture',
  'text', NULL, 9, true, false)

ON CONFLICT (course_id, sort_order) DO NOTHING;
