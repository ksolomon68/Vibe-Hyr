'use client'

import { useState, useEffect } from 'react'
import { CourseCard } from '@/components/personal/CourseCard'
import { COURSES } from '@/lib/data/courses'
import { createClient } from '@/lib/supabase/client'
import { useCheckout } from '@/hooks/useCheckout'
import { Loader2 } from 'lucide-react'
import type { Tier } from '@/components/pricing/CartPanel'

export function CoursePreviewGrid() {
  const [userId, setUserId] = useState<string | null>(null)
  const { startCheckout, loading } = useCheckout()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
    })
  }, [])

  const handleDirectCheckout = async (tier: Tier) => {
    if (!userId) {
      // Redirect to signup with a redirect back here
      window.location.href = `/auth/signup?redirect=/personal`
      return
    }

    await startCheckout({
      tier,
      billingCycle: 'monthly',
      userId,
    })
  }

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-black-2 p-8 rounded-sm border border-orange-DEFAULT/20 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-orange-DEFAULT animate-spin" />
            <p className="font-mono text-[0.6rem] tracking-[0.2em] text-orange-DEFAULT uppercase">Preparing Checkout...</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT">
        {COURSES.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            userTier="free" 
            onUpgrade={handleDirectCheckout}
          />
        ))}
      </div>
    </div>
  )
}
