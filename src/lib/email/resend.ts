// lib/email/resend.ts
// Single Resend client + sendEmail helper used across all API routes.

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'Vibe Hyr <noreply@vibehyr.com>'

export interface SendEmailParams {
  to:      string | string[]
  subject: string
  html:    string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('[sendEmail] Resend error:', error)
    throw new Error(error.message)
  }

  return data
}
