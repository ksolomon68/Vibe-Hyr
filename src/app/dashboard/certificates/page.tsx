// src/app/dashboard/certificates/page.tsx
// Authenticated member view: all earned certificates

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CertificateDashboard } from '@/components/certificates/CertificateDashboard'

export const metadata = {
  title: 'My Certificates — Vibe Hyr',
  description: 'Download and share your Vibe Hyr course completion certificates.',
}

export default async function CertificatesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: certificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false })

  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen" style={{ background: '#0a0a0a' }}>
        <CertificateDashboard certificates={certificates ?? []} />
      </main>
      <Footer />
    </>
  )
}
