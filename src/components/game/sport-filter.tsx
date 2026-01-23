'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCategoryEmoji, getSportEmoji } from '@/lib/sport-utils'
import { useSports } from '@/hooks'
import type { Sport } from '@/types/database'

interface SportFilterProps {
  selected: string
  onChange: (sport: string) => void
}

export function SportFilter({ selected, onChange }: SportFilterProps) {
  const { sports, categories, isLoading } = useSports()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setExpandedCategory(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get display name for selected sport
  const getSelectedDisplayName = (): string => {
    if (selected === 'all') return 'All Sports'
    const sport = sports.find((s) => s.code === selected)
    const displayName = sport?.display_name || sport?.name || selected
    const emoji = sport ? getSportEmoji(sport.code) : ''
    return emoji ? `${emoji} ${displayName}` : displayName
  }

  // Check if a category or any of its sports is selected
  const isCategorySelected = (categoryName: string): boolean => {
    if (selected === 'all') return false
    const category = categories.find((c) => c.name === categoryName)
    if (!category) return false
    return category.sports.some((s) => s.code === selected)
  }

  const handleSportSelect = (code: string) => {
    onChange(code)
    setIsDropdownOpen(false)
    setExpandedCategory(null)
  }

  const handleCategoryClick = (categoryName: string, categorySports: Sport[]) => {
    // If only one sport in category (e.g., Football), select it directly
    if (categorySports.length === 1) {
      handleSportSelect(categorySports[0].code)
    } else {
      // Toggle expansion for categories with multiple sports
      setExpandedCategory(expandedCategory === categoryName ? null : categoryName)
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b-2 border-border bg-background-secondary">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-10 w-24 animate-pulse bg-background-tertiary"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="relative border-b-2 border-border bg-background-secondary" ref={dropdownRef}>
      {/* Main filter bar */}
      <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-3">
        {/* All button */}
        <button
          onClick={() => handleSportSelect('all')}
          className={cn(
            'whitespace-nowrap px-4 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all border-2',
            selected === 'all'
              ? 'bg-neon-blue/20 text-neon-blue border-neon-blue'
              : 'bg-background-tertiary text-foreground-muted border-border hover:border-neon-pink hover:text-neon-pink'
          )}
          style={selected === 'all' ? {
            textShadow: '0 0 10px var(--neon-blue)',
            boxShadow: '0 0 10px rgba(5, 217, 232, 0.3), inset 0 0 10px rgba(5, 217, 232, 0.1)'
          } : undefined}
        >
          All
        </button>

        {/* Sport dropdown trigger */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            'flex items-center gap-2 whitespace-nowrap px-4 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all border-2',
            selected !== 'all'
              ? 'bg-neon-pink/20 text-neon-pink border-neon-pink'
              : 'bg-background-tertiary text-foreground-muted border-border hover:border-neon-pink hover:text-neon-pink'
          )}
          style={selected !== 'all' ? {
            textShadow: '0 0 10px var(--neon-pink)',
            boxShadow: '0 0 10px rgba(255, 42, 109, 0.3), inset 0 0 10px rgba(255, 42, 109, 0.1)'
          } : undefined}
        >
          {selected !== 'all' ? getSelectedDisplayName() : 'Select Sport'}
          <ChevronDown className={cn('h-4 w-4 transition-transform', isDropdownOpen && 'rotate-180')} />
        </button>

        {/* Clear filter button (when sport selected) */}
        {selected !== 'all' && (
          <button
            onClick={() => handleSportSelect('all')}
            className="flex h-8 w-8 items-center justify-center border-2 border-border bg-background-tertiary text-foreground-muted hover:border-neon-pink hover:text-neon-pink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div
          className="absolute left-4 right-4 top-full z-50 mt-1 border-2 border-neon-blue/30 bg-background-secondary overflow-hidden"
          style={{
            boxShadow: '0 0 20px rgba(5, 217, 232, 0.2), 0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          {categories.map((category) => (
            <div key={category.name} className="border-b border-border last:border-b-0">
              {/* Category header */}
              <button
                onClick={() => handleCategoryClick(category.name, category.sports)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3 text-left transition-colors',
                  isCategorySelected(category.name)
                    ? 'bg-neon-pink/10 text-neon-pink'
                    : 'text-foreground hover:bg-background-tertiary'
                )}
              >
                <span className="font-display text-sm font-bold uppercase tracking-wider">
                  {getCategoryEmoji(category.name)} {category.name}
                </span>
                {category.hasGenderOptions && (
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform text-foreground-muted',
                      expandedCategory === category.name && 'rotate-180'
                    )}
                  />
                )}
              </button>

              {/* Expanded gender options */}
              {category.hasGenderOptions && expandedCategory === category.name && (
                <div className="bg-background-tertiary/50 border-t border-border">
                  {/* All option for this category */}
                  <button
                    onClick={() => {
                      // Select first sport in category (we'll treat this as "all" for this sport type)
                      // In a real implementation, you might want to handle this differently
                      handleSportSelect(category.sports[0].code)
                    }}
                    className="flex w-full items-center px-8 py-2 text-left text-sm text-foreground-muted hover:text-neon-yellow transition-colors"
                  >
                    <span className="font-display uppercase tracking-wider">{getCategoryEmoji(category.name)} All {category.name}</span>
                  </button>
                  {/* Individual gender options */}
                  {category.sports.map((sport) => (
                    <button
                      key={sport.code}
                      onClick={() => handleSportSelect(sport.code)}
                      className={cn(
                        'flex w-full items-center px-8 py-2 text-left text-sm transition-colors',
                        selected === sport.code
                          ? 'text-neon-pink bg-neon-pink/10'
                          : 'text-foreground-muted hover:text-neon-yellow'
                      )}
                    >
                      <span className="font-display uppercase tracking-wider">
                        {getSportEmoji(sport.code)} {sport.display_name || sport.name}
                      </span>
                      {sport.gender !== 'coed' && (
                        <span className="ml-2 text-xs text-foreground-subtle">
                          ({sport.gender})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
