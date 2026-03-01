import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { PricingSection } from '@/components/home/PricingSection'
import { AssumptionLab } from '@/components/quiz/AssumptionLab'
import { CourseCard } from '@/components/courses/CourseCard'
import { COURSES } from '@/lib/data/courses'
import { ArrowRight, Brain, BookOpen, Users, Target } from 'lucide-react'
import Link from 'next/link'

const PILLARS = [
  { icon: Brain,    title: 'Structured Curriculum',  desc: '4 progressive courses moving from RAS programming to full Echo Theory mastery. Quiz-gated modules ensure real implementation.' },
  { icon: BookOpen, title: 'Daily Revision Journal',  desc: 'Nightly guided journaling with Neville\'s revision protocol, emotion tagging, streaks, and a personal reality timeline.' },
  { icon: Target,   title: 'Quizzes & Diagnostics',  desc: 'Identity Audit, SATS Mastery Diagnostic, the Assumption Lab, and Life Mastery Score — with personalized roadmaps.' },
  { icon: Users,    title: 'Community Forum',         desc: 'Module-specific channels, Bridge of Incidents sharing, accountability partners, and weekly host Q&As.' },
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <HeroSection />

        {/* Four Pillars */}
        <section className="py-24 px-6 md:px-14">
          <div className="max-w-7xl mx-auto">
            <div className="label mb-4">What We're Building</div>
            <h2 className="font-display text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-[0.02em] mb-4">
              FOUR PILLARS OF<br />
              <span className="text-orange-DEFAULT">THE PLATFORM</span>
            </h2>
            <p className="font-body italic text-grey-DEFAULT max-w-xl mb-12">
              Every feature serves one goal: moving subscribers from passive learners to active reality architects.
            </p>

            <div className="orange-rule">♛</div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT"
            >
              {PILLARS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="bg-black-2 p-9 hover:bg-black-3 transition-colors relative overflow-hidden group">
                  <div className="absolute top-3 right-4 font-display text-[5.5rem] leading-none text-orange-DEFAULT/6 select-none pointer-events-none">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <Icon size={28} className="text-orange-DEFAULT mb-5" />
                  <h3 className="font-display text-xl tracking-[0.04em] text-orange-light mb-3">{title}</h3>
                  <p className="font-body text-sm text-grey-DEFAULT leading-relaxed">{desc}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-DEFAULT scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Preview */}
        <section className="py-24 px-6 md:px-14 bg-black-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="label mb-4">Core Curriculum</div>
                <h2 className="font-display text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-[0.02em]">
                  THE ARCHITECTURE<br />
                  <span className="text-orange-DEFAULT">OF REALITY</span>
                </h2>
              </div>
              <Link href="/courses" className="btn-outline-orange hidden md:flex items-center gap-2 self-end">
                All Courses <ArrowRight size={14} />
              </Link>
            </div>
            <p className="font-body italic text-grey-DEFAULT max-w-xl mb-12">
              Four courses. Progressive. Each building the next layer of your internal operating system.
            </p>

            <div className="orange-rule">♛</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT">
              {COURSES.map((course) => (
                <CourseCard key={course.id} course={course} userTier="free" />
              ))}
            </div>

            <Link href="/courses" className="btn-outline-orange flex items-center gap-2 justify-center mt-6 md:hidden">
              All Courses <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* Assumption Lab Preview */}
        <section className="py-24 px-6 md:px-14">
          <div className="max-w-5xl mx-auto">
            <div className="label mb-4">Interactive Preview</div>
            <h2 className="font-display text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-[0.02em] mb-4">
              TRY THE<br />
              <span className="text-orange-DEFAULT">ASSUMPTION LAB</span>
            </h2>
            <p className="font-body italic text-grey-DEFAULT max-w-xl mb-12">
              Scenario-based training that rewires your subconscious response to neutral events — live, right now.
            </p>
            <AssumptionLab />
          </div>
        </section>

        {/* Pricing */}
        <PricingSection />

        {/* Final CTA */}
        <section className="py-24 px-6 md:px-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-orange-DEFAULT/4 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="font-display text-[6rem] text-orange-DEFAULT/15 leading-none mb-0 -mb-4">✦</div>
            <h2 className="font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.92] tracking-[0.02em] mb-6">
              YOUR REALITY<br />
              <span className="text-orange-DEFAULT">STARTS NOW</span>
            </h2>
            <p className="font-body text-lg italic text-grey-DEFAULT mb-10 leading-relaxed">
              "Assume the feeling of your wish fulfilled and continue feeling that it is fulfilled until that which you feel objectifies itself." — Neville Goddard
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth/signup" className="btn-orange text-base px-12">
                Begin Free Today
              </Link>
              <Link href="/courses" className="btn-outline text-base px-12">
                Browse Courses
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
