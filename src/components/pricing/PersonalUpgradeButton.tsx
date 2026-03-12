'use client'

import { useState } from 'react'
import { PersonalCheckoutModal } from '@/components/pricing/PersonalCheckoutModal'
import type { PersonalTier, PersonalBilling } from '@/components/pricing/PersonalCheckoutModal'

interface PersonalUpgradeButtonProps {
  tier:            PersonalTier
  initialBilling?: PersonalBilling
  className?:      string
  children:        React.ReactNode
}

/**
 * Drop-in button for any server or client component that needs to open
 * the personal checkout modal. Manages its own open/close state.
 */
export function PersonalUpgradeButton({
  tier,
  initialBilling = 'monthly',
  className,
  children,
}: PersonalUpgradeButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <PersonalCheckoutModal
        isOpen={open}
        onClose={() => setOpen(false)}
        initialTier={tier}
        initialBilling={initialBilling}
      />
    </>
  )
}
