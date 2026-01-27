'use client'

import { ReactNode, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Trophy,
  GraduationCap,
  Users,
  ClipboardList,
  MessageSquare,
  Calendar,
  Gift,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  Key,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Header } from '@/components/layout'
import { useAuth } from '@/hooks'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, superAdminOnly: true },
  { href: '/admin/beta-codes', label: 'Beta Codes', icon: Key, superAdminOnly: true },
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
  const { profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const isSuperAdmin = profile?.is_super_admin === true

  // Filter nav items based on user role
  const visibleNavItems = useMemo(() => {
    return adminNavItems.filter(item => {
      if (item.superAdminOnly && !isSuperAdmin) return false
      return true
    })
  }, [isSuperAdmin])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

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
