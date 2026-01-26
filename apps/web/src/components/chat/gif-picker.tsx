'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GifResult {
  id: string
  title: string
  url: string
  preview: string
  width: number
  height: number
}

interface GifPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (gif: { id: string; url: string }) => void
}

export function GifPicker({ isOpen, onClose, onSelect }: GifPickerProps) {
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState<GifResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchGifs = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: '20',
        offset: '0',
      })
      if (searchQuery) {
        params.set('q', searchQuery)
      }

      const response = await fetch(`/api/giphy/search?${params}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch GIFs')
      }

      const data = await response.json()
      setGifs(data.data || [])
    } catch (err) {
      console.error('Error fetching GIFs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load GIFs')
      setGifs([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch trending GIFs on open
  useEffect(() => {
    if (isOpen) {
      fetchGifs('')
      inputRef.current?.focus()
    } else {
      setQuery('')
      setGifs([])
    }
  }, [isOpen, fetchGifs])

  // Debounced search
  useEffect(() => {
    if (!isOpen) return

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchGifs(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, isOpen, fetchGifs])

  const handleSelect = (gif: GifResult) => {
    onSelect({ id: gif.id, url: gif.url })
    onClose()
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-secondary border-2 border-border rounded-lg shadow-lg z-50 max-h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-border">
        <span className="font-mono text-xs font-bold text-score-amber uppercase tracking-wider">
          Select GIF
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-background-tertiary rounded transition-colors"
          aria-label="Close GIF picker"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIPHY..."
            className="w-full pl-9 pr-3 py-2 bg-background-tertiary border border-border rounded text-sm font-mono placeholder:text-foreground-subtle focus:outline-none focus:border-neon-blue"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive text-sm">
            {error}
          </div>
        ) : gifs.length === 0 ? (
          <div className="text-center py-8 text-foreground-muted text-sm">
            {query ? 'No GIFs found' : 'Search for GIFs'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleSelect(gif)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded border-2 border-transparent',
                  'hover:border-neon-blue focus:border-neon-blue focus:outline-none',
                  'transition-all hover:scale-105'
                )}
                title={gif.title}
              >
                <img
                  src={gif.preview || gif.url}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border text-center">
        <span className="text-[10px] text-foreground-subtle font-mono">
          Powered by GIPHY
        </span>
      </div>
    </div>
  )
}
