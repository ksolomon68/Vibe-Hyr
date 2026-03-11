'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { GLOSSARY } from '@/lib/accessibility/glossary'
import Link from 'next/link'

/* ─── Types ─────────────────────────────────────────────────────── */
interface A11ySettings {
  textScale:        number    // 80–200
  lineHeight:       number    // 1.2–2.4
  letterSpacing:    number    // 0–0.2 (em)
  wordSpacing:      number    // 0–0.5 (em)
  highContrast:     boolean
  lightMode:        boolean
  saturation:       'normal' | 'low' | 'grayscale'
  highlightLinks:   boolean
  highlightHeadings:boolean
  readingGuide:     boolean
  readingMask:      boolean
  focusMode:        boolean
  dyslexiaFont:     boolean
  textAlign:        'default' | 'left' | 'center' | 'justify'
  keyboardNav:      boolean
  pauseAnimations:  boolean
  largeTargets:     boolean
  tooltips:         boolean
  reduceCognitive:  boolean
  language:         'en' | 'es' | 'fr'
}

const DEFAULTS: A11ySettings = {
  textScale: 100, lineHeight: 1.6, letterSpacing: 0, wordSpacing: 0,
  highContrast: false, lightMode: false, saturation: 'normal',
  highlightLinks: false, highlightHeadings: false,
  readingGuide: false, readingMask: false, focusMode: false,
  dyslexiaFont: false, textAlign: 'default',
  keyboardNav: false, pauseAnimations: false, largeTargets: false,
  tooltips: false, reduceCognitive: false, language: 'en',
}

const KEY = 'vh_a11y'
const loadSettings = (): A11ySettings => {
  if (typeof window === 'undefined') return DEFAULTS
  try { const s = localStorage.getItem(KEY); return s ? { ...DEFAULTS, ...JSON.parse(s) } : DEFAULTS }
  catch { return DEFAULTS }
}
const saveSettings = (s: A11ySettings) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {}
}

/* ─── Apply all settings to DOM ─────────────────────────────────── */
function applySettings(s: A11ySettings) {
  if (typeof document === 'undefined') return
  const body = document.body
  const html  = document.documentElement

  // Text scale
  html.style.fontSize = s.textScale !== 100 ? `${s.textScale}%` : ''

  // CSS custom props for line/letter/word spacing
  body.style.setProperty('--a11y-lh', s.lineHeight.toString())
  body.style.setProperty('--a11y-ls', `${s.letterSpacing}em`)
  body.style.setProperty('--a11y-ws', `${s.wordSpacing}em`)

  // Body classes
  const cls = body.classList
  cls.toggle('high-contrast',     s.highContrast)
  cls.toggle('light-mode',        s.lightMode)
  cls.toggle('low-saturation',    s.saturation === 'low')
  cls.toggle('grayscale',         s.saturation === 'grayscale')
  cls.toggle('highlight-links',   s.highlightLinks)
  cls.toggle('highlight-headings',s.highlightHeadings)
  cls.toggle('focus-mode',        s.focusMode)
  cls.toggle('dyslexia-font',     s.dyslexiaFont)
  cls.toggle('keyboard-nav',      s.keyboardNav)
  cls.toggle('pause-animations',  s.pauseAnimations)
  cls.toggle('large-targets',     s.largeTargets)
  cls.toggle('reduce-cognitive',  s.reduceCognitive)

  // Text align on lesson body areas
  const bodyEls = document.querySelectorAll('.lesson-body, .module-body, article p')
  bodyEls.forEach((el: Element) => {
    ;(el as HTMLElement).style.textAlign = s.textAlign === 'default' ? '' : s.textAlign
  })

  // Lang attribute
  html.setAttribute('lang', s.language)
}

/* ─── Component ─────────────────────────────────────────────────── */
export function AccessibilityWidget() {
  const [open,     setOpen]     = useState(false)
  const [settings, setSettings] = useState<A11ySettings>(DEFAULTS)
  const guideRef = useRef<HTMLDivElement>(null)
  const maskTopRef = useRef<HTMLDivElement>(null)
  const maskBotRef = useRef<HTMLDivElement>(null)

  // Load on mount (before paint)
  useLayoutEffect(() => {
    const s = loadSettings()
    setSettings(s)
    applySettings(s)
  }, [])

  // Apply whenever settings change
  useEffect(() => {
    applySettings(settings)
    saveSettings(settings)
  }, [settings])

  // Reading guide + mask mouse tracking
  useEffect(() => {
    if (!settings.readingGuide && !settings.readingMask) return
    const onMove = (e: MouseEvent) => {
      if (settings.readingGuide && guideRef.current) {
        guideRef.current.style.top = `${e.clientY}px`
      }
      if (settings.readingMask) {
        const y = e.clientY
        if (maskTopRef.current)  { maskTopRef.current.style.top = '0'; maskTopRef.current.style.height = `${Math.max(0, y - 30)}px` }
        if (maskBotRef.current)  { maskBotRef.current.style.top = `${y + 30}px`; maskBotRef.current.style.bottom = '0'; maskBotRef.current.style.height = 'auto' }
      }
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [settings.readingGuide, settings.readingMask])

  // Tooltip on hover
  useEffect(() => {
    if (!settings.tooltips) return
    const terms = Object.keys(GLOSSARY)
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const text = target.textContent || ''
      const match = terms.find(t => text.includes(t))
      if (!match) return
      const existing = document.getElementById('a11y-tooltip')
      if (existing) existing.remove()
      const tip = document.createElement('div')
      tip.id = 'a11y-tooltip'
      tip.style.cssText = `position:fixed;top:${e.clientY - 60}px;left:${Math.min(e.clientX, window.innerWidth - 280)}px;z-index:99999;background:var(--p-card2);border:1px solid var(--p-orange);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--p-cream);max-width:260px;line-height:1.5;box-shadow:0 4px 20px rgba(0,0,0,0.5);pointer-events:none;`
      tip.innerHTML = `<strong style="color:var(--p-orange);font-size:11px;display:block;margin-bottom:4px">${match}</strong>${GLOSSARY[match]}`
      document.body.appendChild(tip)
    }
    const onOut = () => { document.getElementById('a11y-tooltip')?.remove() }
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout',  onOut)
    return () => { document.removeEventListener('mouseover', onOver); document.removeEventListener('mouseout', onOut) }
  }, [settings.tooltips])

  const set = useCallback(<K extends keyof A11ySettings>(k: K, v: A11ySettings[K]) => {
    setSettings(prev => ({ ...prev, [k]: v }))
  }, [])

  const resetAll = () => {
    setSettings(DEFAULTS)
    saveSettings(DEFAULTS)
    applySettings(DEFAULTS)
    localStorage.removeItem(KEY)
  }

  /* ── UI helpers ── */
  const Toggle = ({ label, value, onChange, id }: { label: string; value: boolean; onChange: (v: boolean) => void; id: string }) => (
    <div className="a11y-row">
      <label htmlFor={id} className="a11y-row-label" style={{ cursor: 'pointer', flex: 1 }}>{label}</label>
      <button
        id={id} role="switch" aria-checked={value}
        onClick={() => onChange(!value)}
        className={`toggle-switch ${value ? 'on' : ''}`}
      />
    </div>
  )

  const Slider = ({ label, value, min, max, step = 0.1, onChange, fmt }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; fmt?: (v: number) => string }) => (
    <div className="a11y-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <label className="a11y-row-label">{label}</label>
        <span className="text-size-value">{fmt ? fmt(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        aria-label={label}
        style={{ width: '100%', accentColor: 'var(--p-orange)' }} />
    </div>
  )

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <div className="a11y-section-label">
        {title}
      </div>
      {children}
    </div>
  )

  const RadioGroup = ({ label, options, value, onChange }: { label: string; options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) => (
    <div className="a11y-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
      <div className="a11y-row-label">{label}</div>
      <div className="seg-btn-group">
        {options.map(o => (
          <button key={o.v} onClick={() => onChange(o.v)}
            aria-pressed={value === o.v}
            className={`seg-btn ${value === o.v ? 'active' : ''}`}>
            {o.l}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Reading guide overlay */}
      {settings.readingGuide && <div ref={guideRef} className="reading-guide" style={{ top: 0 }} aria-hidden="true" />}
      {settings.readingMask  && <>
        <div ref={maskTopRef} className="reading-mask-top"    aria-hidden="true" style={{ top: 0, height: 0 }} />
        <div ref={maskBotRef} className="reading-mask-bottom" aria-hidden="true" style={{ top: '100vh' }} />
      </>}

      {/* ARIA live region */}
      <div aria-live="polite" aria-atomic="true" id="a11y-announcer" style={{ position: 'absolute', left: -9999, top: 0 }} />

      {/* Trigger button */}
      <button
        className="a11y-trigger"
        aria-label="Accessibility options"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen(o => !o)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 11v8"/>
          <path d="M8 15h8"/>
          <circle cx="12" cy="7" r="1"/>
        </svg>
        <span className="a11y-trigger-label">ACCESS</span>
      </button>

      {/* Panel */}
      <div
        id="a11y-panel"
        className={`a11y-panel ${open ? 'open' : ''}`}
        role="dialog"
        aria-label="Accessibility settings"
        aria-modal="false"
      >
        {/* Panel header */}
        <div className="a11y-header">
          <h2 className="a11y-header-title">ACCESSIBILITY</h2>
          <div className="a11y-header-shortcut">Display & Motor Adjustments</div>
          <button onClick={() => setOpen(false)} aria-label="Close accessibility panel" className="a11y-close-btn">
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="a11y-body">

          <Section title="Vision">
            <Slider label="Text Size" value={settings.textScale} min={80} max={200} step={5} onChange={v => set('textScale', v)} fmt={v => `${v}%`} />
            <Slider label="Line Height" value={settings.lineHeight} min={1.2} max={2.4} onChange={v => set('lineHeight', v)} fmt={v => v.toFixed(1)} />
            <Slider label="Letter Spacing" value={settings.letterSpacing} min={0} max={0.2} step={0.01} onChange={v => set('letterSpacing', v)} fmt={v => `${v.toFixed(2)}em`} />
            <Slider label="Word Spacing" value={settings.wordSpacing} min={0} max={0.5} step={0.05} onChange={v => set('wordSpacing', v)} fmt={v => `${v.toFixed(2)}em`} />
            <Toggle id="high-contrast"      label="High Contrast Mode"   value={settings.highContrast}      onChange={v => set('highContrast', v)} />
            <Toggle id="light-mode"         label="Light Mode"           value={settings.lightMode}         onChange={v => set('lightMode', v)} />
            <Toggle id="highlight-links"    label="Highlight Links"      value={settings.highlightLinks}    onChange={v => set('highlightLinks', v)} />
            <Toggle id="highlight-headings" label="Highlight Headings"   value={settings.highlightHeadings} onChange={v => set('highlightHeadings', v)} />
            <RadioGroup label="Saturation" value={settings.saturation}
              options={[{ v: 'normal', l: 'Normal' }, { v: 'low', l: 'Low' }, { v: 'grayscale', l: 'Gray' }]}
              onChange={v => set('saturation', v as A11ySettings['saturation'])} />
          </Section>

          <Section title="Reading">
            <Toggle id="reading-guide"  label="Reading Guide"         value={settings.readingGuide} onChange={v => set('readingGuide', v)} />
            <Toggle id="reading-mask"   label="Reading Mask"          value={settings.readingMask}  onChange={v => set('readingMask', v)} />
            <Toggle id="focus-mode"     label="Focus Mode (dim rest)" value={settings.focusMode}    onChange={v => set('focusMode', v)} />
            <Toggle id="dyslexia-font"  label="Dyslexia-Friendly Font"value={settings.dyslexiaFont} onChange={v => set('dyslexiaFont', v)} />
            <RadioGroup label="Text Align" value={settings.textAlign}
              options={[{ v: 'default', l: 'Default' }, { v: 'left', l: 'Left' }, { v: 'center', l: 'Center' }, { v: 'justify', l: 'Justify' }]}
              onChange={v => set('textAlign', v as A11ySettings['textAlign'])} />
          </Section>

          <Section title="Navigation & Motor">
            <Toggle id="keyboard-nav"     label="Keyboard Navigation"   value={settings.keyboardNav}    onChange={v => set('keyboardNav', v)} />
            <Toggle id="pause-animations" label="Pause Animations"      value={settings.pauseAnimations} onChange={v => set('pauseAnimations', v)} />
            <Toggle id="large-targets"    label="Large Click Targets"   value={settings.largeTargets}   onChange={v => set('largeTargets', v)} />
            <div style={{ fontSize: 11, color: 'var(--p-gray)', padding: '8px 0', borderTop: '1px solid var(--p-border)', marginTop: 4 }}>
              Sticky Keys: Enable in your OS accessibility settings (Windows: Settings → Ease of Access → Keyboard).
            </div>
          </Section>

          <Section title="Screen Reader">
            <Toggle id="tooltips" label="Glossary Tooltips (hover key terms)" value={settings.tooltips} onChange={v => set('tooltips', v)} />
            <div style={{ fontSize: 11, color: 'var(--p-gray)', lineHeight: 1.5, marginBottom: 8 }}>
              ARIA live announcements are active. Screen readers will be notified when lessons complete or navigation occurs.
            </div>
            <div style={{ fontSize: 11, color: 'var(--p-orange)' }}>
              <a href="#main-content" className="skip-nav" style={{ position: 'static', padding: 0, background: 'none', color: 'var(--p-orange)', textDecoration: 'underline', fontSize: 12 }}>
                Skip to content ↓
              </a>
            </div>
          </Section>

          <Section title="Cognitive">
            <Toggle id="reduce-cognitive" label="Reduce Cognitive Load" value={settings.reduceCognitive} onChange={v => set('reduceCognitive', v)} />
          </Section>

          <Section title="Language">
            <RadioGroup label="Interface Language" value={settings.language}
              options={[{ v: 'en', l: 'English' }, { v: 'es', l: 'Español' }, { v: 'fr', l: 'Français' }]}
              onChange={v => set('language', v as A11ySettings['language'])} />
            <div style={{ fontSize: 10, color: 'var(--p-muted)', lineHeight: 1.5 }}>
              Sets the lang attribute for screen reader pronunciation. Content translation requires browser translation tools.
            </div>
          </Section>
        </div>

        {/* Footer reset */}
        <div className="a11y-footer">
          <button
            onClick={resetAll}
            aria-label="Reset all accessibility settings"
            className="a11y-reset-btn"
          >
            Reset All Settings
          </button>
          
          <Link href="/accessibility-statement" className="a11y-statement-link" onClick={() => setOpen(false)}>
            Read our Accessibility Statement
          </Link>
        </div>
      </div>
    </>
  )
}
