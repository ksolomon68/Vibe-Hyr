'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Profile } from '@/types'

export default function AccountSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  // Form state — institution_type and membership_tier are read-only (set by admin/billing)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    institution_type: 'individual' as 'individual' | 'education' | 'business',
    membership_tier: 'free' as 'free' | 'architect' | 'elite'
  })

  useEffect(() => {
    const supabase = createClient()

    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth/login')
        return
      }

      // Load profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error loading profile:', error)
            setMessage('Error loading profile')
          } else if (data) {
            setProfile(data)
            setFormData({
              full_name: data.full_name || '',
              email: session.user.email || '',
              institution_type: data.institution_type || 'individual',
              membership_tier: data.membership_tier || 'free'
            })
          }
          setLoading(false)
        })
    })
  }, [router])

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    setMessage('')

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
        })
        .eq('id', profile.id)

      if (error) throw error

      setMessage('Profile updated successfully!')
      setProfile(prev => prev ? { ...prev, ...formData } : null)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Error updating profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-[68px] min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-[68px] pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-14">

          {/* Header */}
          <div className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
              Account Settings
            </h1>
            <p className="text-grey-DEFAULT text-lg">
              Manage your profile, preferences, and account information.
            </p>
          </div>

          {/* Profile Settings */}
          <div className="bg-black-3 border border-white/5 rounded-xl p-8 mb-8">
            <h2 className="font-display text-2xl text-white mb-6">Profile Information</h2>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-900/20 border border-red-500/30 text-red-400' : 'bg-green-900/20 border border-green-500/30 text-green-400'}`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-grey-DEFAULT mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-black-2 border border-white/10 rounded-lg text-white placeholder-grey-dark focus:border-orange focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-DEFAULT mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-black-2 border border-white/10 rounded-lg text-grey-dark cursor-not-allowed"
                />
                <p className="text-xs text-grey-dark mt-1">
                  Email cannot be changed here. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-DEFAULT mb-2">
                  Account Type
                </label>
                <div className="w-full px-4 py-3 bg-black-2 border border-white/10 rounded-lg text-grey-dark capitalize">
                  {formData.institution_type}
                </div>
                <p className="text-xs text-grey-dark mt-1">
                  Account type is assigned by your organization administrator.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-DEFAULT mb-2">
                  Membership Tier
                </label>
                <div className="w-full px-4 py-3 bg-black-2 border border-white/10 rounded-lg text-grey-dark">
                  {formData.membership_tier === 'free' ? 'Seeker (Free)' : formData.membership_tier === 'architect' ? 'Architect ($19/mo)' : 'Reality Master ($29/mo)'}
                </div>
                <p className="text-xs text-grey-dark mt-1">
                  Tier changes are managed through billing.
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-orange px-6 py-3 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-black-3 border border-white/5 rounded-xl p-8">
            <h2 className="font-display text-2xl text-white mb-6">Account Actions</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black-2 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Sign Out</h3>
                  <p className="text-grey-DEFAULT text-sm">Sign out of your account on this device</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 border border-white/20 text-white rounded-lg hover:border-white/40 transition-colors"
                >
                  Sign Out
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-black-2 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Billing & Subscription</h3>
                  <p className="text-grey-DEFAULT text-sm">Manage your subscription and billing information</p>
                </div>
                <a
                  href="/pricing"
                  className="px-4 py-2 border border-orange text-orange rounded-lg hover:bg-orange hover:text-black transition-colors"
                >
                  Manage
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}