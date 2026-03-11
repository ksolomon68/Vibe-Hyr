'use client'

interface PlayerProgressBarsProps {
  /** Label for bar 1 e.g. "COURSE" | "PROGRAM" | "TRACK" */
  itemLabel: string
  currentCompleted: number
  currentTotal: number
  overallPct: number
}

export function PlayerProgressBars({
  itemLabel,
  currentCompleted,
  currentTotal,
  overallPct,
}: PlayerProgressBarsProps) {
  const pct1 = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0
  const pct2 = Math.min(100, Math.max(0, Math.round(overallPct)))

  const barRow = (label: string, pct: number, right: React.ReactNode, thick = true) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 9, letterSpacing: '0.12em', fontWeight: 700, color: 'var(--p-muted)', minWidth: 72, textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: thick ? 4 : 2, background: 'var(--p-border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height:     '100%',
          width:      `${pct}%`,
          background: thick ? 'var(--p-orange)' : 'linear-gradient(90deg, var(--p-orange), var(--p-gold))',
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{ fontSize: 10, color: 'var(--p-gray)', fontWeight: 600, minWidth: 40, textAlign: 'right' }}>
        {right}
      </span>
    </div>
  )

  return (
    <div style={{ marginBottom: 24 }}>
      {barRow(`This ${itemLabel}`, pct1, `${currentCompleted}/${currentTotal}`, true)}
      <div style={{ height: 8 }} />
      {barRow('Overall', pct2, `${pct2}%`, false)}
    </div>
  )
}
