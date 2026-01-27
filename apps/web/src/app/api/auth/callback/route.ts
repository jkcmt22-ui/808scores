import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Validate redirect URL to prevent open redirect attacks
function getSafeRedirectUrl(next: string | null, origin: string): string {
  const defaultPath = '/profile'

  if (!next) {
    return `${origin}${defaultPath}`
  }

  // Trim whitespace
  const trimmed = next.trim()

  // Only allow relative paths starting with /
  // Reject absolute URLs, protocol-relative URLs, or paths that could redirect elsewhere
  if (
    !trimmed.startsWith('/') ||        // Must start with /
    trimmed.startsWith('//') ||        // Reject protocol-relative URLs
    trimmed.startsWith('/\\') ||       // Reject backslash tricks
    trimmed.includes('://') ||         // Reject any URL with protocol
    trimmed.includes('\0')             // Reject null bytes
  ) {
    return `${origin}${defaultPath}`
  }

  // Block javascript: and data: URLs
  const lowerTrimmed = trimmed.toLowerCase()
  if (lowerTrimmed.includes('javascript:') || lowerTrimmed.includes('data:')) {
    return `${origin}${defaultPath}`
  }

  // Validate decoded URL doesn't contain tricks
  try {
    const decoded = decodeURIComponent(trimmed)
    if (decoded.startsWith('//') || decoded.includes('://')) {
      return `${origin}${defaultPath}`
    }
  } catch {
    // If decoding fails, the URL is malformed
    return `${origin}${defaultPath}`
  }

  return `${origin}${trimmed}`
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
