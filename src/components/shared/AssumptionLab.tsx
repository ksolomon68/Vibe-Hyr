'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, BrainCircuit, Edit3, Loader2, BookMarked } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AssumptionLabProps {
  title: string
  subtitle: string
  prompt: string
  scenario?: string
  placeholder?: string
  buttonText?: string
  onComplete?: (reflection: string) => void
  isCompleted?: boolean
  accentColor?: string
  storageKey?: string
}

function toStorageSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function AssumptionLab({
  title,
  subtitle,
  prompt,
  scenario,
  placeholder = 'Describe your identity and behavioral shift here...',
  buttonText = 'Complete Lab ✦',
  onComplete,
  isCompleted = false,
  accentColor = '#E8621A',
  storageKey,
}: AssumptionLabProps) {
  const labId = `lab:${storageKey || toStorageSlug(title)}`
  const localKey = `vibehyr_${labId}`

  const [reflection, setReflection] = useState('')
  const [submitted, setSubmitted] = useState(isCompleted)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedToCloud, setSavedToCloud] = useState(false)

  // Hydrate saved reflection from localStorage + Supabase lesson_notes (`lab:<slug>`)
  useEffect(() => {
    let active = true
    setSubmitted(isCompleted)
    setIsEditing(false)
    setSavedToCloud(false)

    // 1. Instant local hydration
    if (typeof window !== 'undefined') {
      const cached = window.localStorage.getItem(localKey)
      if (cached && cached.trim().length > 5) {
        setReflection(cached)
        setSubmitted(true)
      } else {
        setReflection('')
      }
    }

    // 2. Supabase hydration for authenticated users
    async function loadFromSupabase() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !active) return

        const { data } = await supabase
          .from('lesson_notes')
          .select('content')
          .eq('user_id', user.id)
          .eq('lesson_id', labId)
          .maybeSingle()

        if (active && data?.content && data.content.trim().length > 5) {
          setReflection(data.content)
          setSubmitted(true)
          setSavedToCloud(true)
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(localKey, data.content)
          }
        }
      } catch {
        // Ignore network/guest errors; localStorage fallback remains active
      }
    }

    loadFromSupabase()
    return () => {
      active = false
    }
  }, [labId, localKey, isCompleted])

  const handleSubmit = async () => {
    const trimmed = reflection.trim()
    if (trimmed.length <= 5) return

    setSaving(true)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(localKey, trimmed)
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('lesson_notes')
          .upsert(
            {
              user_id: user.id,
              lesson_id: labId,
              content: trimmed,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,lesson_id' }
          )
        setSavedToCloud(true)
      }
    } catch {
      // Guest or offline: localStorage still persisted
    }

    setSaving(false)
    setSubmitted(true)
    setIsEditing(false)
    onComplete?.(trimmed)
  }

  const showForm = !submitted || isEditing

  return (
    <div
      id="section-lab"
      style={{
        background: 'linear-gradient(135deg, rgba(20,18,14,1) 0%, rgba(14,12,8,1) 100%)',
        border: `1px solid ${submitted && !isEditing ? accentColor : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16,
        padding: '32px 36px',
        margin: '40px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          background: `${accentColor}14`,
          filter: 'blur(80px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
          position: 'relative',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BrainCircuit size={16} color={accentColor} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.22em',
                color: accentColor,
                textTransform: 'uppercase',
              }}
            >
              ASSUMPTION LAB · INTERACTIVE REPROGRAMMING
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-bebas, "Bebas Neue", serif)',
              fontSize: 32,
              color: '#fff',
              letterSpacing: '0.04em',
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontStyle: 'italic',
              fontSize: 18,
              color: 'rgba(255,255,255,0.55)',
              margin: '4px 0 0',
            }}
          >
            {subtitle}
          </p>
        </div>

        {submitted && !isEditing && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: accentColor,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <BookMarked size={12} /> {savedToCloud ? 'Saved to Account' : 'Saved'}
            </span>
            <CheckCircle size={26} color={accentColor} />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div style={{ position: 'relative' }}>
        {/* Scenario Box — always visible for context */}
        {scenario && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderLeft: `3px solid ${accentColor}`,
              padding: '16px 20px',
              marginBottom: 22,
              borderRadius: '0 8px 8px 0',
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase',
                marginBottom: 6,
                display: 'block',
              }}
            >
              CURRENT 3D SCENARIO
            </span>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                color: 'rgba(255,255,255,0.88)',
                lineHeight: 1.65,
                fontStyle: 'italic',
              }}
            >
              {scenario}
            </p>
          </motion.div>
        )}

        {showForm ? (
          <>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                color: 'rgba(255,255,255,0.78)',
                lineHeight: 1.65,
                marginBottom: 18,
              }}
            >
              {prompt}
            </label>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                minHeight: 130,
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: 16,
                color: '#fff',
                fontSize: 15,
                fontFamily: 'inherit',
                lineHeight: 1.6,
                outline: 'none',
                transition: 'border-color 0.2s',
                resize: 'vertical',
              }}
              onFocus={e => (e.target.style.borderColor = accentColor)}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                Your response is automatically saved to your personal lab record.
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      padding: '10px 18px',
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={reflection.trim().length <= 5 || saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 24px',
                    background:
                      reflection.trim().length > 5 ? accentColor : 'rgba(255,255,255,0.05)',
                    color: reflection.trim().length > 5 ? '#fff' : 'rgba(255,255,255,0.3)',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: reflection.trim().length > 5 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Update Lab ✦' : buttonText} <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '20px 24px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 12,
              border: `1px solid ${accentColor}44`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
                gap: 12,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  color: accentColor,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                RECORDED IDENTITY &amp; ASSUMPTION SHIFT
              </p>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                <Edit3 size={11} /> Edit Response
              </button>
            </div>
            <div
              style={{
                fontSize: 16,
                color: '#fff',
                lineHeight: 1.7,
                fontStyle: 'italic',
                fontFamily: 'var(--font-cormorant, serif)',
                whiteSpace: 'pre-line',
              }}
            >
              &ldquo;{reflection || 'Identity standard accepted.'}&rdquo;
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
