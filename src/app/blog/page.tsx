import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/lib/data/blog'
import { ArrowRight, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights on the Law of Assumption, SATS, Neville Goddard, neuroscience, and the architecture of reality.',
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS

  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen">

        {/* Header */}
        <section className="py-16 px-6 md:px-14 border-b-2 border-orange-DEFAULT/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-7xl mx-auto">
            <div className="label mb-3">The Vibe Hyr Blog</div>
            <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[0.02em]">
              THE ARCHITECTURE<br />
              <span className="text-orange-DEFAULT">OF REALITY</span>
            </h1>
            <p className="font-body italic text-grey-DEFAULT mt-4 max-w-xl text-lg leading-relaxed">
              Neuroscience meets Neville. Practical guides on SATS, the Law of Assumption, and the mental tools that actually change your external world.
            </p>
          </div>
        </section>

        <div className="py-14 px-6 md:px-14">
          <div className="max-w-7xl mx-auto">

            {/* Featured post */}
            <Link
              href={`/blog/${featured.slug}`}
              className="group block mb-14 p-8 md:p-12 bg-black-2 border-2 border-orange-DEFAULT/30 hover:border-orange-DEFAULT transition-colors relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-DEFAULT" />
              <div className="pl-6 md:pl-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-orange-DEFAULT bg-orange-DEFAULT/10 px-3 py-1">
                    Featured
                  </span>
                  <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-dark">
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[0.55rem] tracking-[0.1em] text-grey-dark">
                    <Clock size={10} /> {featured.readTime} min read
                  </span>
                </div>
                <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] leading-[0.98] tracking-[0.02em] text-white mb-4 group-hover:text-orange-DEFAULT transition-colors">
                  {featured.title}
                </h2>
                <p className="font-body text-grey-DEFAULT italic leading-relaxed max-w-2xl mb-6">
                  {featured.excerpt}
                </p>
                <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-orange-DEFAULT flex items-center gap-2">
                  Read Article <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-dark px-4 py-1.5 border border-white/8">
                All Posts
              </span>
              {BLOG_CATEGORIES.map(cat => (
                <span
                  key={cat}
                  className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-dark px-4 py-1.5 border border-white/8 hover:border-orange-DEFAULT/40 hover:text-orange-DEFAULT transition-colors cursor-pointer"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Post grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-black-2 border border-white/8 hover:border-orange-DEFAULT/40 transition-colors p-7"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-[0.5rem] tracking-[0.25em] uppercase text-orange-DEFAULT">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[0.5rem] tracking-[0.1em] text-grey-dark ml-auto">
                      <Clock size={9} /> {post.readTime} min
                    </span>
                  </div>
                  <h3 className="font-display text-xl leading-tight tracking-[0.02em] text-white mb-3 group-hover:text-orange-DEFAULT transition-colors flex-1">
                    {post.title}
                  </h3>
                  <p className="font-body text-sm italic text-grey-dark leading-relaxed mb-5 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT flex items-center gap-1.5 mt-auto">
                    Read <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
