'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { inviteUser } from './actions'

type Props = {
  orgType: 'education' | 'business'
  seatsUsed: number
  seatsPurchased: number
}

const ROLE_OPTIONS = {
  education: [
    { value: 'educator', label: 'Educator' },
    { value: 'admin',    label: 'Admin' },
  ],
  business: [
    { value: 'business', label: 'Team Member' },
    { value: 'admin',    label: 'Admin' },
  ],
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-orange px-5 py-2.5 disabled:opacity-50 whitespace-nowrap"
    >
      {pending ? 'Sending…' : 'Send Invite'}
    </button>
  )
}

export function InviteUserForm({ orgType, seatsUsed, seatsPurchased }: Props) {
  const [state, formAction] = useFormState(inviteUser, null)
  const atLimit = seatsUsed >= seatsPurchased

  return (
    <div className="bg-black-3 border border-white/5 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl text-white">Invite User</h2>
          <p className="text-grey-dark text-sm mt-0.5">
            {seatsUsed} / {seatsPurchased} seats used
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded border font-mono text-[0.6rem] tracking-widest uppercase ${
          atLimit
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-green-500/10 border-green-500/30 text-green-400'
        }`}>
          {atLimit ? 'Limit Reached' : `${seatsPurchased - seatsUsed} seats available`}
        </div>
      </div>

      {atLimit ? (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          Your organization has reached its seat limit ({seatsPurchased} seats). Contact support or upgrade your plan to add more users.
        </p>
      ) : (
        <form action={formAction} className="flex flex-col sm:flex-row gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="flex-1 px-4 py-2.5 bg-black-2 border border-white/10 rounded-lg text-white placeholder-grey-dark focus:border-orange focus:outline-none text-sm"
          />
          <select
            name="role"
            required
            className="px-4 py-2.5 bg-black-2 border border-white/10 rounded-lg text-white focus:border-orange focus:outline-none text-sm min-w-[160px]"
          >
            <option value="">Select role…</option>
            {ROLE_OPTIONS[orgType].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <SubmitButton />
        </form>
      )}

      {state?.error && (
        <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
          Invite sent to <strong>{state.email}</strong>. They&apos;ll receive an email to set up their account.
        </p>
      )}
    </div>
  )
}
