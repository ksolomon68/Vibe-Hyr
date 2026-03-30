'use client'

import { useState, useTransition } from 'react'
import { removeUser } from './actions'

export function RemoveUserButton({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) {
  const [confirming, setConfirming]   = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const result = await removeUser(userId)
      if (result.error) {
        setError(result.error)
        setConfirming(false)
      }
      // On success the page revalidates and the row disappears
    })
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="font-mono text-[0.55rem] tracking-widest uppercase px-2.5 py-1 rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Removing…' : 'Confirm'}
        </button>
        <button
          onClick={() => { setConfirming(false); setError(null) }}
          disabled={isPending}
          className="font-mono text-[0.55rem] tracking-widest uppercase px-2.5 py-1 rounded border border-white/10 text-grey-dark hover:text-white transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        {error && (
          <span className="text-red-400 text-xs">{error}</span>
        )}
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Remove ${userName}`}
      className="font-mono text-[0.55rem] tracking-widest uppercase px-2.5 py-1 rounded border border-white/10 text-grey-dark hover:border-red-500/50 hover:text-red-400 transition-colors"
    >
      Remove
    </button>
  )
}
