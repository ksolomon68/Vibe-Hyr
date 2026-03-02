import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BLOG_POSTS, getBlogPost } from '@/lib/data/blog'
import { ArrowLeft, ArrowRight, Clock, Crown } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  const postIndex  = BLOG_POSTS.findIndex(p => p.slug === post.slug)
  const prevPost   = postIndex > 0 ? BLOG_POSTS[postIndex - 1] : null
  const nextPost   = postIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[postIndex + 1] : null

  // Convert markdown-style headings and paragraphs to HTML sections
  const sections = post.content.split('\n\n').map((block, i) => {
    if (block.startsWith('## ')) {
      return <h2 key={i} className="font-display text-2xl md:text-3xl tracking-[0.03em] text-white mt-12 mb-4">{block.replace('## ', '')}</h2>
    }
    if (block.startsWith('**') && block.endsWith('**')) {
      return <p key={i} className="font-body font-bold text-white mb-3">{block.replace(/\*\*/g, '')}</p>
    }
    if (block.startsWith('> ')) {
      return (
        <blockquote key={i} className="border-l-2 border-orange-DEFAULT pl-6 my-8 font-body italic text-grey-DEFAULT text-lg leading-relaxed">
          {block.replace('> ', '')}
        </blockquote>
      )
    }
    if (block.startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter(l => l.startsWith('- '))
      return (
        <ul key={i} className="flex flex-col gap-3 my-6">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 font-body text-grey-DEFAULT">
              <span className="text-orange-DEFAULT mt-1 flex-shrink-0">✦</span>
              <span>{item.replace('- ', '')}</span>
            </li>
          ))}
        </ul>
      )
    }
    if (/^\d+\./.test(block) || block.includes('\n1.') || block.includes('\n2.')) {
      const lines = block.split('\n').filter(l => /^\d+\./.test(l))
      if (lines.length > 0) {
        return (
          <ol key={i} className="flex flex-col gap-3 my-6">
            {lines.map((item, j) => (
              <li key={j} className="flex items-start gap-3 font-body text-grey-DEFAULT">
                <span className="font-mono text-orange-DEFAULT text-sm flex-shrink-0 mt-0.5">{String(j + 1).padStart(2, '0')}.</span>
                <span>{item.replace(/^\d+\.\s*/, '')}</span>
              </li>
            ))}
          </ol>
        )
      }
    }
    if (block.trim()) {
      // Handle inline bold
      const parts = block.split(/(\*\*[^*]+\*\*)/)
      return (
        <p key={i} className="font-body text-grey-DEFAULT leading-relaxed mb-5 text-[1.05rem]">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="text-white font-semibold">{part.replace(/\*\*/g, '')}</strong>
              : part
          )}
        </p>
      )
    }
    return null
  })

  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen">

        {/* Header */}
        <section className="py-14 px-6 md:px-14 border-b border-white/8 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-3xl mx-auto pl-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors mb-8"
            >
              <ArrowLeft size={12} /> Back to Blog
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-orange-DEFAULT">
                {post.category}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[0.55rem] tracking-[0.1em] text-grey-dark">
                <Clock size={10} /> {post.readTime} min read
              </span>
            </div>
            <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-[0.95] tracking-[0.02em] text-white mb-5">
              {post.title}
            </h1>
            <p className="font-body italic text-grey-DEFAULT text-lg leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        </section>

        {/* Article body */}
        <article className="py-14 px-6 md:px-14">
          <div className="max-w-3xl mx-auto">
            {sections}
          </div>
        </article>

        {/* CTA */}
        <section className="px-6 md:px-14 pb-14">
          <div className="max-w-3xl mx-auto">
            <div className="bg-black-2 border-2 border-orange-DEFAULT p-8 md:p-12 text-center">
              <Crown size={20} className="text-orange-DEFAULT mx-auto mb-4" />
              <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-orange-DEFAULT mb-3">
                Ready to Apply This?
              </p>
              <h3 className="font-display text-3xl md:text-4xl text-white mb-4 tracking-widest">
                START BUILDING YOUR REALITY
              </h3>
              <p className="font-body italic text-grey-DEFAULT mb-8 max-w-md mx-auto leading-relaxed">
                Join Vibe Hyr free and access Course 01, the nightly Revision Journal, and the Assumption Lab.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup" className="btn-orange">
                  Join Free
                </Link>
                <Link href="/courses" className="btn-outline">
                  Explore Courses
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Post navigation */}
        {(prevPost || nextPost) && (
          <div className="px-6 md:px-14 pb-16">
            <div className="max-w-3xl mx-auto border-t border-white/8 pt-10 flex justify-between gap-6">
              {prevPost ? (
                <Link href={`/blog/${prevPost.slug}`} className="group flex-1">
                  <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-grey-dark flex items-center gap-1 mb-2">
                    <ArrowLeft size={10} /> Previous
                  </span>
                  <span className="font-display text-lg text-white group-hover:text-orange-DEFAULT transition-colors line-clamp-2">
                    {prevPost.title}
                  </span>
                </Link>
              ) : <div />}
              {nextPost && (
                <Link href={`/blog/${nextPost.slug}`} className="group flex-1 text-right">
                  <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-grey-dark flex items-center gap-1 mb-2 justify-end">
                    Next <ArrowRight size={10} />
                  </span>
                  <span className="font-display text-lg text-white group-hover:text-orange-DEFAULT transition-colors line-clamp-2">
                    {nextPost.title}
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  )
}
