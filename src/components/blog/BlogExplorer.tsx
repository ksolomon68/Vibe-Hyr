'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlogPost, BlogVertical } from '@/lib/data/blog'

const VERTICAL_FILTERS: { id: BlogVertical | 'all'; label: string }[] = [
  { id: 'all',        label: 'All Tracks' },
  { id: 'personal',   label: 'Personal' },
  { id: 'business',   label: 'Business' },
  { id: 'educators',  label: 'Educators' },
  { id: 'leadership', label: 'Leadership' },
]

const VERTICAL_BADGE_STYLES: Record<BlogVertical, string> = {
  personal:   'bg-orange-DEFAULT/10 text-orange-DEFAULT border-orange-DEFAULT/30',
  business:   'bg-amber-500/10 text-amber-300 border-amber-500/30',
  educators:  'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  leadership: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
}

const VERTICAL_LABELS: Record<BlogVertical, string> = {
  personal:   'Personal Mastery',
  business:   'Business & Workplace',
  educators:  'Educators',
  leadership: 'Leadership',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogExplorer({
  posts,
  categories,
}: {
  posts: BlogPost[]
  categories: string[]
}) {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [activeVertical, setActiveVertical] = useState<BlogVertical | 'all'>('all')
  const [searchQuery, setSearchQuery]       = useState<string>('')

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return posts.filter(post => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory
      const matchesVertical = activeVertical === 'all' || post.vertical === activeVertical
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.keywords.some(k => k.toLowerCase().includes(q))
      return matchesCategory && matchesVertical && matchesQuery
    })
  }, [posts, activeCategory, activeVertical, searchQuery])

  const showFeaturedBanner =
    activeCategory === 'All' &&
    activeVertical === 'all' &&
    !searchQuery.trim() &&
    filteredPosts.length > 0

  const featured = showFeaturedBanner ? filteredPosts[0] : null
  const gridPosts = showFeaturedBanner ? filteredPosts.slice(1) : filteredPosts

  return (
    <div>
      {/* Featured post */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group block mb-12 p-8 md:p-12 bg-black-2 border-2 border-orange-DEFAULT/30 hover:border-orange-DEFAULT transition-colors relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-DEFAULT" />
          <div className="pl-4 md:pl-8">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <span className="inline-flex items-center gap-1 font-mono text-[0.52rem] tracking-[0.25em] uppercase text-orange-DEFAULT bg-orange-DEFAULT/10 border border-orange-DEFAULT/30 px-3 py-1">
                <Sparkles size={11} />
                Featured Pillar Guide
              </span>
              <span className={cn('font-mono text-[0.5rem] tracking-[0.2em] uppercase px-2.5 py-1 border', VERTICAL_BADGE_STYLES[featured.vertical])}>
                {VERTICAL_LABELS[featured.vertical]}
              </span>
              <span className="font-mono text-[0.52rem] tracking-[0.2em] uppercase text-grey-dark">
                {featured.category}
              </span>
              <span className="flex items-center gap-1 font-mono text-[0.52rem] tracking-[0.1em] text-grey-dark">
                <Clock size={10} /> {featured.readTime} min read
              </span>
              <time
                dateTime={featured.updatedAt}
                className="font-mono text-[0.5rem] tracking-[0.15em] uppercase text-[#dfbd8b]"
              >
                Updated {formatDate(featured.updatedAt)}
              </time>
            </div>
            <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] leading-[0.98] tracking-[0.02em] text-white mb-4 group-hover:text-orange-DEFAULT transition-colors">
              {featured.title}
            </h2>
            <p className="font-body text-grey-DEFAULT italic leading-relaxed max-w-3xl mb-6">
              {featured.excerpt}
            </p>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="font-mono text-[0.52rem] tracking-widest text-grey-dark">
                By <span className="text-white/80">{featured.author.name}</span> · {featured.author.role}
              </span>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-orange-DEFAULT flex items-center gap-2">
                Read Full Guide <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Search + Track Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[0.48rem] tracking-[0.2em] uppercase text-grey-dark mr-1">
            Track:
          </span>
          {VERTICAL_FILTERS.map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActiveVertical(v.id)}
              className={cn(
                'font-mono text-[0.52rem] tracking-[0.18em] uppercase px-3 py-1.5 border transition-colors',
                activeVertical === v.id
                  ? 'border-orange-DEFAULT bg-orange-DEFAULT/15 text-orange-DEFAULT'
                  : 'border-white/15 text-grey-dark hover:border-orange-DEFAULT/40 hover:text-white'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-dark" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles, SATS, RAS, leadership..."
            aria-label="Search blog articles"
            className="w-full bg-black-2 border border-white/15 pl-9 pr-4 py-2 font-body text-xs text-white placeholder:text-grey-dark focus:outline-none focus:border-orange-DEFAULT/50 transition-colors"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          type="button"
          onClick={() => setActiveCategory('All')}
          className={cn(
            'font-mono text-[0.55rem] tracking-[0.2em] uppercase px-4 py-1.5 border transition-colors',
            activeCategory === 'All'
              ? 'border-orange-DEFAULT text-orange-DEFAULT bg-orange-DEFAULT/10'
              : 'border-white/10 text-grey-dark hover:border-orange-DEFAULT/40 hover:text-orange-DEFAULT'
          )}
        >
          All Posts ({posts.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'font-mono text-[0.55rem] tracking-[0.2em] uppercase px-4 py-1.5 border transition-colors',
              activeCategory === cat
                ? 'border-orange-DEFAULT text-orange-DEFAULT bg-orange-DEFAULT/10'
                : 'border-white/10 text-grey-dark hover:border-orange-DEFAULT/40 hover:text-orange-DEFAULT'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post grid */}
      {gridPosts.length === 0 ? (
        <div className="py-16 text-center bg-black-2 border border-white/10">
          <p className="font-body italic text-grey-DEFAULT mb-4">
            No articles match your current filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('All')
              setActiveVertical('all')
              setSearchQuery('')
            }}
            className="btn-outline-orange"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridPosts.map(post => (
            <article
              key={post.slug}
              className="group flex flex-col bg-black-2 border border-white/8 hover:border-orange-DEFAULT/40 transition-colors p-7"
            >
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="font-mono text-[0.5rem] tracking-[0.22em] uppercase text-orange-DEFAULT">
                  {post.category}
                </span>
                <span className={cn('font-mono text-[0.44rem] tracking-[0.16em] uppercase px-2 py-0.5 border', VERTICAL_BADGE_STYLES[post.vertical])}>
                  {VERTICAL_LABELS[post.vertical]}
                </span>
                <span className="flex items-center gap-1 font-mono text-[0.5rem] tracking-[0.1em] text-grey-dark ml-auto">
                  <Clock size={9} /> {post.readTime} min
                </span>
              </div>

              <h3 className="font-display text-xl leading-tight tracking-[0.02em] text-white mb-3 group-hover:text-orange-DEFAULT transition-colors">
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.title}
                </Link>
              </h3>

              <p className="font-body text-sm italic text-grey-dark leading-relaxed mb-4 line-clamp-3 flex-1">
                {post.excerpt}
              </p>

              {/* SEO keyword tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {post.keywords.slice(0, 2).map(kw => (
                  <span
                    key={kw}
                    className="font-mono text-[0.43rem] tracking-[0.12em] uppercase px-2 py-0.5 bg-white/[0.03] border border-white/10 text-grey-dark"
                  >
                    {kw}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                <time
                  dateTime={post.updatedAt}
                  className="font-mono text-[0.48rem] tracking-widest text-grey-dark"
                >
                  Updated {formatDate(post.updatedAt)}
                </time>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT flex items-center gap-1.5"
                >
                  Read Article <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
