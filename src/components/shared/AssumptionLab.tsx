'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, CheckCircle, BrainCircuit } from 'lucide-react'

interface AssumptionLabProps {
  title: string
  subtitle: string
  prompt: string
  scenario?: string // New prop for in-depth context
  placeholder?: string
  buttonText?: string
  onComplete?: (reflection: string) => void
  isCompleted?: boolean
  accentColor?: string
}

export function AssumptionLab({
  title,
  subtitle,
  prompt,
  scenario,
  placeholder = "Describe the shift here...",
  buttonText = "Complete Lab ✦",
  onComplete,
  isCompleted = false,
  accentColor = "#E8621A", // Default orange
}: AssumptionLabProps) {
  const [reflection, setReflection] = useState('')
  const [submitted, setSubmitted] = useState(isCompleted)

  const handleSubmit = () => {
    if (reflection.trim().length > 5) {
      setSubmitted(true)
      onComplete?.(reflection)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20,18,14,1) 0%, rgba(14,12,8,1) 100%)',
      border: `1px solid ${submitted ? accentColor : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 16,
      padding: '32px 40px',
      margin: '40px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        background: `${accentColor}11`,
        filter: 'blur(80px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, position: 'relative' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BrainCircuit size={16} color={accentColor} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: accentColor, textTransform: 'uppercase' }}>
              ASSUMPTION LAB
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", serif)', fontSize: 32, color: '#fff', letterSpacing: '0.04em', margin: 0 }}>
            {title}
          </h2>
          <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
            {subtitle}
          </p>
        </div>
        {submitted && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <CheckCircle size={32} color={accentColor} />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div style={{ position: 'relative' }}>
        {/* Scenario Box */}
        {scenario && !submitted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              borderLeft: `2px solid ${accentColor}`,
              padding: '16px 20px',
              marginBottom: 24,
              borderRadius: '0 8px 8px 0'
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
              CURRENT SCENARIO
            </span>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontStyle: 'italic' }}>
              {scenario}
            </p>
          </motion.div>
        )}

        {!submitted ? (
          <>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 24 }}>
              {prompt}
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                minHeight: 120,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: 16,
                color: '#fff',
                fontSize: 14,
                fontFamily: 'inherit',
                lineHeight: 1.5,
                outline: 'none',
                transition: 'border-color 0.2s',
                resize: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = accentColor}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                onClick={handleSubmit}
                disabled={reflection.trim().length <= 5}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  background: reflection.trim().length > 5 ? accentColor : 'rgba(255,255,255,0.05)',
                  color: reflection.trim().length > 5 ? '#fff' : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: reflection.trim().length > 5 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                {buttonText} <ArrowRight size={14} />
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: `1px solid ${accentColor}33` }}>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
              IDENTITY SHIFT RECORDED
            </p>
            <div style={{ fontSize: 15, color: '#fff', lineHeight: 1.6, fontStyle: 'italic', fontFamily: 'var(--font-cormorant, serif)' }}>
              "{reflection || 'Identity standard accepted.'}"
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
