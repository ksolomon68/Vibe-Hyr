'use client'

import { useState } from 'react'
import { Play, Volume2, VolumeX } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string | null
  title: string
  thumbnailUrl?: string | null
  onComplete?: () => void
  lessonId?: string
  duration?: number
  initialProgress?: number
}

// Branded backdrop — CSS gradient, no missing image dependency
const BACKDROP_STYLE: React.CSSProperties = {
  background: 'radial-gradient(ellipse at 30% 40%, rgba(255,123,0,0.18) 0%, rgba(10,10,10,1) 65%)',
}

// Orange grid overlay
const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255,123,0,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,123,0,0.25) 1px, transparent 1px)',
  backgroundSize: '60px 60px',
}

// ── Shared thumbnail UI ──────────────────────────────────────────────────────

function ThumbnailOverlay({
  title,
  subtitle,
  thumbnailUrl,
  onClick,
}: {
  title: string
  subtitle: string
  thumbnailUrl?: string | null
  onClick?: () => void
}) {
  return (
    <div
      className={`relative w-full overflow-hidden border-b border-white/8 ${onClick ? 'cursor-pointer group' : ''}`}
      style={{ paddingBottom: '56.25%', background: '#0A0A0A' }}
      onClick={onClick}
    >
      {/* Branded gradient backdrop (always rendered, no missing image) */}
      <div className="absolute inset-0" style={BACKDROP_STYLE} />
      {/* Orange grid pattern */}
      <div className="absolute inset-0 opacity-10" style={GRID_STYLE} />
      {/* Optional thumbnail image on top */}
      {thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      )}
      {/* Semi-dark scrim so text/button stand out */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Centered play button + text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        {/* Play circle */}
        <div
          style={{ background: '#FF7B00', boxShadow: '0 0 30px rgba(255,123,0,0.5)' }}
          className={`w-20 h-20 rounded-full flex items-center justify-center ${onClick ? 'group-hover:scale-105 transition-transform' : ''}`}
        >
          <Play size={30} className="ml-1" style={{ color: '#000', fill: '#000' }} />
        </div>

        {/* Title + subtitle */}
        <div className="text-center px-8">
          <p
            className="font-display text-xl tracking-widest mb-1"
            style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            {title}
          </p>
          <p
            className="font-mono text-[0.58rem] tracking-[0.2em] uppercase"
            style={{ color: '#888888', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function VideoPlayer({ videoUrl, title, thumbnailUrl, onComplete }: VideoPlayerProps) {
  const [started, setStarted] = useState(false)
  const [muted,   setMuted]   = useState(false)

  // YouTube URL detection
  const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be')

  const getYouTubeEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/embed')) return `${url}?autoplay=1`
    const watchMatch = url.match(/[?&]v=([^&]+)/)
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1`
    return url
  }

  // Cloudflare Stream URL detection
  const isCFStream = videoUrl?.includes('cloudflarestream.com') ||
    videoUrl?.includes('iframe.videodelivery.net')

  // Extract Cloudflare video ID if it's a raw ID
  const cfEmbedUrl = videoUrl && !videoUrl.startsWith('http')
    ? `https://iframe.videodelivery.net/${videoUrl}?preload=true&autoplay=false`
    : videoUrl

  // ── No video yet ─────────────────────────────────────────────────────────
  if (!videoUrl) {
    return (
      <ThumbnailOverlay
        title={title}
        subtitle="Video coming soon — read the lesson content below"
        thumbnailUrl={thumbnailUrl}
      />
    )
  }

  // ── Pre-play thumbnail ────────────────────────────────────────────────────
  if (!started) {
    return (
      <ThumbnailOverlay
        title={title}
        subtitle="Click to play"
        thumbnailUrl={thumbnailUrl}
        onClick={() => setStarted(true)}
      />
    )
  }

  // ── YouTube embed ─────────────────────────────────────────────────────────
  if (isYouTube) {
    return (
      <div className="relative w-full bg-black border-b border-white/8" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={getYouTubeEmbedUrl(videoUrl)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title}
        />
      </div>
    )
  }

  // ── Cloudflare Stream / iframe embed ─────────────────────────────────────
  if (isCFStream || cfEmbedUrl) {
    return (
      <div className="relative w-full bg-black border-b border-white/8" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={cfEmbedUrl ?? ''}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>
    )
  }

  // ── Native HTML5 video fallback ───────────────────────────────────────────
  return (
    <div className="relative w-full bg-black border-b border-white/8" style={{ paddingBottom: '56.25%' }}>
      <video
        className="absolute inset-0 w-full h-full"
        src={videoUrl}
        controls
        autoPlay
        muted={muted}
        onEnded={onComplete}
      />
      <button
        onClick={() => setMuted(!muted)}
        className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 transition-colors rounded-full"
      >
        {muted
          ? <VolumeX size={14} className="text-white" />
          : <Volume2 size={14} className="text-white" />
        }
      </button>
    </div>
  )
}
