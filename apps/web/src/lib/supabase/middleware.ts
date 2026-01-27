import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { apiRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function updateSession(request: NextRequest) {
  // Rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get client identifier (prefer user ID from cookie, fall back to IP)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'anonymous'

    const result = apiRateLimit(ip)

    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(result)
        }
      )
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes that don't require beta access
  const publicPaths = [
    '/beta-landing',
    '/login',
    '/verify',
    '/terms',
    '/privacy',
    '/terms/raffle',
    '/terms/scholarship',
    '/api/auth/callback',
  ]

  const isPublicPath = publicPaths.some(p => path.startsWith(p))

  // Check beta access for authenticated users (skip if on public path)
  if (!isPublicPath) {
    if (user) {
      // Check if user has beta access
      const { data: userData } = await supabase
        .from('users')
        .select('has_beta_access, is_admin, is_super_admin')
        .eq('id', user.id)
        .single()

      if (!userData?.has_beta_access && !userData?.is_admin && !userData?.is_super_admin) {
        // User logged in but no beta access
        const url = request.nextUrl.clone()
        url.pathname = '/beta-landing'
        return NextResponse.redirect(url)
      }
    } else {
      // Not logged in at all - require beta code
      const url = request.nextUrl.clone()
      url.pathname = '/beta-landing'
      return NextResponse.redirect(url)
    }
  }

  // Protected routes - require authentication
  const protectedPaths = ['/submit', '/profile', '/notifications', '/admin']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Admin routes - require admin role
  const adminPaths = ['/admin']
  const isAdminPath = adminPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAdminPath && user) {
    // Fetch user profile to check admin status
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin, is_super_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin === true || profile?.is_super_admin === true

    if (!isAdmin) {
      // Not an admin - redirect to home
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
