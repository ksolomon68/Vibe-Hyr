'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageLoader } from '@/components/shared/PageLoader'

function EnrollRedirect() {
  const searchParams = useSearchParams()
  const link = searchParams.get('link')

  useEffect(() => {
    if (link) {
      // Redirect to the actual Supabase verification link
      window.location.replace(link)
    } else {
      // Fallback
      window.location.replace('/auth/login')
    }
  }, [link])

  return <PageLoader text="VERIFYING YOUR ACCOUNT..." />
}

export default function EnrollPage() {
  return (
    <Suspense fallback={<PageLoader text="INITIALIZING..." />}>
      <EnrollRedirect />
    </Suspense>
  )
}
