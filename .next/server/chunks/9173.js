"use strict";exports.id=9173,exports.ids=[9173],exports.modules={77330:(e,t,o)=>{o.d(t,{C:()=>i});var r=o(82591);async function i({to:e,subject:t,html:o}){let i=new r.Resend(process.env.RESEND_API_KEY),n=process.env.EMAIL_FROM??"Vibe Hyr <noreply@vibehyr.com>",s=new Promise((e,t)=>setTimeout(()=>t(Error("Email service timed out after 10s")),1e4)),{data:a,error:l}=await Promise.race([i.emails.send({from:n,to:e,subject:t,html:o}),s]);if(l)throw console.error("[sendEmail] Resend error:",l),Error(l.message);return a}},53768:(e,t,o)=>{o.d(t,{CS:()=>$,D_:()=>m,GZ:()=>f,T1:()=>b,XL:()=>h,eV:()=>x,wA:()=>w});let r="#0E0C08",i="#2E2416",n="#FAF9F6",s="#E8621A",a="#1A1208",l="#8A7A6A";function p(e){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vibe Hyr</title>
</head>
<body style="margin:0;padding:0;background:${r};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${r};min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:${r};padding:32px 40px 28px;border-bottom:3px solid ${s};">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td>
                  <span style="font-size:22px;font-weight:900;letter-spacing:6px;color:${s};text-transform:uppercase;">VIBE</span><!--
                  --><span style="font-size:22px;font-weight:900;letter-spacing:6px;color:${n};text-transform:uppercase;">HYR</span>
                  <span style="display:inline-block;width:6px;height:6px;background:${s};border-radius:50%;margin-left:4px;vertical-align:middle;"></span>
                </td>
                <td align="right">
                  <span style="font-size:9px;letter-spacing:3px;color:${i};text-transform:uppercase;font-family:monospace;">Architecture of Reality</span>
                </td>
              </tr></table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:${n};padding:48px 40px 40px;">
              ${e}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#141008;padding:24px 40px;border-top:1px solid ${i};">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;color:${i};text-transform:uppercase;text-align:center;font-family:monospace;">
                vibehyr.com \xb7 The Architecture of Reality
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
</html>`}function c(e,t){return`<table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr>
      <td style="background:${s};padding:0;">
        <a href="${t}" style="display:inline-block;padding:16px 36px;font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#fff;text-decoration:none;font-family:monospace;">${e}</a>
      </td>
    </tr>
  </table>`}let d='<div style="height:1px;background:#E4DDD4;margin:28px 0;"></div>';function u(e){return`<h1 style="margin:0 0 12px;font-size:36px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:${a};line-height:1.1;">${e}</h1>`}function y(e){return`<p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${s};font-family:monospace;">${e}</p>`}function g(e,t=!1){return`<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${l};${t?"font-style:italic;":""}">${e}</p>`}function h(e){return p(`
    ${y("Password Reset")}
    ${u("Reset Your Access")}
    ${d}
    ${g("We received a request to reset the password for your Vibe Hyr account. Click the button below to choose a new password.")}
    ${g('This link is valid for <strong style="color:${INK}">60 minutes</strong> and can only be used once. If you did not request a password reset, you can safely ignore this email.')}
    ${c("Reset My Password",e)}
    ${d}
    <p style="margin:0;font-size:12px;color:#B0A090;line-height:1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="font-family:monospace;font-size:11px;color:${s};word-break:break-all;">${e}</span>
    </p>
    <p style="margin:20px 0 0;font-size:12px;color:#B0A090;font-style:italic;">
      "Revision is the beginning of miracles." — Neville Goddard
    </p>
  `)}function f(e,t){let o=e?.split(" ")[0]||"Architect";return p(`
    ${y("Welcome to Vibe Hyr")}
    ${u(`Welcome,<br/><span style="color:${s};">${o.toUpperCase()}.</span>`)}
    ${d}
    ${g(`Your Seeker account is ready. You now have free access to <strong style="color:${a};">Course 1: Programming the Gatekeeper</strong> — the foundation of everything.`)}
    ${g("Here’s what you can do right now:")}
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${["Start Course 1 for free","Explore the Identity Audit Mini","Access your member dashboard","Join the community (read access)"].map(e=>`
      <tr>
        <td style="padding:4px 0;vertical-align:top;">
          <span style="display:inline-block;width:8px;height:8px;background:${s};border-radius:50%;margin-right:10px;margin-top:5px;"></span>
        </td>
        <td style="padding:4px 0;font-size:14px;color:${l};">${e}</td>
      </tr>`).join("")}
    </table>
    ${c("Go to My Dashboard",t)}
    ${d}
    <p style="margin:0;font-size:12px;color:#B0A090;font-style:italic;">
      "Assume the feeling of your wish fulfilled." — Neville Goddard
    </p>
  `)}function m(e,t,o){let r=e?.split(" ")[0]||"Architect",i="reality-master"===t?"REALITY MASTER":t.toUpperCase();return p(`
    ${y(`${i} Member`)}
    ${u(`You're In,<br/><span style="color:${s};">${r.toUpperCase()}.</span>`)}
    ${d}
    ${g(`Your <strong style="color:${a};">${i}</strong> membership is now active. Everything is unlocked and waiting for you.`)}
    ${g("Your plan includes:")}
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${("reality-master"===t?["All 4 courses (including Course 4: Echo Theory)","Full Assumption Lab simulator","Monthly live Q&A with host","Full SATS audio library (7 nights)","Priority community badge"]:["Courses 1, 2 & 3 (full access)","Daily Revision Journal (full)","SATS Mastery Diagnostic","Community full posting + DMs","SATS audio library (3 sessions)"]).map(e=>`
      <tr>
        <td style="padding:4px 0;vertical-align:top;">
          <span style="display:inline-block;width:8px;height:8px;background:${s};border-radius:50%;margin-right:10px;margin-top:5px;"></span>
        </td>
        <td style="padding:4px 0;font-size:14px;color:${l};">${e}</td>
      </tr>`).join("")}
    </table>
    ${c("Start Building Your Reality",o)}
    ${d}
    <p style="margin:0;font-size:12px;color:#B0A090;font-style:italic;">
      "You have free will to choose the state you will occupy, but no free will to change the events that state yields." — Neville Goddard
    </p>
  `)}function $(e,t,o){let r=e?.split(" ")[0]||"Member";return p(`
    ${y("Action Required")}
    ${u("Payment Unsuccessful")}
    ${d}
    ${g(`Hi ${r}, we were unable to process your payment for your <strong style="color:${a};">${t}</strong> subscription.`)}
    ${g("Your access is still active right now — Stripe will automatically retry the payment over the next few days. To avoid any interruption, please update your payment method below.")}
    ${c("Update Payment Method",o)}
    ${d}
    ${g("If you need help, reply to this email and we'll sort it out together.",!0)}
  `)}function x(e,t,o){let r=e?.split(" ")[0]||"Member";return p(`
    ${y("Subscription Update")}
    ${u("We'll Miss You.")}
    ${d}
    ${g(`Hi ${r}, your <strong style="color:${a};">${t}</strong> subscription has been cancelled. Your access will remain active until the end of your current billing period.`)}
    ${g("After that, your account will revert to the free Seeker tier — you'll still have access to Course 1 and your journal history.")}
    ${g("If this was a mistake, or if you'd like to come back when you're ready:")}
    ${c("Reactivate My Membership",o)}
    ${d}
    ${g("\"The state you were in when you made this revision is the state you'll find yourself in tomorrow.\" We're here when you're ready to build again.",!0)}
  `)}function b(e,t,o,r){let i=e?.split(" ")[0]||"Member";return p(`
    ${y(`Track ${o} Complete`)}
    ${u(`You Did It,<br/><span style="color:${s};">${i.toUpperCase()}.</span>`)}
    ${d}
    ${g(`Congratulations — you've completed <strong style="color:${a};">Track ${o}: ${t}</strong> of the Workplace Training Series.`)}
    ${g("Every track you finish is another layer of your professional reality, architected. Your certificate has been recorded to your profile.")}
    <table cellpadding="0" cellspacing="0" style="margin:0 0 8px;background:#1E1610;border-left:4px solid ${s};width:100%;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${s};font-family:monospace;">Achievement Unlocked</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:${n};">Track ${o}: ${t}</p>
          <p style="margin:4px 0 0;font-size:12px;color:${l};">Vibe Hyr Workplace Training Series</p>
        </td>
      </tr>
    </table>
    ${c("Continue to Next Track",r)}
    ${d}
    ${g('"The world is yourself pushed out. Change yourself and the world changes accordingly." Keep building.',!0)}
  `)}function w(e,t,o,r,i=[]){let n=e?.split(" ")[0]||"Member",h=i.length>0?`${d}
      <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${s};font-family:monospace;">Your Enrolled Courses</p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 4px;width:100%;">
        ${i.map(e=>`
        <tr>
          <td style="padding:6px 0;vertical-align:top;">
            <span style="display:inline-block;width:8px;height:8px;background:${s};border-radius:50%;margin-right:10px;margin-top:4px;vertical-align:middle;"></span>
            <span style="font-size:14px;color:${l};">${e}</span>
          </td>
        </tr>`).join("")}
      </table>`:"";return p(`
    ${y(`${t} \xb7 Vibe Hyr`)}
    ${u(`You've Been<br/><span style="color:${s};">Invited.</span>`)}
    ${d}
    ${g(`Hi ${n}, you've been invited to join <strong style="color:${a};">${t}</strong> on the Vibe Hyr platform as a <strong style="color:${a};">${"educator"===o?"Educator":"leader"===o?"Leader":"Team Member"}</strong>.`)}
    ${g("Vibe Hyr is a professional development platform built on identity-level transformation — helping individuals and teams govern their external results from the inside out.")}
    ${g("Click the button below to set your password and access your assigned courses:")}
    ${h}
    ${c("Set Up Your Account",r)}
    ${d}
    <p style="margin:0 0 12px;font-size:12px;color:#B0A090;line-height:1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="font-family:monospace;font-size:11px;color:${s};word-break:break-all;">${r}</span>
    </p>
    <p style="margin:0;font-size:12px;color:#B0A090;font-style:italic;">
      "Assume the feeling of your wish fulfilled." — Neville Goddard
    </p>
  `)}}};