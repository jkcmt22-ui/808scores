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

  // API routes handle their own auth (CRON_SECRET, session, etc.) — skip beta check
  if (path.startsWith('/api/')) {
    return supabaseResponse
  }

  // Public routes that don't require beta access (using Set for O(1) lookup)
  const PUBLIC_PATHS = new Set([
    '/beta-landing',
    '/login',
    '/verify',
    '/terms',
    '/privacy',
    '/terms/raffle',
    '/terms/scholarship',
  ])

  // Check if path starts with any public path
  const isPublicPath = Array.from(PUBLIC_PATHS).some(p => path.startsWith(p))

  // Protected routes - require authentication
  const PROTECTED_PATHS = new Set(['/submit', '/profile', '/notifications', '/admin'])
  const isProtectedPath = Array.from(PROTECTED_PATHS).some(p => path.startsWith(p))

  // Admin routes - require admin role
  const isAdminPath = path.startsWith('/admin')

  // Single database query for user permissions (consolidates 2 queries into 1)
  let userData: { has_beta_access: boolean; is_admin: boolean; is_super_admin: boolean } | null = null

  if (user && (!isPublicPath || isAdminPath)) {
    const { data, error } = await supabase
      .rpc('get_user_permissions', { p_user_id: user.id })

    if (!error && data) {
      // Handle both array and object responses
      userData = (Array.isArray(data) ? data[0] : data) as { has_beta_access: boolean; is_admin: boolean; is_super_admin: boolean }
    }
  }

  // Redirect authenticated users AWAY from beta-landing to main app
  if (path === '/beta-landing' && user) {
    // Check if they have beta access
    if (userData && (userData.has_beta_access || userData.is_admin || userData.is_super_admin)) {
      // User has access - redirect to main app
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Check beta access for non-public routes
  if (!isPublicPath) {
    if (user && userData) {
      if (!userData.has_beta_access && !userData.is_admin && !userData.is_super_admin) {
        // User logged in but no beta access
        const url = request.nextUrl.clone()
        url.pathname = '/beta-landing'
        return NextResponse.redirect(url)
      }
    } else if (!user) {
      // Not logged in at all - require beta code
      const url = request.nextUrl.clone()
      url.pathname = '/beta-landing'
      return NextResponse.redirect(url)
    }
  }

  // Check authentication for protected routes
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Check admin access (using already-fetched userData)
  if (isAdminPath && user && userData) {
    const isAdmin = userData.is_admin || userData.is_super_admin

    if (!isAdmin) {
      // Not an admin - redirect to home
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
