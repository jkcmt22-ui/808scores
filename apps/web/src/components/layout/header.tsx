'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell, Search, User, LogIn, LogOut, Settings, ChevronDown, Command, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button, Avatar } from '@/components/ui'
import { GlobalSearch } from '@/components/search/global-search'
import { useAuth, useNotifications } from '@/hooks'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  showSearch?: boolean
  showNotifications?: boolean
  showBack?: boolean
}

export function Header({
  title,
  showSearch = true,
  showNotifications = true,
}: HeaderProps) {
  const { isAuthenticated, isLoading, profile, signOut } = useAuth()
  const { unreadCount } = useNotifications(profile?.id)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSignOut = async () => {
    setShowUserMenu(false)
    await signOut()
  }

  const openSearch = useCallback(() => {
    setSearchOpen(true)
  }, [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background safe-top">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Neon Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-baseline gap-0.5">
              <span className="font-display text-xl font-black neon-text-pink uppercase tracking-wide">
                Hawaii
              </span>
              <span className="font-display text-xl font-bold neon-text-blue uppercase tracking-wide">
                Sports
              </span>
              <span className="font-display text-xl font-black neon-text-yellow uppercase tracking-wide">
                Center
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {showSearch && (
              <button
                onClick={openSearch}
                aria-label="Open search dialog (Cmd+K)"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background-secondary text-foreground-muted hover:border-neon-blue hover:text-neon-blue transition-all"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline text-sm">Search</span>
                <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-background rounded border border-border" aria-hidden="true">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </kbd>
              </button>
            )}

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                className="text-foreground-muted hover:text-neon-yellow"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}

            {showNotifications && isAuthenticated && (
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-neon-pink text-[10px] font-bold text-white" style={{ boxShadow: '0 0 6px var(--neon-pink)' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {!isLoading && (
              isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' && showUserMenu) {
                        setShowUserMenu(false)
                      }
                    }}
                    aria-label="Open user menu"
                    aria-expanded={showUserMenu}
                    aria-haspopup="menu"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-background-secondary transition-colors"
                  >
                    <Avatar
                      src={profile?.avatar_url}
                      alt={profile?.display_name || 'Profile'}
                      fallback={profile?.display_name?.slice(0, 2) || 'U'}
                      size="sm"
                      className="rounded-full border border-border"
                    />
                    <ChevronDown className={cn(
                      "h-3 w-3 text-foreground-muted transition-transform",
                      showUserMenu && "rotate-180"
                    )} aria-hidden="true" />
                  </button>

                  {showUserMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                        aria-hidden="true"
                      />
                      {/* Dropdown */}
                      <div
                        role="menu"
                        aria-label="User menu"
                        className="absolute right-0 top-full mt-2 z-50 w-48 border-2 border-border bg-background-secondary shadow-lg"
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setShowUserMenu(false)
                          }
                        }}
                      >
                        <div className="p-3 border-b border-border">
                          <p className="font-display text-sm font-bold text-foreground truncate">
                            {profile?.display_name || 'User'}
                          </p>
                          <p className="text-xs text-foreground-muted truncate">
                            {profile?.email || profile?.phone}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            role="menuitem"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-tertiary transition-colors"
                          >
                            <User className="h-4 w-4" aria-hidden="true" />
                            Profile
                          </Link>
                          <Link
                            href="/profile/settings"
                            role="menuitem"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-tertiary transition-colors"
                          >
                            <Settings className="h-4 w-4" aria-hidden="true" />
                            Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            role="menuitem"
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neon-pink hover:bg-neon-pink/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="font-display uppercase tracking-widest text-xs neon-border-pink text-neon-pink hover:bg-neon-pink hover:text-black">
                    <LogIn className="h-4 w-4 mr-1" />
                    Login
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>

        {title && (
          <div className="border-t-2 border-border bg-background-secondary px-4 py-2">
            <h1 className="font-mono text-sm font-bold text-score-amber uppercase tracking-wider">{title}</h1>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={closeSearch} />
    </>
  )
}
