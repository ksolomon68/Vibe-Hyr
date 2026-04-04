import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const link = searchParams.get('link')

  if (!link) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Security: Only allow redirects to our Supabase project or our own domain
  const allowed = [
    'dwpmujyycpgibpsculfd.supabase.co',
    'vibehyr.com',
    'localhost:3000'
  ]

  try {
    const url = new URL(link)
    if (!allowed.includes(url.host)) {
      console.warn('[auth/setup] Blocked unauthorized redirect:', link)
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.redirect(url.toString())
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url))
  }
}
