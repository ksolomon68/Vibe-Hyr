'use client'

import { useState } from 'react'
import { Play, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  videoUrl:        string | null
  title:           string
  thumbnailUrl?:   string | null
  onComplete?:     () => void
  lessonId?:       string
  duration?:       number
  initialProgress?: number
}

export function VideoPlayer({ videoUrl, title, thumbnailUrl, onComplete }: VideoPlayerProps) {
  const [started,  setStarted]  = useState(false)
  const [muted,    setMuted]    = useState(false)

  // Cloudflare Stream URL detection
  const isCFStream = videoUrl?.includes('cloudflarestream.com') ||
                     videoUrl?.includes('iframe.videodelivery.net')

  // Extract Cloudflare video ID if it's a raw ID
  const cfEmbedUrl = videoUrl && !videoUrl.startsWith('http')
    ? `https://iframe.videodelivery.net/${videoUrl}?preload=true&autoplay=false`
    : videoUrl

  if (!videoUrl) {
    // Placeholder for when video hasn't been uploaded yet
    return (
      <div className="relative w-full bg-black-3 border-b border-white/8"
           style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-orange-DEFAULT flex items-center justify-center">
            <Play size={30} className="text-orange-DEFAULT ml-1" fill="currentColor" />
          </div>
          <div className="text-center px-8">
            <p className="font-display text-xl tracking-widest text-white mb-1">{title}</p>
            <p className="font-mono text-[0.58rem] tracking-[0.2em] text-grey-dark uppercase">
              Video coming soon — read the lesson content below
            </p>
          </div>
          {/* Decorative grid lines */}
          <div className="absolute inset-0 pointer-events-none opacity-10"
               style={{
                 backgroundImage: 'linear-gradient(rgba(255,123,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,123,0,0.3) 1px, transparent 1px)',
                 backgroundSize: '60px 60px',
               }}
          />
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div
        className="relative w-full bg-black-3 cursor-pointer group border-b border-white/8"
        style={{ paddingBottom: '56.25%' }}
        onClick={() => setStarted(true)}
      >
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
          <div className="w-20 h-20 rounded-full bg-orange-DEFAULT flex items-center justify-center
                          group-hover:scale-105 transition-transform shadow-lg shadow-orange-DEFAULT/30">
            <Play size={28} className="text-black ml-1" fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-display text-lg tracking-widest text-white drop-shadow-lg">{title}</p>
        </div>
      </div>
    )
  }

  // Cloudflare Stream / iframe embed
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

  // Native HTML5 video fallback
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
