import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { event, userEmail, userName } = await req.json()

    if (!event || !userEmail) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: superAdmins, error } = await adminClient
      .from('profiles')
      .select('email')
      .eq('is_super_admin', true)

    if (error || !superAdmins || superAdmins.length === 0) {
      return NextResponse.json({ error: 'No super admins found' }, { status: 500 })
    }

    // Resend allows sending to an array of up to 50 emails.
    const superAdminEmails = superAdmins.map((sa: { email: string }) => sa.email)

    const subject = event === 'signup' 
      ? `New User Signup: ${userName || userEmail}`
      : `User Login: ${userEmail}`

    const html = `
      <div style="font-family: monospace;">
        <h2>System Notification</h2>
        <p><strong>Event:</strong> ${event.toUpperCase()}</p>
        <p><strong>User Email:</strong> ${userEmail}</p>
        ${userName ? `<p><strong>User Name:</strong> ${userName}</p>` : ''}
        <p><strong>Date UTC:</strong> ${new Date().toISOString()}</p>
      </div>
    `

    // Send email to all super admins
    await sendEmail({
      to: superAdminEmails,
      subject,
      html
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/email/superadmin-notify]', err)
    return NextResponse.json({ error: 'Failed to notify superadmin' }, { status: 500 })
  }
}
