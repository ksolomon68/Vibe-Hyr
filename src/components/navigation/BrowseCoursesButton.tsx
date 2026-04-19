'use client'

import { useRouter } from 'next/navigation'
import { getCourseRoute } from '@/lib/constants/verticalRoutes'

interface BrowseCoursesButtonProps {
  membershipType: string | null
  role: string | null
  label?: string
  className?: string
  variant?: 'button' | 'link'
}

export function BrowseCoursesButton({
  membershipType,
  role,
  label = 'Browse Courses',
  className,
  variant = 'button',
}: BrowseCoursesButtonProps) {
  const router = useRouter()
  const route = getCourseRoute(membershipType, role)

  if (variant === 'link') {
    return (
      <a
        href={route}
        className={className}
      >
        {label}
      </a>
    )
  }

  return (
    <button
      onClick={() => router.push(route)}
      className={className}
    >
      {label}
    </button>
  )
}
