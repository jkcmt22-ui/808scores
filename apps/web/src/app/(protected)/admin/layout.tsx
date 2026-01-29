'use client'

import { ReactNode, useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Trophy,
  GraduationCap,
  Users,
  ClipboardList,
  MessageSquare,
  Calendar,
  CalendarDays,
  Gift,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  Key,
  Loader2,
  AlertCircle,
  ListOrdered,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks'
import { logAuthState, logLoadingStart, logLoadingEnd, logRender } from '@/lib/nav-debug'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/seasons', label: 'Seasons', icon: CalendarDays },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, superAdminOnly: true },
  { href: '/admin/beta-codes', label: 'Beta Codes', icon: Key, superAdminOnly: true },
  { href: '/admin/standings', label: 'Standings', icon: ListOrdered },
  { href: '/admin/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/admin/schools', label: 'Schools', icon: GraduationCap },
  { href: '/admin/school-managers', label: 'School Managers', icon: Users },
  { href: '/admin/rosters', label: 'Rosters', icon: ClipboardList },
  { href: '/admin/moderation', label: 'Moderation', icon: MessageSquare },
  { href: '/admin/schedule', label: 'Schedule', icon: Calendar },
  { href: '/admin/raffles', label: 'Raffles', icon: Gift },
  { href: '/admin/prizes', label: 'Prizes', icon: Award },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const loadingIdRef = useRef<string>('')
  const redirectedRef = useRef(false)

  const isSuperAdmin = profile?.is_super_admin === true
  const hasAdminAccess = profile?.is_admin === true || isSuperAdmin

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS (Rules of Hooks)

  // Filter nav items based on user role - must be before returns
  const visibleNavItems = useMemo(() => {
    return adminNavItems.filter(item => {
      if (item.superAdminOnly && !isSuperAdmin) return false
      return true
    })
  }, [isSuperAdmin])

  // Debug: Log render
  logRender('AdminLayout', `authLoading=${authLoading}, hasUser=${!!user}, hasProfile=${!!profile}`)

  // Debug: Log auth state
  useEffect(() => {
    logAuthState('AdminLayout', {
      isLoading: authLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      isAdmin: profile?.is_admin,
      isSuperAdmin: profile?.is_super_admin,
    })
  }, [authLoading, user, profile])

  // Track loading state with timeout and auto-retry
  useEffect(() => {
    if (authLoading) {
      loadingIdRef.current = logLoadingStart('AdminLayout', 'auth check')
      setLoadingTimeout(false)

      // Check if we've already retried (persisted in sessionStorage)
      const retryKey = 'admin-auth-retry'
      const hasRetried = sessionStorage.getItem(retryKey) === 'true'

      // Timeout after 6 seconds (slightly longer than auth provider's 5s timeout)
      const timeout = setTimeout(() => {
        if (!hasRetried) {
          // Auto-retry once
          sessionStorage.setItem(retryKey, 'true')
          logLoadingEnd(loadingIdRef.current, 'timeout') // Will auto-retry
          window.location.reload()
        } else {
          setLoadingTimeout(true)
          logLoadingEnd(loadingIdRef.current, 'timeout')
        }
      }, 6000)

      return () => clearTimeout(timeout)
    } else if (loadingIdRef.current) {
      logLoadingEnd(loadingIdRef.current, 'success')
      loadingIdRef.current = ''
      setLoadingTimeout(false) // Reset timeout state when loading completes
      // Clear retry flag on success
      sessionStorage.removeItem('admin-auth-retry')
    }
  }, [authLoading])

  // Handle redirect in useEffect (not during render)
  useEffect(() => {
    if (!authLoading && !user && !redirectedRef.current) {
      redirectedRef.current = true
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [authLoading, user, router, pathname])

  // Helper function for active state - defined before returns
  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  // === CONDITIONAL RETURNS START HERE (after all hooks) ===

  // Auth loading state - show loading in layout with timeout fallback
  if (authLoading) {
    if (loadingTimeout) {
      return (
        <div className="min-h-screen bg-background">
          <Header title="Admin Panel" />
          <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
            <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
            <h1 className="mb-2 font-display text-xl font-bold text-foreground uppercase">
              Connection Issue
            </h1>
            <p className="mb-4 text-foreground-muted text-sm text-center max-w-md">
              Unable to verify your session. This may be due to a slow connection or server issue.
            </p>
            <Button
              onClick={() => {
                sessionStorage.removeItem('admin-auth-retry')
                window.location.reload()
              }}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background">
        <Header title="Admin Panel" />
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
          <span className="mt-4 font-display text-sm text-foreground-muted uppercase tracking-wider">
            Loading...
          </span>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect handled by useEffect above
  if (!user) {
    return null
  }

  // Profile failed to load - graceful error
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Admin Panel" />
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
          <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
          <h1 className="mb-2 font-display text-xl font-bold text-foreground uppercase">
            Profile Not Found
          </h1>
          <p className="mb-4 text-foreground-muted text-sm text-center max-w-md">
            Unable to load your profile. This could be a temporary issue.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // No admin access
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Admin Panel" />
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
          <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
          <h1 className="mb-2 font-display text-xl font-bold text-foreground uppercase">
            Access Denied
          </h1>
          <p className="mb-4 text-foreground-muted text-sm text-center">
            You need admin privileges to access this area.
          </p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  // === MAIN RENDER ===
  return (
    <div className="min-h-screen bg-background">
      <Header title="Admin Panel" />

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-24 right-4 z-50 lg:hidden flex items-center justify-center w-12 h-12 rounded-full bg-neon-blue text-black shadow-lg"
        style={{ boxShadow: '0 0 20px var(--neon-blue)' }}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] border-r-2 border-border bg-background-secondary transition-all duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            collapsed ? 'w-16' : 'w-64'
          )}
        >
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex absolute -right-3 top-4 z-50 items-center justify-center w-6 h-6 rounded-full border-2 border-border bg-background text-foreground-muted hover:text-foreground transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>

          <nav className="p-2 space-y-1 overflow-y-auto h-full">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg font-display text-sm uppercase tracking-wider transition-all',
                    active
                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                      : 'text-foreground-muted hover:bg-background-tertiary hover:text-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-neon-blue')} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <main
          className={cn(
            'flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300',
            collapsed ? 'lg:ml-0' : 'lg:ml-0'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
