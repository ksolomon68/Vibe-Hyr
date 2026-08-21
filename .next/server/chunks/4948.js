"use strict";exports.id=4948,exports.ids=[4948],exports.modules={9495:(e,t,o)=>{o.d(t,{C:()=>n});var r=o(60727);async function n({to:e,subject:t,html:o}){let n=new r.R(process.env.RESEND_API_KEY),i=process.env.EMAIL_FROM??"Vibe Hyr <noreply@vibehyr.com>",s=new Promise((e,t)=>setTimeout(()=>t(Error("Email service timed out after 10s")),1e4)),{data:a,error:l}=await Promise.race([n.emails.send({from:i,to:e,subject:t,html:o}),s]);if(l)throw console.error("[sendEmail] Resend error:",l),Error(l.message);return a}},29228:(e,t,o)=>{o.d(t,{Iv:()=>h,XL:()=>f,wA:()=>m});let r="#0E0C08",n="#2E2416",i="#FAF9F6",s="#E8621A",a="#1A1208",l="#8A7A6A";function p(e){return`<!DOCTYPE html>
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
                  --><span style="font-size:22px;font-weight:900;letter-spacing:6px;color:${i};text-transform:uppercase;">HYR</span>
                  <span style="display:inline-block;width:6px;height:6px;background:${s};border-radius:50%;margin-left:4px;vertical-align:middle;"></span>
                </td>
                <td align="right">
                  <span style="font-size:9px;letter-spacing:3px;color:${n};text-transform:uppercase;font-family:monospace;">Architecture of Reality</span>
                </td>
              </tr></table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:${i};padding:48px 40px 40px;">
              ${e}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#141008;padding:24px 40px;border-top:1px solid ${n};">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;color:${n};text-transform:uppercase;text-align:center;font-family:monospace;">
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
  </table>`}let d='<div style="height:1px;background:#E4DDD4;margin:28px 0;"></div>';function u(e){return`<h1 style="margin:0 0 12px;font-size:36px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:${a};line-height:1.1;">${e}</h1>`}function y(e){return`<p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${s};font-family:monospace;">${e}</p>`}function g(e,t=!1){return`<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${l};${t?"font-style:italic;":""}">${e}</p>`}function f(e){return p(`
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
  `)}function m(e,t,o,r,n=[]){let i=e?.split(" ")[0]||"Member",f=n.length>0?`${d}
      <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${s};font-family:monospace;">Your Enrolled Courses</p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 4px;width:100%;">
        ${n.map(e=>`
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
    ${g(`Hi ${i}, you've been invited to join <strong style="color:${a};">${t}</strong> on the Vibe Hyr platform as a <strong style="color:${a};">${"educator"===o?"Educator":"leader"===o?"Leader":"Team Member"}</strong>.`)}
    ${g("Vibe Hyr is a professional development platform built on identity-level transformation — helping individuals and teams govern their external results from the inside out.")}
    ${g("Click the button below to set your password and access your assigned courses:")}
    ${f}
    ${c("Set Up Your Account",r)}
    ${d}
    <p style="margin:0 0 12px;font-size:12px;color:#B0A090;line-height:1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="font-family:monospace;font-size:11px;color:${s};word-break:break-all;">${r}</span>
    </p>
    <p style="margin:0;font-size:12px;color:#B0A090;font-style:italic;">
      "Assume the feeling of your wish fulfilled." — Neville Goddard
    </p>
  `)}function h(e,t,o){let r=e?.split(" ")[0]||"Member";return p(`
    ${y("Welcome to Vibe Hyr")}
    ${u(`Your Account<br/><span style="color:${s};">Is Ready.</span>`)}
    ${d}
    ${g(`Hi ${r}, your Vibe Hyr account has been created with <strong style="color:${a};">${"elite"===t?"Reality Master":"architect"===t?"Architect":"Seeker"}</strong> access.`)}
    ${g("Your account is active and waiting for you. Click below to set your password and begin:")}
    ${c("Set Password & Log In",o)}
    ${d}
    <p style="margin:0 0 12px;font-size:12px;color:#B0A090;line-height:1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="font-family:monospace;font-size:11px;color:${s};word-break:break-all;">${o}</span>
    </p>
    <p style="margin:0;font-size:12px;color:#B0A090;font-style:italic;">
      "You have free will to choose the state you will occupy." — Neville Goddard
    </p>
  `)}},25504:(e,t,o)=>{o.d(t,{i:()=>n});var r=o(98406);function n(){return(0,r.eI)("https://dwpmujyycpgibpsculfd.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:!1,autoRefreshToken:!1}})}},71870:(e,t,o)=>{o.d(t,{e:()=>i});var r=o(26407),n=o(53973);function i(){let e=(0,n.cookies)();return(0,r.createServerClient)("https://dwpmujyycpgibpsculfd.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cG11anl5Y3BnaWJwc2N1bGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MDIzOTksImV4cCI6MjA4Nzk3ODM5OX0.vpyxfDO86Mr7K8SldkJOLIgCewAHIFE7cN79H23STDs",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:o,options:r})=>e.set(t,o,r))}catch{}}}})}},65655:(e,t,o)=>{o.d(t,{e:()=>i});var r=o(67721),n=o(71615);function i(){let e=(0,n.cookies)();return(0,r.createServerClient)("https://dwpmujyycpgibpsculfd.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cG11anl5Y3BnaWJwc2N1bGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MDIzOTksImV4cCI6MjA4Nzk3ODM5OX0.vpyxfDO86Mr7K8SldkJOLIgCewAHIFE7cN79H23STDs",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:o,options:r})=>e.set(t,o,r))}catch{}}}})}}};