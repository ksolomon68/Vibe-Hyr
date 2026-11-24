'use client'

import { useState, useEffect } from 'react'
import { Play, Volume2, VolumeX, Headphones, Square, Sparkles, BookOpen } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string | null
  title: string
  thumbnailUrl?: string | null
  onComplete?: () => void
  lessonId?: string
  duration?: number
  initialProgress?: number
}

// Branded backdrop image
const BACKDROP_STYLE: React.CSSProperties = {
  backgroundImage: 'url("/images/video-backdrop.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}

// Orange tint over the backdrop image
const TINT_STYLE: React.CSSProperties = {
  background: 'radial-gradient(ellipse at 30% 40%, rgba(232,98,26,0.18) 0%, rgba(10,10,10,0.82) 70%)',
}

// Orange grid overlay
const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(232,98,26,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(232,98,26,0.22) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
}

// ── Compact Cinematic Header + Audio Reader when no video URL is attached ──

function CompactModuleBanner({
  title,
  duration,
}: {
  title: string
  duration?: number
}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)

  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [title])

  function toggleAudioRead() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    // Grab the readable lesson text from the main content container
    const contentEl =
      document.querySelector('.prose-vibe') ||
      document.querySelector('.prose-vibe-html') ||
      document.querySelector('.content-area') ||
      document.querySelector('main')

    const rawText = contentEl?.textContent?.replace(/\s+/g, ' ').trim() || title
    const utterance = new SpeechSynthesisUtterance(`${title}. ${rawText}`)
    utterance.rate = 0.96
    utterance.pitch = 0.98
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  const estMins = duration ? Math.max(5, Math.round(duration / 60)) : 15

  return (
    <div className="relative w-full overflow-hidden border-b border-white/8 bg-[#0A0805]">
      <div className="absolute inset-0 opacity-45" style={BACKDROP_STYLE} />
      <div className="absolute inset-0" style={TINT_STYLE} />
      <div className="absolute inset-0 opacity-10" style={GRID_STYLE} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[#E8621A]/15 border border-[#E8621A]/50 flex items-center justify-center flex-shrink-0">
            <Sparkles size={15} className="text-[#E8621A]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-[0.55rem] tracking-[0.22em] uppercase text-[#E8621A] font-semibold">
                Interactive Masterclass Module
              </span>
              <span className="text-white/20 text-xs">·</span>
              <span className="font-mono text-[0.52rem] tracking-[0.18em] uppercase text-white/50 flex items-center gap-1">
                <BookOpen size={11} className="text-[#C9A84C]" /> ~{estMins} min study &amp; lab
              </span>
            </div>
            <p className="font-body text-xs italic text-white/55 mt-0.5">
              Read the deep-dive framework, complete the Assumption Lab, and record your insights below.
            </p>
          </div>
        </div>

        {speechSupported && (
          <button
            onClick={toggleAudioRead}
            className={`px-3.5 py-2 rounded-lg border font-mono text-[0.55rem] tracking-[0.18em] uppercase flex items-center gap-2 transition-all ${
              isSpeaking
                ? 'border-[#E8621A] bg-[#E8621A] text-black font-bold shadow-[0_0_20px_rgba(232,98,26,0.4)]'
                : 'border-white/15 bg-black/50 text-white/80 hover:border-[#E8621A] hover:text-[#E8621A]'
            }`}
            title={isSpeaking ? 'Stop audio narration' : 'Listen to lesson narration'}
          >
            {isSpeaking ? (
              <>
                <Square size={11} className="fill-current" /> Stop Audio
              </>
            ) : (
              <>
                <Headphones size={12} /> Listen to Lesson
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Shared thumbnail UI (when a videoUrl is present) ─────────────────────────

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
      {/* Branded backdrop image */}
      <div className="absolute inset-0" style={BACKDROP_STYLE} />
      {/* Orange tint over backdrop */}
      <div className="absolute inset-0" style={TINT_STYLE} />
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
          style={{ background: 'var(--orange)', boxShadow: '0 0 30px rgba(255,127,48,0.5)' }}
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
            style={{ color: 'var(--grey)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function VideoPlayer({ videoUrl, title, thumbnailUrl, onComplete, duration }: VideoPlayerProps) {
  const [started, setStarted] = useState(false)
  const [muted,   setMuted]   = useState(false)

  // Reset play state when navigating between lessons
  useEffect(() => {
    setStarted(false)
  }, [videoUrl, title])

  // YouTube URL detection — includes youtube-nocookie.com (used by courseContent.ts embed conversion)
  const isYouTube = videoUrl?.includes('youtube.com') ||
                    videoUrl?.includes('youtu.be') ||
                    videoUrl?.includes('youtube-nocookie.com')

  const getYouTubeEmbedUrl = (url: string): string => {
    // Already an embed URL (youtube.com/embed or youtube-nocookie.com/embed) — just append autoplay
    if (url.includes('/embed/')) {
      return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`
    }
    const watchMatch = url.match(/[?&]v=([^&]+)/)
    if (watchMatch) return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?autoplay=1&rel=0`
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
    if (shortMatch) return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?autoplay=1&rel=0`
    return url
  }

  // Cloudflare Stream URL detection
  const isCFStream = videoUrl?.includes('cloudflarestream.com') ||
    videoUrl?.includes('iframe.videodelivery.net')

  // Extract Cloudflare video ID if it's a raw ID
  const cfEmbedUrl = videoUrl && !videoUrl.startsWith('http')
    ? `https://iframe.videodelivery.net/${videoUrl}?preload=true&autoplay=false`
    : videoUrl

  // ── No video yet: render compact cinematic banner + audio reader ──────────
  if (!videoUrl) {
    return <CompactModuleBanner title={title} duration={duration} />
  }

  // ── Pre-play thumbnail ────────────────────────────────────────────────────
  if (!started) {
    return (
      <ThumbnailOverlay
        title={title}
        subtitle="Click to play video lesson"
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
