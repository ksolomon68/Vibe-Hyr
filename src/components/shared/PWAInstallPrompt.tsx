'use client'

import { useState, useEffect } from 'react'
import { X, Download, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'vh-pwa-dismissed'

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow]                     = useState(false)
  const [isIOS, setIsIOS]                   = useState(false)
  const [installed, setInstalled]           = useState(false)

  useEffect(() => {
    // Already installed (standalone mode) — never show
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }
    // User previously dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream

    setIsIOS(ios)

    if (ios) {
      // Show iOS instruction banner after 4 s
      const t = setTimeout(() => setShow(true), 4000)
      return () => clearTimeout(t)
    }

    // Android / Chrome / Edge — capture the native prompt
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') setInstalled(true)
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  if (!show || installed) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9996] p-4 md:hidden"
      role="complementary"
      aria-label="Install Vibe Hyr app"
    >
      <div className="bg-[#1C1409] border border-[#3A2A14] rounded-2xl p-4 flex items-start gap-4 shadow-[0_-4px_32px_rgba(0,0,0,0.6)]">

        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-[#E8621A] flex-shrink-0 flex items-center justify-center shadow-[0_4px_12px_rgba(232,98,26,0.4)]">
          {isIOS ? <Share size={18} className="text-white" /> : <Download size={18} className="text-white" />}
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-[1.1rem] tracking-[0.06em] text-white leading-tight">
            INSTALL VIBE HYR
          </p>
          {isIOS ? (
            <p className="font-body text-[0.78rem] text-[#9C8A70] mt-1 leading-relaxed">
              Tap the <strong className="text-white font-semibold">Share</strong> icon below,
              then <strong className="text-white font-semibold">Add to Home Screen</strong>
            </p>
          ) : (
            <p className="font-body text-[0.78rem] text-[#9C8A70] mt-1 leading-relaxed">
              Add to your home screen for offline access &amp; the full experience
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="font-mono text-[0.6rem] tracking-[0.14em] uppercase font-bold bg-[#E8621A] text-white px-3 py-2 rounded-lg min-h-[36px]"
            >
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="text-[#9C8A70] hover:text-white p-2 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
