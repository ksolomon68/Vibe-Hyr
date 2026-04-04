// lib/email/resend.ts
// Single Resend client + sendEmail helper used across all API routes.

import { Resend } from 'resend'

export interface SendEmailParams {
  to:      string | string[]
  subject: string
  html:    string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM = process.env.EMAIL_FROM ?? 'Vibe Hyr <noreply@vibehyr.com>'

  // Wrap resend call in a 10-second timeout to avoid function-wide 503s
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Email service timed out after 10s')), 10000)
  )

  const { data, error } = await Promise.race([
    resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    }),
    timeoutPromise
  ]) as { data: any, error: any }

  if (error) {
    console.error('[sendEmail] Resend error:', error)
    // We throw here but catch in the caller (actions.ts) to log and move on
    throw new Error(error.message)
  }

  return data
}
