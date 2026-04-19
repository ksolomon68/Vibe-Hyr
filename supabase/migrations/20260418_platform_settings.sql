-- supabase/migrations/20260418_platform_settings.sql
-- Creates platform_settings KV table for super-admin–controlled configuration.
-- Key: founder_signature_url — stores the public URL of the uploaded signature.

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key        TEXT        PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ── Policies ──────────────────────────────────────────────────────────────────

-- Super admin read
DROP POLICY IF EXISTS "platform_settings_super_admin_read" ON public.platform_settings;
CREATE POLICY "platform_settings_super_admin_read"
  ON public.platform_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Super admin write (INSERT / UPDATE / DELETE)
DROP POLICY IF EXISTS "platform_settings_super_admin_write" ON public.platform_settings;
CREATE POLICY "platform_settings_super_admin_write"
  ON public.platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Public read — allows the public certificate page to fetch signatureUrl
-- without auth. Only non-sensitive values should be stored here.
DROP POLICY IF EXISTS "platform_settings_public_read" ON public.platform_settings;
CREATE POLICY "platform_settings_public_read"
  ON public.platform_settings FOR SELECT
  USING (true);

-- Seed the signature key with null if not already present
INSERT INTO public.platform_settings (key, value)
VALUES ('founder_signature_url', null)
ON CONFLICT (key) DO NOTHING;
