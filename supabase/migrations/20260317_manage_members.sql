-- ─────────────────────────────────────────────────────────────────────────────
-- VIBE HYR — MANAGE MEMBERS
-- Creates organization_members table (if not exists), adds RLS policies for
-- org-admin member management, and adds audit helper columns.
-- Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE guards.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. ORGANIZATION MEMBERS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organization_members (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id      UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  role        TEXT        NOT NULL DEFAULT 'member'
                CHECK (role IN ('admin', 'member')),
  status      TEXT        NOT NULL DEFAULT 'invited'
                CHECK (status IN ('active', 'invited', 'inactive')),
  invited_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, email)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id  ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_status  ON organization_members(org_id, status);

-- Reuse the global update_updated_at() function from 001_initial_schema.sql
DROP TRIGGER IF EXISTS org_members_updated_at ON organization_members;
CREATE TRIGGER org_members_updated_at
  BEFORE UPDATE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Helper: returns the org_id of the caller's active admin membership (null if none)
-- Used inside policies to avoid correlated sub-selects repeating.
CREATE OR REPLACE FUNCTION auth_admin_org_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT org_id
  FROM   organization_members
  WHERE  user_id = auth.uid()
    AND  role    = 'admin'
    AND  status  = 'active'
  LIMIT 1;
$$;

-- Org admins can read every member in their org
DROP POLICY IF EXISTS "Org admins read their org members" ON organization_members;
CREATE POLICY "Org admins read their org members"
  ON organization_members FOR SELECT
  USING (org_id = auth_admin_org_id());

-- Any member can read their own row
DROP POLICY IF EXISTS "Members read own membership" ON organization_members;
CREATE POLICY "Members read own membership"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());

-- Org admins can invite new members (INSERT) into their org only
DROP POLICY IF EXISTS "Org admins insert members" ON organization_members;
CREATE POLICY "Org admins insert members"
  ON organization_members FOR INSERT
  WITH CHECK (org_id = auth_admin_org_id());

-- Org admins can update members in their org
DROP POLICY IF EXISTS "Org admins update their org members" ON organization_members;
CREATE POLICY "Org admins update their org members"
  ON organization_members FOR UPDATE
  USING  (org_id = auth_admin_org_id())
  WITH CHECK (org_id = auth_admin_org_id());

-- Org admins can remove members from their org
DROP POLICY IF EXISTS "Org admins delete their org members" ON organization_members;
CREATE POLICY "Org admins delete their org members"
  ON organization_members FOR DELETE
  USING (org_id = auth_admin_org_id());

-- ── 3. EXTEND PROFILES — add role column if missing ───────────────────────────
-- (Some code paths already set profiles.role; add it safely if absent.)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'member', 'super_admin'));

-- ── 4. ORGANIZATIONS — add seats_purchased alias if schema used that name ────
-- The institution_access migration used seat_limit; super admin code used
-- seats_purchased. This ensures both exist and stay in sync.
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS seats_purchased INTEGER;

-- Back-fill seats_purchased from seat_limit where null
UPDATE organizations
SET seats_purchased = seat_limit
WHERE seats_purchased IS NULL;

-- ── 5. MEMBER INVITE TOKENS (for resend invite flow) ─────────────────────────
CREATE TABLE IF NOT EXISTS member_invite_tokens (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id  UUID        NOT NULL REFERENCES organization_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  used_at    TIMESTAMPTZ
);

ALTER TABLE member_invite_tokens ENABLE ROW LEVEL SECURITY;
-- Only service-role client accesses this table; no user-facing policies needed.

-- ── 6. ADMIN AUDIT — extend action types ─────────────────────────────────────
-- admin_audit_log was created in 20260312_super_admin.sql; no schema change needed.
-- New action values used by manage-members: MEMBER_INVITED, MEMBER_UPDATED,
-- MEMBER_DELETED, MEMBER_INVITE_RESENT — these are free-text and need no DDL.

-- ── 7. MEMBER COUNT VIEW (dashboard widget) ───────────────────────────────────
CREATE OR REPLACE VIEW org_member_stats AS
SELECT
  o.id                                                          AS org_id,
  o.name                                                        AS org_name,
  o.type                                                        AS org_type,
  COUNT(*)                                                      AS total_members,
  COUNT(*) FILTER (WHERE om.status = 'active')                  AS active_members,
  COUNT(*) FILTER (WHERE om.status = 'invited')                 AS pending_invites,
  COUNT(*) FILTER (WHERE om.role = 'admin' AND om.status = 'active') AS admin_count
FROM organizations o
LEFT JOIN organization_members om ON om.org_id = o.id
GROUP BY o.id, o.name, o.type;
