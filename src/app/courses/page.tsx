import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/courses/CourseCard'
import { COURSES } from '@/lib/data/courses'
import { createClient } from '@/lib/supabase/server'
import type { MembershipTier } from '@/types'

export const metadata = { title: 'Courses — The Architecture of Reality' }

export default async function CoursesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userTier: MembershipTier = 'free'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_tier')
      .eq('id', user.id)
      .single()
    userTier = profile?.membership_tier ?? 'free'
  }

  return (
    <>
      <Navbar />
      <main className="pt-[68px]">
        {/* Page header */}
        <section className="py-20 px-6 md:px-14 border-b-2 border-orange-DEFAULT/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-7xl mx-auto">
            <div className="label mb-4">Curriculum</div>
            <h1 className="font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.92] tracking-[0.02em] mb-4">
              THE ARCHITECTURE<br />
              <span className="text-orange-DEFAULT">OF REALITY</span>
            </h1>
            <p className="font-body italic text-grey-DEFAULT max-w-2xl text-lg leading-relaxed">
              Four courses. Each one builds on the last. Complete Course 1 free — then decide how deep you want to go.
            </p>
          </div>
        </section>

        {/* Tier key */}
        <section className="py-8 px-6 md:px-14 bg-black-2 border-b border-white/8">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-6 items-center">
            <span className="font-mono text-[0.58rem] tracking-[0.25em] uppercase text-grey-dark">Access Key:</span>
            <div className="flex flex-wrap gap-4">
              <span className="badge-free">Free — Seeker</span>
              <span className="badge-architect">Pro — Architect ($27/mo)</span>
              <span className="badge-elite">Elite — Reality Master ($67/mo)</span>
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="py-16 px-6 md:px-14">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT">
              {COURSES.map((course) => (
                <CourseCard key={course.id} course={course} userTier={userTier} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
