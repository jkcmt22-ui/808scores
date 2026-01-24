'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, Command } from 'lucide-react'
import { useSearch, groupSearchResults, getResultTypeLabel, type SearchResult, type SearchResultType } from '@/hooks/use-search'
import { cn } from '@/lib/utils'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const { results, isLoading, query, setQuery, clear } = useSearch()
  const [selectedIndex, setSelectedIndex] = useState(0)

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
    clear()
    onClose()
    router.push(result.url)
  }, [clear, onClose, router])

  const handleClose = useCallback(() => {
    clear()
    onClose()
  }, [clear, onClose])

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
      <div className="relative flex items-start justify-center pt-[15vh] px-4">
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
            {!query && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-background-secondary rounded-lg mb-3">
                  <Command className="h-4 w-4" />
                  <span className="text-sm">K</span>
                </div>
                <p className="text-sm text-foreground-muted">
                  Type to search schools and players
                </p>
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
              <span className="flex items-center gap-1">
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
