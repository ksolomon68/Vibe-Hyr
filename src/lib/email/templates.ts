// lib/email/templates.ts
// Branded HTML email templates for all Vibe Hyr transactional emails.
// Uses inline styles for maximum email client compatibility.

// ─── Shared brand tokens ─────────────────────────────────────────────────────
const BG      = '#0E0C08'
const PANEL   = '#141008'
const CARD    = '#1E1610'
const BORDER  = '#2E2416'
const CREAM   = '#FAF9F6'
const ORANGE  = '#E8621A'
const GOLD    = '#C9A84C'
const INK     = '#1A1208'
const GREY    = '#8A7A6A'

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vibe Hyr</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:${BG};padding:32px 40px 28px;border-bottom:3px solid ${ORANGE};">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td>
                  <span style="font-size:22px;font-weight:900;letter-spacing:6px;color:${ORANGE};text-transform:uppercase;">VIBE</span><!--
                  --><span style="font-size:22px;font-weight:900;letter-spacing:6px;color:${CREAM};text-transform:uppercase;">HYR</span>
                  <span style="display:inline-block;width:6px;height:6px;background:${ORANGE};border-radius:50%;margin-left:4px;vertical-align:middle;"></span>
                </td>
                <td align="right">
                  <span style="font-size:9px;letter-spacing:3px;color:${BORDER};text-transform:uppercase;font-family:monospace;">Architecture of Reality</span>
                </td>
              </tr></table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:${CREAM};padding:48px 40px 40px;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:${PANEL};padding:24px 40px;border-top:1px solid ${BORDER};">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;color:${BORDER};text-transform:uppercase;text-align:center;font-family:monospace;">
                vibehyr.com · The Architecture of Reality
              </p>
              <p style="margin:0;font-size:9px;letter-spacing:1px;color:#2A2010;text-align:center;font-family:monospace;">
                You're receiving this because you have an account with Vibe Hyr.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Orange CTA button ────────────────────────────────────────────────────────
function ctaButton(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr>
      <td style="background:${ORANGE};padding:0;">
        <a href="${href}" style="display:inline-block;padding:16px 36px;font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#fff;text-decoration:none;font-family:monospace;">${label}</a>
      </td>
    </tr>
  </table>`
}

// ─── Divider ──────────────────────────────────────────────────────────────────
const divider = `<div style="height:1px;background:#E4DDD4;margin:28px 0;"></div>`

// ─── Heading ──────────────────────────────────────────────────────────────────
function heading(text: string): string {
  return `<h1 style="margin:0 0 12px;font-size:36px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:${INK};line-height:1.1;">${text}</h1>`
}

// ─── Eyebrow label ────────────────────────────────────────────────────────────
function eyebrow(text: string): string {
  return `<p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${ORANGE};font-family:monospace;">${text}</p>`
}

// ─── Body paragraph ───────────────────────────────────────────────────────────
function para(text: string, italic = false): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${GREY};${italic ? 'font-style:italic;' : ''}">${text}</p>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PASSWORD RESET
// ─────────────────────────────────────────────────────────────────────────────
export function passwordResetTemplate(resetLink: string): string {
  return wrap(`
    ${eyebrow('Password Reset')}
    ${heading('Reset Your Access')}
    ${divider}
    ${para('We received a request to reset the password for your Vibe Hyr account. Click the button below to choose a new password.')}
    ${para('This link is valid for <strong style="color:${INK}">60 minutes</strong> and can only be used once. If you did not request a password reset, you can safely ignore this email.')}
    ${ctaButton('Reset My Password', resetLink)}
    ${divider}
    <p style="margin:0;font-size:12px;color:#B0A090;line-height:1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="font-family:monospace;font-size:11px;color:${ORANGE};word-break:break-all;">${resetLink}</span>
    </p>
    <p style="margin:20px 0 0;font-size:12px;color:#B0A090;font-style:italic;">
      "Revision is the beginning of miracles." — Neville Goddard
    </p>
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. WELCOME (free signup)
// ─────────────────────────────────────────────────────────────────────────────
export function welcomeFreeTemplate(name: string, dashboardUrl: string): string {
  const first = name?.split(' ')[0] || 'Architect'
  return wrap(`
    ${eyebrow('Welcome to Vibe Hyr')}
    ${heading(`Welcome,<br/><span style="color:${ORANGE};">${first.toUpperCase()}.</span>`)}
    ${divider}
    ${para(`Your Seeker account is ready. You now have free access to <strong style="color:${INK};">Course 1: Programming the Gatekeeper</strong> — the foundation of everything.`)}
    ${para("Here\u2019s what you can do right now:")}
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${['Start Course 1 for free', 'Explore the Identity Audit Mini', 'Access your member dashboard', 'Join the community (read access)'].map(item => `
      <tr>
        <td style="padding:4px 0;vertical-align:top;">
          <span style="display:inline-block;width:8px;height:8px;background:${ORANGE};border-radius:50%;margin-right:10px;margin-top:5px;"></span>
        </td>
        <td style="padding:4px 0;font-size:14px;color:${GREY};">${item}</td>
      </tr>`).join('')}
    </table>
    ${ctaButton('Go to My Dashboard', dashboardUrl)}
    ${divider}
    <p style="margin:0;font-size:12px;color:#B0A090;font-style:italic;">
      "Assume the feeling of your wish fulfilled." — Neville Goddard
    </p>
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. WELCOME (paid plan)
// ─────────────────────────────────────────────────────────────────────────────
export function welcomePaidTemplate(name: string, tier: string, dashboardUrl: string): string {
  const first     = name?.split(' ')[0] || 'Architect'
  const tierLabel = tier === 'reality-master' ? 'REALITY MASTER' : tier.toUpperCase()
  const features  = tier === 'reality-master'
    ? ['All 4 courses (including Course 4: Echo Theory)', 'Full Assumption Lab simulator', 'Monthly live Q&A with host', 'Full SATS audio library (7 nights)', 'Priority community badge']
    : ['Courses 1, 2 & 3 (full access)', 'Daily Revision Journal (full)', 'SATS Mastery Diagnostic', 'Community full posting + DMs', 'SATS audio library (3 sessions)']

  return wrap(`
    ${eyebrow(`${tierLabel} Member`)}
    ${heading(`You're In,<br/><span style="color:${ORANGE};">${first.toUpperCase()}.</span>`)}
    ${divider}
    ${para(`Your <strong style="color:${INK};">${tierLabel}</strong> membership is now active. Everything is unlocked and waiting for you.`)}
    ${para('Your plan includes:')}
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${features.map(item => `
      <tr>
        <td style="padding:4px 0;vertical-align:top;">
          <span style="display:inline-block;width:8px;height:8px;background:${ORANGE};border-radius:50%;margin-right:10px;margin-top:5px;"></span>
        </td>
        <td style="padding:4px 0;font-size:14px;color:${GREY};">${item}</td>
      </tr>`).join('')}
    </table>
    ${ctaButton('Start Building Your Reality', dashboardUrl)}
    ${divider}
    <p style="margin:0;font-size:12px;color:#B0A090;font-style:italic;">
      "You have free will to choose the state you will occupy, but no free will to change the events that state yields." — Neville Goddard
    </p>
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PAYMENT FAILED
// ─────────────────────────────────────────────────────────────────────────────
export function paymentFailedTemplate(name: string, tierLabel: string, updatePaymentUrl: string): string {
  const first = name?.split(' ')[0] || 'Member'
  return wrap(`
    ${eyebrow('Action Required')}
    ${heading('Payment Unsuccessful')}
    ${divider}
    ${para(`Hi ${first}, we were unable to process your payment for your <strong style="color:${INK};">${tierLabel}</strong> subscription.`)}
    ${para('Your access is still active right now — Stripe will automatically retry the payment over the next few days. To avoid any interruption, please update your payment method below.')}
    ${ctaButton('Update Payment Method', updatePaymentUrl)}
    ${divider}
    ${para('If you need help, reply to this email and we\'ll sort it out together.', true)}
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SUBSCRIPTION CANCELLED
// ─────────────────────────────────────────────────────────────────────────────
export function subscriptionCancelledTemplate(name: string, tierLabel: string, resubscribeUrl: string): string {
  const first = name?.split(' ')[0] || 'Member'
  return wrap(`
    ${eyebrow('Subscription Update')}
    ${heading('We\'ll Miss You.')}
    ${divider}
    ${para(`Hi ${first}, your <strong style="color:${INK};">${tierLabel}</strong> subscription has been cancelled. Your access will remain active until the end of your current billing period.`)}
    ${para('After that, your account will revert to the free Seeker tier — you\'ll still have access to Course 1 and your journal history.')}
    ${para('If this was a mistake, or if you\'d like to come back when you\'re ready:')}
    ${ctaButton('Reactivate My Membership', resubscribeUrl)}
    ${divider}
    ${para('"The state you were in when you made this revision is the state you\'ll find yourself in tomorrow." We\'re here when you\'re ready to build again.', true)}
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. EMAIL VERIFICATION (sent from our API as a branded alternative)
// ─────────────────────────────────────────────────────────────────────────────
export function emailVerificationTemplate(name: string, verifyLink: string): string {
  const first = name?.split(' ')[0] || 'Architect'
  return wrap(`
    ${eyebrow('Verify Your Account')}
    ${heading(`Almost There,<br/><span style="color:${ORANGE};">${first.toUpperCase()}.</span>`)}
    ${divider}
    ${para('Confirm your email address to activate your Vibe Hyr account and begin your journey.')}
    ${para('This link expires in <strong style="color:${INK};">24 hours</strong>.')}
    ${ctaButton('Verify My Email', verifyLink)}
    ${divider}
    <p style="margin:0;font-size:12px;color:#B0A090;line-height:1.6;">
      If the button doesn't work, paste this link into your browser:<br/>
      <span style="font-family:monospace;font-size:11px;color:${ORANGE};word-break:break-all;">${verifyLink}</span>
    </p>
    <p style="margin:20px 0 0;font-size:12px;color:#B0A090;font-style:italic;">
      "Assume the feeling of your wish fulfilled." — Neville Goddard
    </p>
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TRACK COMPLETION (Workplace Training Series)
// ─────────────────────────────────────────────────────────────────────────────
export function trackCompleteTemplate(name: string, trackName: string, trackNumber: string, dashboardUrl: string): string {
  const first = name?.split(' ')[0] || 'Member'
  return wrap(`
    ${eyebrow(`Track ${trackNumber} Complete`)}
    ${heading(`You Did It,<br/><span style="color:${ORANGE};">${first.toUpperCase()}.</span>`)}
    ${divider}
    ${para(`Congratulations — you've completed <strong style="color:${INK};">Track ${trackNumber}: ${trackName}</strong> of the Workplace Training Series.`)}
    ${para('Every track you finish is another layer of your professional reality, architected. Your certificate has been recorded to your profile.')}
    <table cellpadding="0" cellspacing="0" style="margin:0 0 8px;background:${CARD};border-left:4px solid ${ORANGE};width:100%;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${ORANGE};font-family:monospace;">Achievement Unlocked</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:${CREAM};">Track ${trackNumber}: ${trackName}</p>
          <p style="margin:4px 0 0;font-size:12px;color:${GREY};">Vibe Hyr Workplace Training Series</p>
        </td>
      </tr>
    </table>
    ${ctaButton('Continue to Next Track', dashboardUrl)}
    ${divider}
    ${para('"The world is yourself pushed out. Change yourself and the world changes accordingly." Keep building.', true)}
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. INSTITUTION INVITE
// ─────────────────────────────────────────────────────────────────────────────
export function institutionInviteTemplate(
  name: string,
  orgName: string,
  role: string,
  setupUrl: string
): string {
  const first     = name?.split(' ')[0] || 'Member'
  const roleLabel = role === 'educator' ? 'Educator' : role === 'leader' ? 'Leader' : 'Team Member'
  return wrap(`
    ${eyebrow(`${orgName} · Vibe Hyr`)}
    ${heading(`You've Been<br/><span style="color:${ORANGE};">Invited.</span>`)}
    ${divider}
    ${para(`Hi ${first}, you've been invited to join <strong style="color:${INK};">${orgName}</strong> on the Vibe Hyr platform as a <strong style="color:${INK};">${roleLabel}</strong>.`)}
    ${para('Vibe Hyr is a professional development platform built on identity-level transformation — helping individuals and teams govern their external results from the inside out.')}
    ${para('Click the button below to set your password and access your account:')}
    ${ctaButton('Accept Invitation', setupUrl)}
    ${divider}
    <p style="margin:0 0 12px;font-size:12px;color:#B0A090;line-height:1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="font-family:monospace;font-size:11px;color:${ORANGE};word-break:break-all;">${setupUrl}</span>
    </p>
    <p style="margin:0;font-size:12px;color:#B0A090;font-style:italic;">
      "Assume the feeling of your wish fulfilled." — Neville Goddard
    </p>
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. BYPASS / ADMIN-CREATED USER WELCOME
// ─────────────────────────────────────────────────────────────────────────────
export function bypassWelcomeTemplate(
  name: string,
  tier: string,
  setupUrl: string
): string {
  const first     = name?.split(' ')[0] || 'Member'
  const tierLabel = tier === 'elite' ? 'Reality Master' : tier === 'architect' ? 'Architect' : 'Seeker'
  return wrap(`
    ${eyebrow('Welcome to Vibe Hyr')}
    ${heading(`Your Account<br/><span style="color:${ORANGE};">Is Ready.</span>`)}
    ${divider}
    ${para(`Hi ${first}, your Vibe Hyr account has been created with <strong style="color:${INK};">${tierLabel}</strong> access.`)}
    ${para('Your account is active and waiting for you. Click below to set your password and begin:')}
    ${ctaButton('Set Password & Log In', setupUrl)}
    ${divider}
    <p style="margin:0 0 12px;font-size:12px;color:#B0A090;line-height:1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="font-family:monospace;font-size:11px;color:${ORANGE};word-break:break-all;">${setupUrl}</span>
    </p>
    <p style="margin:0;font-size:12px;color:#B0A090;font-style:italic;">
      "You have free will to choose the state you will occupy." — Neville Goddard
    </p>
  `)
}
