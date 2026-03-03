import Link from 'next/link'
import { Lock, Play, CheckCircle, Clock, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Course, MembershipTier } from '@/types'

interface CourseCardProps {
  course: Course
  userTier?: MembershipTier
  progress?: number
  isLarge?: boolean
}

const TIER_BADGE: Record<string, string> = {
  free:     'badge-free',
  architect:'badge-architect',
  elite:    'badge-elite',
}
const TIER_LABEL: Record<string, string> = {
  free:     'Free',
  architect:'Pro',
  elite:    'Elite',
}
const COURSE_THEMES = ['01', '02', '03', '04']

export function CourseCard({ course, userTier = 'free', progress, isLarge }: CourseCardProps) {
  const tierRank = { free: 0, architect: 1, elite: 2 }
  const hasAccess = tierRank[userTier] >= tierRank[course.tier]
  const num = COURSE_THEMES[course.order_index - 1] ?? '0'

  return (
    <div
      className={cn(
        'relative bg-black-2 border border-white/8 overflow-hidden group transition-all duration-200',
        'hover:border-orange-DEFAULT/30 hover:bg-black-3',
        isLarge && 'col-span-2'
      )}
    >
      {/* Big background number */}
      <div className="absolute top-3 right-4 font-display text-[4rem] md:text-[7rem] leading-none text-orange-DEFAULT/6 pointer-events-none select-none overflow-hidden">
        {num}
      </div>

      <div className="p-8 relative z-10">
        {/* Badges row */}
        <div className="flex items-center justify-between mb-5">
          <span className={TIER_BADGE[course.tier]}>
            {TIER_LABEL[course.tier]}
          </span>
          {!hasAccess && (
            <Lock size={14} className="text-grey-dark" />
          )}
          {hasAccess && progress === 100 && (
            <CheckCircle size={16} className="text-green-400" />
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-2xl tracking-[0.03em] text-white mb-2 leading-tight">
          {course.title}
        </h3>
        <p className="font-body text-sm italic text-grey-DEFAULT mb-4 leading-relaxed">
          {course.subtitle}
        </p>
        <p className="font-body text-sm text-grey-DEFAULT/70 mb-6 leading-relaxed line-clamp-3">
          {course.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-5 mb-6 pb-5 border-b border-white/8">
          <div className="flex items-center gap-1.5">
            <BookOpen size={12} className="text-orange-DEFAULT" />
            <span className="font-mono text-[0.6rem] tracking-widest text-grey-DEFAULT">
              {course.total_lessons} lessons
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-orange-DEFAULT" />
            <span className="font-mono text-[0.6rem] tracking-widest text-grey-DEFAULT">
              {course.estimated_hours}h
            </span>
          </div>
        </div>

        {/* Progress bar (if enrolled) */}
        {progress !== undefined && (
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="font-mono text-[0.55rem] tracking-widest text-grey-DEFAULT uppercase">Progress</span>
              <span className="font-mono text-[0.55rem] tracking-widest text-orange-DEFAULT">{progress}%</span>
            </div>
            <div className="h-0.5 bg-black-4 rounded-full">
              <div
                className="h-0.5 bg-orange-DEFAULT transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        {hasAccess ? (
          <Link
            href={`/courses/${course.slug}`}
            className="btn-orange w-full text-center flex items-center justify-center gap-2 text-[0.62rem]"
          >
            <Play size={12} />
            {progress ? 'Continue' : 'Start Course'}
          </Link>
        ) : (
          <Link
            href="/#pricing"
            className="btn-outline-orange w-full text-center flex items-center justify-center gap-2 text-[0.62rem]"
          >
            <Lock size={12} />
            Upgrade to Unlock
          </Link>
        )}
      </div>

      {/* Bottom orange bar on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-DEFAULT scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  )
}
