import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Support both 'next' and 'redirect' parameters
  const next = searchParams.get('next') ?? searchParams.get('redirect') ?? '/profile'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successfully logged in - redirect to profile or specified page
      const redirectUrl = new URL(next, origin)
      return NextResponse.redirect(redirectUrl.toString())
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
