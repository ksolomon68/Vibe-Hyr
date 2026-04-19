-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260418_certificates.sql
--
-- Builds the certificates system for all verticals.
-- • Renames education_certifications → certificates (if pre-existing)
-- • Extends with all required columns
-- • Adds UNIQUE (user_id, course_id)
-- • Installs generate_certificate_number() + issue_certificate() functions
-- • Creates platform_settings table
-- • Enables RLS with correct policies
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 0. Rename legacy table if it exists ──────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'education_certifications'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.education_certifications RENAME TO certificates;
  END IF;
END $$;

-- ── 1. Create certificates table (idempotent) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificates (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id          TEXT        NOT NULL,
  vertical           TEXT        NOT NULL,
  certificate_number TEXT        NOT NULL,
  member_name        TEXT        NOT NULL,
  course_title       TEXT        NOT NULL,
  issued_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  share_token        TEXT        UNIQUE DEFAULT encode(gen_random_bytes(24), 'base64'),
  is_valid           BOOLEAN     NOT NULL DEFAULT true
);

-- ── 2. Add missing columns (idempotent) ──────────────────────────────────────
DO $$
BEGIN
  -- vertical
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='vertical') THEN
    ALTER TABLE public.certificates ADD COLUMN vertical TEXT NOT NULL DEFAULT 'personal';
  END IF;
  -- certificate_number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='certificate_number') THEN
    ALTER TABLE public.certificates ADD COLUMN certificate_number TEXT NOT NULL DEFAULT '';
  END IF;
  -- member_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='member_name') THEN
    ALTER TABLE public.certificates ADD COLUMN member_name TEXT NOT NULL DEFAULT '';
  END IF;
  -- course_title
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='course_title') THEN
    ALTER TABLE public.certificates ADD COLUMN course_title TEXT NOT NULL DEFAULT '';
  END IF;
  -- share_token
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='share_token') THEN
    ALTER TABLE public.certificates ADD COLUMN share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(24), 'base64');
  END IF;
  -- is_valid
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='is_valid') THEN
    ALTER TABLE public.certificates ADD COLUMN is_valid BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- ── 3. Add CHECK constraint on vertical ──────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'certificates'
    AND constraint_name = 'certificates_vertical_check'
  ) THEN
    ALTER TABLE public.certificates
      ADD CONSTRAINT certificates_vertical_check
      CHECK (vertical IN ('personal','business','education','leadership'));
  END IF;
END $$;

-- ── 4. Add UNIQUE on certificate_number ──────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'certificates'
    AND constraint_name = 'certificates_certificate_number_key'
  ) THEN
    ALTER TABLE public.certificates
      ADD CONSTRAINT certificates_certificate_number_key UNIQUE (certificate_number);
  END IF;
END $$;

-- ── 5. Add UNIQUE (user_id, course_id) ───────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'certificates'
    AND constraint_name = 'certificates_user_course_unique'
  ) THEN
    ALTER TABLE public.certificates
      ADD CONSTRAINT certificates_user_course_unique UNIQUE (user_id, course_id);
  END IF;
END $$;

-- ── 6. Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_certificates_user_id    ON public.certificates (user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_share_token ON public.certificates (share_token);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_at  ON public.certificates (issued_at DESC);

-- ── 7. Enable RLS ─────────────────────────────────────────────────────────────
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ── 8. RLS Policies ───────────────────────────────────────────────────────────

-- Users read own certificates
DROP POLICY IF EXISTS "cert_user_read_own" ON public.certificates;
CREATE POLICY "cert_user_read_own"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Public read for valid share links (anyone can read if share_token matches and is_valid)
DROP POLICY IF EXISTS "cert_public_share_read" ON public.certificates;
CREATE POLICY "cert_public_share_read"
  ON public.certificates FOR SELECT
  USING (is_valid = true);

-- Super admin read all
DROP POLICY IF EXISTS "cert_super_admin_read" ON public.certificates;
CREATE POLICY "cert_super_admin_read"
  ON public.certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_super_admin = true
    )
  );

-- Super admin update (for revoke/reinstate)
DROP POLICY IF EXISTS "cert_super_admin_update" ON public.certificates;
CREATE POLICY "cert_super_admin_update"
  ON public.certificates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_super_admin = true
    )
  );

-- ── 9. generate_certificate_number() ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_certificate_number(p_course_id TEXT)
RETURNS TEXT AS $$
DECLARE
  course_num TEXT;
  random_part TEXT;
  candidate TEXT;
BEGIN
  course_num := CASE
    WHEN p_course_id LIKE '%_1' THEN '1'
    WHEN p_course_id LIKE '%_2' THEN '2'
    WHEN p_course_id LIKE '%_3' THEN '3'
    WHEN p_course_id LIKE '%_4' THEN '4'
    ELSE '0'
  END;

  LOOP
    random_part := upper(substring(encode(gen_random_bytes(6), 'hex') FOR 8));
    candidate := 'VH-C' || course_num || '-' || random_part;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.certificates WHERE certificate_number = candidate
    );
  END LOOP;

  RETURN candidate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 10. issue_certificate() ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.issue_certificate(
  p_user_id    UUID,
  p_course_id  TEXT,
  p_vertical   TEXT,
  p_course_title TEXT
)
RETURNS public.certificates AS $$
DECLARE
  v_member_name TEXT;
  v_cert_number TEXT;
  v_result      public.certificates;
BEGIN
  -- Get member name from profiles
  SELECT full_name INTO v_member_name
  FROM public.profiles WHERE id = p_user_id;

  IF v_member_name IS NULL OR v_member_name = '' THEN
    v_member_name := 'Vibe Hyr Member';
  END IF;

  -- Generate unique certificate number
  v_cert_number := public.generate_certificate_number(p_course_id);

  -- Insert, ignore if already exists (idempotent)
  INSERT INTO public.certificates (
    user_id, course_id, vertical, certificate_number,
    member_name, course_title
  )
  VALUES (
    p_user_id, p_course_id, p_vertical,
    v_cert_number, v_member_name, p_course_title
  )
  ON CONFLICT (user_id, course_id) DO NOTHING;

  -- Return the certificate (existing or newly created)
  SELECT * INTO v_result
  FROM public.certificates
  WHERE user_id = p_user_id AND course_id = p_course_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 11. platform_settings table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key        TEXT        PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Super admin read
DROP POLICY IF EXISTS "platform_settings_super_admin_read" ON public.platform_settings;
CREATE POLICY "platform_settings_super_admin_read"
  ON public.platform_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_super_admin = true
    )
  );

-- Super admin write
DROP POLICY IF EXISTS "platform_settings_super_admin_write" ON public.platform_settings;
CREATE POLICY "platform_settings_super_admin_write"
  ON public.platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_super_admin = true
    )
  );

-- Public read (for signature URL on certificate page)
DROP POLICY IF EXISTS "platform_settings_public_read" ON public.platform_settings;
CREATE POLICY "platform_settings_public_read"
  ON public.platform_settings FOR SELECT
  USING (true);

-- Default: seed the signature key if not present
INSERT INTO public.platform_settings (key, value)
VALUES ('founder_signature_url', null)
ON CONFLICT (key) DO NOTHING;
