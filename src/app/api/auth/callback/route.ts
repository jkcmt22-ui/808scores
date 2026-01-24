import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Validate redirect URL to prevent open redirect attacks
function getSafeRedirectUrl(next: string | null, origin: string): string {
  const defaultPath = '/profile'

  if (!next) {
    return `${origin}${defaultPath}`
  }

  // Only allow relative paths starting with /
  // Reject absolute URLs, protocol-relative URLs, or paths that could redirect elsewhere
  if (
    !next.startsWith('/') ||        // Must start with /
    next.startsWith('//') ||        // Reject protocol-relative URLs
    next.startsWith('/\\') ||       // Reject backslash tricks
    next.includes('://') ||         // Reject any URL with protocol
    next.includes('\0')             // Reject null bytes
  ) {
    return `${origin}${defaultPath}`
  }

  return `${origin}${next}`
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Support both 'next' and 'redirect' parameters
  const next = searchParams.get('next') ?? searchParams.get('redirect')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successfully logged in - redirect to profile or specified page
      const redirectUrl = getSafeRedirectUrl(next, origin)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
