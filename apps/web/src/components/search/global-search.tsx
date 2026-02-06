'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, Command, Clock, TrendingUp, Trophy, BarChart3, Building2, Medal } from 'lucide-react'
import { useSearch, groupSearchResults, getResultTypeLabel, type SearchResult, type SearchResultType } from '@/hooks/use-search'
import { cn } from '@/lib/utils'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

// Recent searches storage key
const RECENT_SEARCHES_KEY = '808scores_recent_searches'
const MAX_RECENT_SEARCHES = 5

interface RecentSearch {
  query: string
  timestamp: number
}

// Quick links shown when search is empty
const quickLinks = [
  { label: 'Tournaments', href: '/tournaments', icon: Trophy, color: 'text-neon-yellow' },
  { label: 'Standings', href: '/standings', icon: BarChart3, color: 'text-neon-pink' },
  { label: 'Schools', href: '/schools', icon: Building2, color: 'text-neon-blue' },
  { label: 'Leaderboard', href: '/leaderboard', icon: Medal, color: 'text-neon-green' },
]

// Popular schools (featured)
const popularSchools = [
  { name: 'Kahuku', href: '/schools?search=kahuku' },
  { name: 'Mililani', href: '/schools?search=mililani' },
  { name: 'Saint Louis', href: '/schools?search=saint+louis' },
  { name: 'Punahou', href: '/schools?search=punahou' },
  { name: 'Kamehameha', href: '/schools?search=kamehameha' },
]

function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return
  try {
    const searches = getRecentSearches()
    // Remove if already exists
    const filtered = searches.filter(s => s.query.toLowerCase() !== query.toLowerCase())
    // Add to front
    filtered.unshift({ query: query.trim(), timestamp: Date.now() })
    // Keep only max
    const trimmed = filtered.slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed))
  } catch {
    // Ignore storage errors
  }
}

function clearRecentSearches() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // Ignore
  }
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const { results, isLoading, query, setQuery, clear } = useSearch()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  // Load recent searches when opened
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches())
    }
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => Math.min(i + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  const handleSelect = useCallback((result: SearchResult) => {
    // Save to recent searches
    saveRecentSearch(query)
    clear()
    onClose()
    router.push(result.url)
  }, [clear, onClose, router, query])

  const handleClose = useCallback(() => {
    clear()
    onClose()
  }, [clear, onClose])

  const handleQuickLink = useCallback((href: string) => {
    clear()
    onClose()
    router.push(href)
  }, [clear, onClose, router])

  const handleRecentSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
  }, [setQuery])

  const handleClearRecent = useCallback(() => {
    clearRecentSearches()
    setRecentSearches([])
  }, [])

  if (!isOpen) return null

  const groupedResults = groupSearchResults(results)
  const hasResults = results.length > 0

  // Build flat list with type headers for keyboard navigation
  let flatIndex = 0
  const resultTypes: SearchResultType[] = ['school', 'player', 'game']

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
        <div className="w-full max-w-xl bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-5 w-5 text-foreground-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search schools, players..."
              className="flex-1 bg-transparent text-foreground placeholder:text-foreground-muted outline-none text-lg"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {isLoading && (
              <Loader2 className="h-5 w-5 text-neon-blue animate-spin flex-shrink-0" />
            )}
            {query && !isLoading && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-background-secondary rounded"
              >
                <X className="h-4 w-4 text-foreground-muted" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 text-xs text-foreground-muted bg-background-secondary px-2 py-1 rounded">
              <span>esc</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Empty state with quick links and recent searches */}
            {!query && (
              <div className="p-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-display font-bold text-foreground-muted uppercase tracking-wider">
                        <Clock className="h-3 w-3" />
                        Recent
                      </div>
                      <button
                        onClick={handleClearRecent}
                        className="text-xs text-foreground-muted hover:text-neon-pink transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRecentSearch(search.query)}
                          className="px-3 py-1.5 text-sm bg-background-secondary border border-border rounded hover:border-neon-blue hover:text-neon-blue transition-colors"
                        >
                          {search.query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-display font-bold text-foreground-muted uppercase tracking-wider">
                    <TrendingUp className="h-3 w-3" />
                    Quick Links
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <button
                          key={link.href}
                          onClick={() => handleQuickLink(link.href)}
                          className="flex items-center gap-2 p-3 bg-background-secondary border border-border rounded hover:border-neon-blue transition-colors text-left"
                        >
                          <Icon className={cn('h-4 w-4', link.color)} />
                          <span className="font-display text-sm font-bold">{link.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Popular Schools */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-display font-bold text-foreground-muted uppercase tracking-wider">
                    <Building2 className="h-3 w-3" />
                    Popular Schools
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSchools.map((school) => (
                      <button
                        key={school.name}
                        onClick={() => handleQuickLink(school.href)}
                        className="px-3 py-1.5 text-sm bg-background-secondary border border-border rounded hover:border-neon-pink hover:text-neon-pink transition-colors"
                      >
                        {school.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyboard hint */}
                <div className="mt-4 pt-4 border-t border-border text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-background-secondary rounded-lg text-foreground-muted">
                    <Command className="h-4 w-4" />
                    <span className="text-sm">K to open anytime</span>
                  </div>
                </div>
              </div>
            )}

            {query && query.length < 2 && (
              <div className="p-8 text-center text-foreground-muted">
                <p className="text-sm">Type at least 2 characters to search</p>
              </div>
            )}

            {query && query.length >= 2 && !isLoading && !hasResults && (
              <div className="p-8 text-center">
                <p className="text-foreground-muted">No results found for &quot;{query}&quot;</p>
                <p className="text-sm text-foreground-subtle mt-2">
                  Try searching for a school name or player
                </p>
              </div>
            )}

            {hasResults && (
              <div className="py-2">
                {resultTypes.map(type => {
                  const typeResults = groupedResults[type]
                  if (typeResults.length === 0) return null

                  return (
                    <div key={type}>
                      <div className="px-4 py-2 text-xs font-display font-bold text-foreground-muted uppercase tracking-wider">
                        {getResultTypeLabel(type)}
                      </div>
                      {typeResults.map(result => {
                        const currentIndex = flatIndex++
                        const isSelected = currentIndex === selectedIndex

                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                              isSelected
                                ? 'bg-neon-blue/10 text-neon-blue'
                                : 'hover:bg-background-secondary'
                            )}
                          >
                            <span className="text-xl flex-shrink-0">{result.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                'font-display font-bold truncate',
                                isSelected ? 'text-neon-blue' : 'text-foreground'
                              )}>
                                {result.title}
                              </div>
                              <div className="text-sm text-foreground-muted truncate">
                                {result.subtitle}
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-xs text-foreground-muted bg-background-secondary px-2 py-1 rounded">
                                enter
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-background-secondary text-xs text-foreground-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">↓</kbd>
                to navigate
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">↵</kbd>
                to select
              </span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">esc</kbd>
              to close
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
