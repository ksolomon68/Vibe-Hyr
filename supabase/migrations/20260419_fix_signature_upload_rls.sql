-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: 20260419_fix_signature_upload_rls.sql
--
-- Fixes "new row violates row-level security policy" when super admin
-- uploads a signature PNG for certificates.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. Create the bucket if it doesn't exist ─────────────────────────────────
-- Note: 'public' is true so signature URLs can be read by anyone on cert pages.
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificate-assets', 'certificate-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Storage Policies ───────────────────────────────────────────────────────
-- Supabase Storage uses the storage.objects table for RLS.

-- A. Public Read Access
DROP POLICY IF EXISTS "Public read for certificate assets" ON storage.objects;
CREATE POLICY "Public read for certificate assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'certificate-assets');

-- B. Super Admin Upload (INSERT)
DROP POLICY IF EXISTS "Super admins can upload certificate assets" ON storage.objects;
CREATE POLICY "Super admins can upload certificate assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'certificate-assets' AND
    (EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = true
    ))
  );

-- C. Super Admin Update (Needed for upsert: true)
DROP POLICY IF EXISTS "Super admins can update certificate assets" ON storage.objects;
CREATE POLICY "Super admins can update certificate assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'certificate-assets' AND
    (EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = true
    ))
  );

-- D. Super Admin Delete
DROP POLICY IF EXISTS "Super admins can delete certificate assets" ON storage.objects;
CREATE POLICY "Super admins can delete certificate assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'certificate-assets' AND
    (EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = true
    ))
  );

-- ── 3. Platform Settings (Robustness Update) ──────────────────────────────────
-- Ensure that upsert (INSERT) works correctly by adding WITH CHECK.
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_settings_super_admin_write" ON public.platform_settings;
CREATE POLICY "platform_settings_super_admin_write"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );
