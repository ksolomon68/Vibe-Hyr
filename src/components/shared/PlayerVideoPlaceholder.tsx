'use client'

interface PlayerVideoPlaceholderProps {
  duration?: string
  onClick?: () => void
}

export function PlayerVideoPlaceholder({ duration, onClick }: PlayerVideoPlaceholderProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Play video${duration ? ` — ${duration}` : ''}`}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
      style={{
        backgroundImage:    "url('/images/video-backdrop.png')",
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        aspectRatio:        '16/9',
        borderRadius:       14,
        border:             '1px solid var(--p-border)',
        display:            'flex',
        flexDirection:      'column',
        alignItems:         'center',
        justifyContent:     'center',
        position:           'relative',
        overflow:           'hidden',
        cursor:             'pointer',
        marginBottom:       28,
      }}
    >
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,8,4,0.5) 0%, transparent 60%, rgba(10,8,4,0.3) 100%)' }} />

      {/* Orange play button */}
      <div style={{
        width:        64,
        height:       64,
        borderRadius: '50%',
        background:   'var(--p-orange)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        fontSize:     22,
        color:        '#fff',
        position:     'relative',
        zIndex:       1,
        boxShadow:    '0 0 40px rgba(232,98,26,0.44)',
      }}>▶</div>

      {/* Label */}
      <div style={{
        position:      'relative',
        zIndex:        1,
        fontSize:      12,
        color:         'var(--p-cream)',
        letterSpacing: '0.1em',
        fontWeight:    600,
        marginTop:     14,
        textTransform: 'uppercase',
      }}>
        Click to Play{duration ? ` · ${duration}` : ''}
      </div>
    </div>
  )
}
