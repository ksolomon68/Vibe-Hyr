import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  BLOG_POSTS,
  getBlogPost,
  getRelatedBlogPosts,
  type BlogVertical,
} from '@/lib/data/blog'
import { ArrowLeft, ArrowRight, Clock, Crown, CheckSquare, HelpCircle, BookOpen } from 'lucide-react'

interface Props {
  params: { slug: string }
}

const VERTICAL_LABELS: Record<BlogVertical, string> = {
  personal:   'Personal Mastery',
  business:   'Business & Workplace',
  educators:  'Educators',
  leadership: 'Leadership',
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
  return parts.map((part, j) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={j} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={j} className="text-white/90 italic">
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug)
  if (!post) return { title: 'Article Not Found' }

  const seoTitle = post.seoTitle ?? post.title
  const metaDescription = post.metaDescription ?? post.excerpt
  const canonicalUrl = `https://vibehyr.com/blog/${post.slug}`

  return {
    title: seoTitle,
    description: metaDescription,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'Vibe Hyr',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category,
      tags: post.keywords,
      images: [
        {
          url: 'https://vibehyr.com/images/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: metaDescription,
      images: ['https://vibehyr.com/images/og-image.png'],
    },
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  const postIndex    = BLOG_POSTS.findIndex(p => p.slug === post.slug)
  const prevPost     = postIndex > 0 ? BLOG_POSTS[postIndex - 1] : null
  const nextPost     = postIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[postIndex + 1] : null
  const relatedPosts = getRelatedBlogPosts(post.slug, 3)

  // Extract H2 headings for automatic Table of Contents
  const tocHeadings = post.content
    .split('\n\n')
    .filter(block => block.startsWith('## '))
    .map(block => {
      const text = block.replace('## ', '').trim()
      return { text, id: slugifyHeading(text) }
    })

  // Structured Data: Article + BreadcrumbList + optional FAQPage
  const canonicalUrl = `https://vibehyr.com/blog/${post.slug}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seoTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    articleSection: post.category,
    keywords: post.keywords.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vibe Hyr',
      url: 'https://vibehyr.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vibehyr.com/icons/icon-512.png',
      },
    },
    image: 'https://vibehyr.com/images/og-image.png',
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://vibehyr.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://vibehyr.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  }

  const faqJsonLd =
    post.faqs && post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null

  // Convert markdown-style headings, checklists, lists, quotes, and paragraphs to semantic HTML
  const sections = post.content.split('\n\n').map((block, i) => {
    if (block.startsWith('## ')) {
      const headingText = block.replace('## ', '').trim()
      const headingId = slugifyHeading(headingText)
      return (
        <h2
          key={i}
          id={headingId}
          className="scroll-mt-24 font-display text-2xl md:text-3xl tracking-[0.03em] text-white mt-12 mb-4"
        >
          {headingText}
        </h2>
      )
    }
    if (block.startsWith('### ')) {
      const subText = block.replace('### ', '').trim()
      return (
        <h3
          key={i}
          className="font-display text-xl md:text-2xl tracking-[0.03em] text-orange-DEFAULT mt-8 mb-3"
        >
          {subText}
        </h3>
      )
    }
    if (block.startsWith('**') && block.endsWith('**') && !block.includes('\n')) {
      return (
        <p key={i} className="font-body font-bold text-white mb-3">
          {block.replace(/\*\*/g, '')}
        </p>
      )
    }
    if (block.startsWith('> ')) {
      return (
        <blockquote
          key={i}
          className="border-l-2 border-orange-DEFAULT pl-6 my-8 font-body italic text-grey-DEFAULT text-lg leading-relaxed"
        >
          {renderInlineFormatting(block.replace('> ', ''))}
        </blockquote>
      )
    }
    if (block.startsWith('- [ ] ') || block.includes('\n- [ ] ')) {
      const items = block.split('\n').filter(l => l.startsWith('- [ ] '))
      return (
        <ul key={i} className="flex flex-col gap-3 my-6 bg-black-2 border border-orange-DEFAULT/20 p-6">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 font-body text-grey-DEFAULT">
              <CheckSquare size={16} className="text-orange-DEFAULT mt-1 flex-shrink-0" />
              <span>{renderInlineFormatting(item.replace('- [ ] ', ''))}</span>
            </li>
          ))}
        </ul>
      )
    }
    if (block.startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter(l => l.startsWith('- '))
      return (
        <ul key={i} className="flex flex-col gap-3 my-6">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 font-body text-grey-DEFAULT">
              <span className="text-orange-DEFAULT mt-1 flex-shrink-0">✦</span>
              <span>{renderInlineFormatting(item.replace('- ', ''))}</span>
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
                <span className="font-mono text-orange-DEFAULT text-sm flex-shrink-0 mt-0.5">
                  {String(j + 1).padStart(2, '0')}.
                </span>
                <span>{renderInlineFormatting(item.replace(/^\d+\.\s*/, ''))}</span>
              </li>
            ))}
          </ol>
        )
      }
    }
    if (block.trim()) {
      return (
        <p key={i} className="font-body text-grey-DEFAULT leading-relaxed mb-5 text-[1.05rem]">
          {renderInlineFormatting(block)}
        </p>
      )
    }
    return null
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Navbar />
      <main className="pt-[68px] min-h-screen">

        {/* Header */}
        <section className="py-14 px-6 md:px-14 border-b border-white/8 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-3xl mx-auto pl-4">
            {/* Breadcrumb nav */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 font-mono text-[0.52rem] tracking-[0.2em] uppercase text-grey-dark flex-wrap">
                <li>
                  <Link href="/" className="hover:text-orange-DEFAULT transition-colors">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/blog" className="hover:text-orange-DEFAULT transition-colors">
                    Blog
                  </Link>
                </li>
                <li>/</li>
                <li className="text-orange-DEFAULT truncate max-w-xs" aria-current="page">
                  {post.category}
                </li>
              </ol>
            </nav>

            <div className="flex items-center gap-3 flex-wrap mb-6">
              <span className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-orange-DEFAULT">
                {post.category}
              </span>
              <span className="font-mono text-[0.48rem] tracking-[0.18em] uppercase px-2.5 py-0.5 bg-white/[0.04] border border-white/10 text-grey-DEFAULT">
                {VERTICAL_LABELS[post.vertical]}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[0.55rem] tracking-[0.1em] text-grey-dark">
                <Clock size={10} /> {post.readTime} min read
              </span>
            </div>

            <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-[0.95] tracking-[0.02em] text-white mb-5">
              {post.title}
            </h1>

            <p className="font-body italic text-grey-DEFAULT text-lg leading-relaxed mb-6">
              {post.excerpt}
            </p>

            {/* Author & Timestamps for E-E-A-T SEO */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-5 border-t border-white/10 font-mono text-[0.5rem] tracking-widest text-grey-dark">
              <div>
                By <span className="text-white font-medium">{post.author.name}</span> · {post.author.role}
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </span>
                <span className="text-[#dfbd8b]">
                  Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Article body */}
        <article className="py-12 px-6 md:px-14">
          <div className="max-w-3xl mx-auto">

            {/* On-Page Table of Contents */}
            {tocHeadings.length > 2 && (
              <nav
                aria-label="Table of Contents"
                className="mb-10 p-6 bg-black-2 border border-orange-DEFAULT/25"
              >
                <div className="flex items-center gap-2 font-mono text-[0.52rem] tracking-[0.22em] uppercase text-orange-DEFAULT mb-3">
                  <BookOpen size={13} />
                  In This Guide
                </div>
                <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                  {tocHeadings.map((h, idx) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="font-body text-sm text-grey-DEFAULT hover:text-orange-DEFAULT transition-colors flex items-baseline gap-2"
                      >
                        <span className="font-mono text-[0.5rem] text-orange-DEFAULT/80">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span>{h.text}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {sections}

            {/* FAQ Section (matches FAQPage JSON-LD schema) */}
            {post.faqs && post.faqs.length > 0 && (
              <section aria-labelledby="faq-heading" className="mt-16 pt-10 border-t border-white/10">
                <div className="flex items-center gap-2 font-mono text-[0.52rem] tracking-[0.25em] uppercase text-orange-DEFAULT mb-2">
                  <HelpCircle size={13} />
                  Key Questions Answered
                </div>
                <h2
                  id="faq-heading"
                  className="font-display text-2xl md:text-3xl tracking-[0.03em] text-white mb-6"
                >
                  FREQUENTLY ASKED QUESTIONS
                </h2>
                <div className="space-y-4">
                  {post.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="bg-black-2 border border-white/10 p-6 hover:border-orange-DEFAULT/30 transition-colors"
                    >
                      <h3 className="font-body font-semibold text-white text-base mb-2">
                        {faq.question}
                      </h3>
                      <p className="font-body text-grey-DEFAULT text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SEO Topic Tags */}
            <div className="mt-12 pt-6 border-t border-white/8 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[0.48rem] tracking-[0.2em] uppercase text-grey-dark mr-2">
                Topics:
              </span>
              {post.keywords.map(kw => (
                <span
                  key={kw}
                  className="font-mono text-[0.46rem] tracking-[0.14em] uppercase px-2.5 py-1 bg-black-2 border border-white/10 text-grey-DEFAULT"
                >
                  {kw}
                </span>
              ))}
            </div>
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
                Practice this framework inside Vibe Hyr with interactive Assumption Labs, audio-narrated lessons, and the nightly Revision Journal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={post.ctaHref ?? '/personal'} className="btn-orange">
                  {post.ctaLabel ?? 'Explore Courses'}
                </Link>
                <Link href="/community" className="btn-outline">
                  Join the Community Forum
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles for SEO Internal Linking */}
        {relatedPosts.length > 0 && (
          <section className="px-6 md:px-14 pb-14">
            <div className="max-w-3xl mx-auto border-t border-white/10 pt-12">
              <p className="font-mono text-[0.52rem] tracking-[0.25em] uppercase text-orange-DEFAULT mb-2">
                Continue Reading
              </p>
              <h2 className="font-display text-2xl tracking-[0.03em] text-white mb-6">
                RELATED REALITY ARCHITECTURE GUIDES
              </h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {relatedPosts.map(rel => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group flex flex-col bg-black-2 border border-white/10 hover:border-orange-DEFAULT/40 transition-colors p-5"
                  >
                    <span className="font-mono text-[0.46rem] tracking-[0.2em] uppercase text-orange-DEFAULT mb-2">
                      {rel.category}
                    </span>
                    <h3 className="font-display text-lg leading-snug text-white group-hover:text-orange-DEFAULT transition-colors mb-2 flex-1">
                      {rel.title}
                    </h3>
                    <span className="font-mono text-[0.48rem] tracking-[0.15em] uppercase text-grey-dark flex items-center gap-1 mt-2">
                      {rel.readTime} min read <ArrowRight size={9} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
