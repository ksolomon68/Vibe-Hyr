-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260420_refactor_cert_number.sql
--
-- Refactors the generate_certificate_number function to support 
-- standardized sequence-based IDs across all verticals.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_certificate_number(p_course_id TEXT)
RETURNS TEXT AS $$
DECLARE
  course_num TEXT;
  random_part TEXT;
  candidate TEXT;
BEGIN
  -- Extract sequence number (1-4) from standardized IDs (b01, ed02, etc.)
  -- or legacy string IDs (personal_course_1) or raw numeric IDs (5, 9)
  course_num := CASE
    WHEN p_course_id ~ '01$' OR p_course_id LIKE '%_1' OR p_course_id IN ('5', '9') THEN '1'
    WHEN p_course_id ~ '02$' OR p_course_id LIKE '%_2' OR p_course_id IN ('6', '10') THEN '2'
    WHEN p_course_id ~ '03$' OR p_course_id LIKE '%_3' OR p_course_id IN ('7', '11') THEN '3'
    WHEN p_course_id ~ '04$' OR p_course_id LIKE '%_4' OR p_course_id IN ('8', '12') THEN '4'
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
