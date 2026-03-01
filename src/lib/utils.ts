import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MembershipTier, CourseAccessTier } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tier hierarchy: free < architect < elite
const TIER_RANK: Record<MembershipTier, number> = {
  free: 0,
  architect: 1,
  elite: 2,
}

export function hasAccess(userTier: MembershipTier, required: CourseAccessTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[required]
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const hrs  = Math.floor(mins / 60)
  const rem  = mins % 60
  return hrs > 0 ? `${hrs}h ${rem}m` : `${mins}m`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your streak tonight'
  if (streak < 3)   return `${streak} day streak — keep going!`
  if (streak < 7)   return `🔥 ${streak} days strong`
  if (streak < 14)  return `🔥 ${streak} days — unstoppable`
  if (streak < 30)  return `🔥 ${streak} days — you're rewriting reality`
  return `🔥 ${streak} days — legendary`
}

export function getTierLabel(tier: MembershipTier): string {
  return { free: 'Seeker', architect: 'Architect', elite: 'Reality Master' }[tier]
}

export function getTierColor(tier: MembershipTier): string {
  return {
    free:      'text-green-400 border-green-400',
    architect: 'text-orange-DEFAULT border-orange-DEFAULT',
    elite:     'text-white border-white',
  }[tier]
}

export const EMOTION_LABELS: Record<string, string> = {
  peaceful:   '😌 Peaceful',
  grateful:   '🙏 Grateful',
  confident:  '💪 Confident',
  joyful:     '✨ Joyful',
  anxious:    '😰 Anxious',
  frustrated: '😤 Frustrated',
  neutral:    '😐 Neutral',
  powerful:   '⚡ Powerful',
  loving:     '💛 Loving',
  abundant:   '🌟 Abundant',
}
