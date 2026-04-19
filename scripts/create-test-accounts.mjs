// scripts/create-test-accounts.mjs
// Creates one test account per membership tier for local development & QA.
// Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
// Run: node --env-file=.env.local scripts/create-test-accounts.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  console.error('Run with: node --env-file=.env.local scripts/create-test-accounts.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TEST_PASSWORD = 'VH_Test_2026!'

const accounts = [
  { email: 'test.seeker@vibehyr.com',    name: 'Test Seeker',         tier: 'free',      vertical: 'personal' },
  { email: 'test.architect@vibehyr.com', name: 'Test Architect',      tier: 'architect', vertical: 'business' },
  { email: 'test.master@vibehyr.com',    name: 'Test Reality Master', tier: 'elite',     vertical: 'business' },
]

async function createTestAccount({ email, name, tier }) {
  console.log(`\n→ ${tier.toUpperCase()} — ${email}`)

  // 1. Create auth user (skip email verification)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  let userId

  if (authError) {
    const msg = authError.message?.toLowerCase() ?? ''
    if (msg.includes('already') || msg.includes('exists')) {
      // User exists — look up their id
      const { data: list, error: listErr } = await supabase.auth.admin.listUsers()
      if (listErr) { console.error('  ✗ listUsers:', listErr.message); return }
      const existing = list?.users?.find(u => u.email === email)
      if (!existing) { console.error('  ✗ cannot find existing user'); return }
      userId = existing.id
      console.log(`  ℹ already exists — id: ${userId}`)
    } else {
      console.error('  ✗ createUser:', authError.message)
      return
    }
  } else {
    userId = authData?.user?.id
    console.log(`  ✓ auth user created — id: ${userId}`)
  }

  if (!userId) { console.error('  ✗ no userId'); return }

  // 2. Set profile tier and vertical (supporting both legacy/new columns)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        email,
        full_name: name,
        membership_tier: tier,
        vertical: accounts.find(a => a.email === email)?.vertical || 'personal',
        institution_type: accounts.find(a => a.email === email)?.vertical || 'personal',
        role: accounts.find(a => a.email === email)?.vertical || 'member',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    console.error('  ✗ profile upsert:', profileError.message)
  } else {
    console.log(`  ✓ profiles.membership_tier = '${tier}'`)
  }
}

;(async () => {
  console.log('=== Vibe Hyr — Create Test Accounts ===')

  for (const account of accounts) {
    await createTestAccount(account)
  }

  console.log('\n=== Done ===')
  console.log('\nCredentials:')
  for (const { email, tier } of accounts) {
    console.log(`  [${tier.padEnd(10)}]  ${email}  /  ${TEST_PASSWORD}`)
  }
})()
