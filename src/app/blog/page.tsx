import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/lib/data/blog'
import { BlogExplorer } from '@/components/blog/BlogExplorer'

export const metadata: Metadata = {
  title: 'The Architecture of Reality Blog — Law of Assumption, Neuroscience & Leadership',
  description:
    'Science-backed guides on the Law of Assumption, SATS (State Akin to Sleep), Reticular Activating System (RAS) reprogramming, workplace conflict de-escalation, trauma-informed classroom co-regulation, and executive leadership.',
  keywords: [
    'law of assumption blog',
    'neville goddard SATS guide',
    'reticular activating system manifestation',
    'workplace conflict de-escalation',
    'trauma-informed classroom co-regulation',
    'internal authority leadership',
    'memory reconsolidation revision technique',
    'vibe hyr blog',
  ],
  alternates: {
    canonical: 'https://vibehyr.com/blog',
  },
  openGraph: {
    title: 'The Architecture of Reality Blog | Vibe Hyr',
    description:
      'Neuroscience meets consciousness across Personal Mastery, Business Leadership, Educators, and Organizational Architecture.',
    url: 'https://vibehyr.com/blog',
    siteName: 'Vibe Hyr',
    type: 'website',
    images: [
      {
        url: 'https://vibehyr.com/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vibe Hyr — The Architecture of Reality Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Architecture of Reality Blog | Vibe Hyr',
    description:
      'Practical guides on SATS, RAS reprogramming, workplace de-escalation, classroom co-regulation, and internal authority.',
    images: ['https://vibehyr.com/images/og-image.png'],
  },
}

export default function BlogPage() {
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'The Vibe Hyr Blog — The Architecture of Reality',
    url: 'https://vibehyr.com/blog',
    description:
      'Guides on the Law of Assumption, SATS, Reticular Activating System neuroscience, workplace de-escalation, educator co-regulation, and leadership.',
    publisher: {
      '@type': 'Organization',
      name: 'Vibe Hyr',
      url: 'https://vibehyr.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vibehyr.com/icons/icon-512.png',
      },
    },
    blogPost: BLOG_POSTS.map(post => ({
      '@type': 'BlogPosting',
      headline: post.seoTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt,
      url: `https://vibehyr.com/blog/${post.slug}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Person',
        name: post.author.name,
      },
      keywords: post.keywords.join(', '),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <Navbar />
      <main className="pt-[68px] min-h-screen">

        {/* Header */}
        <section className="py-16 px-6 md:px-14 border-b-2 border-orange-DEFAULT/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-7xl mx-auto">
            <div className="label mb-3">
              The Vibe Hyr Journal · Personal · Business · Educators · Leadership
            </div>
            <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[0.02em]">
              THE ARCHITECTURE<br />
              <span className="text-orange-DEFAULT">OF REALITY</span>
            </h1>
            <p className="font-body italic text-grey-DEFAULT mt-4 max-w-2xl text-lg leading-relaxed">
              Neuroscience meets Neville. Deep-dive guides on SATS, RAS reprogramming, workplace conflict de-escalation, trauma-informed classroom co-regulation, and sovereign leadership.
            </p>
          </div>
        </section>

        <div className="py-14 px-6 md:px-14">
          <div className="max-w-7xl mx-auto">
            <BlogExplorer posts={BLOG_POSTS} categories={BLOG_CATEGORIES} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
