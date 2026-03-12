// hooks/useCourseAccess.ts
// Use this in your lesson player to gate content.
// Returns whether the current user has access to a given course.

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AccessState {
  hasAccess: boolean
  loading: boolean
  tier: string | null
  orgName: string | null
  orgStatus: string | null
}

export function useCourseAccess(courseSlug: string, userId: string | null): AccessState {
  const [state, setState] = useState<AccessState>({
    hasAccess: false,
    loading: true,
    tier: null,
    orgName: null,
    orgStatus: null,
  })

  useEffect(() => {
    if (!userId || !courseSlug) {
      setState(s => ({ ...s, loading: false }))
      return
    }

    async function checkAccess() {
      // Check course_access table (enforced by RLS — user can only see their own)
      const { data: access } = await supabase
        .from('course_access')
        .select('id, org_id')
        .eq('user_id', userId)
        .eq('course_slug', courseSlug)
        .single()

      if (!access) {
        setState({ hasAccess: false, loading: false, tier: null, orgName: null, orgStatus: null })
        return
      }

      // If org-based, also verify the org is still active
      if (access.org_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('name, tier, status')
          .eq('id', access.org_id)
          .single()

        const orgActive = org?.status === 'active'
        setState({
          hasAccess: orgActive,
          loading: false,
          tier: org?.tier ?? null,
          orgName: org?.name ?? null,
          orgStatus: org?.status ?? null,
        })
      } else {
        // Individual access (future use)
        setState({ hasAccess: true, loading: false, tier: null, orgName: null, orgStatus: 'active' })
      }
    }

    checkAccess()
  }, [userId, courseSlug])

  return state
}
