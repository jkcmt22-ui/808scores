'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'

interface MentionUser {
  id: string
  display_name: string | null
  avatar_url: string | null
}

interface MentionInputProps {
  value: string
  onChange: (value: string, mentions: string[]) => void
  users: MentionUser[]
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  className?: string
  onSubmit?: () => void
}

export function MentionInput({
  value,
  onChange,
  users,
  placeholder = 'Type a message...',
  maxLength = 280,
  disabled = false,
  className,
  onSubmit,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<MentionUser[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionStartPos, setMentionStartPos] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Parse mentions from text
  const parseMentions = useCallback((text: string): string[] => {
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const displayName = match[1]
      const user = users.find(
        (u) => u.display_name?.toLowerCase() === displayName.toLowerCase()
      )
      if (user) {
        mentions.push(user.id)
      }
    }

    return [...new Set(mentions)]
  }, [users])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart || 0

    // Check if we're typing a mention
    const textBeforeCursor = newValue.substring(0, cursorPos)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1)
      // Only show suggestions if no space after @
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt)
        setMentionStartPos(atIndex)
        const filtered = users.filter(
          (u) =>
            u.display_name &&
            u.display_name.toLowerCase().startsWith(textAfterAt.toLowerCase())
        )
        setSuggestions(filtered.slice(0, 5))
        setShowSuggestions(filtered.length > 0)
        setSelectedIndex(0)
      } else {
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }

    const mentions = parseMentions(newValue)
    onChange(newValue, mentions)
  }

  // Handle key down for suggestions navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % suggestions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        selectSuggestion(suggestions[selectedIndex])
      } else if (e.key === 'Escape') {
        setShowSuggestions(false)
      }
    } else if (e.key === 'Enter' && onSubmit) {
      e.preventDefault()
      onSubmit()
    }
  }

  // Select a suggestion
  const selectSuggestion = (user: MentionUser) => {
    if (!user.display_name) return

    const beforeMention = value.substring(0, mentionStartPos)
    const afterMention = value.substring(mentionStartPos + mentionQuery.length + 1)
    const newValue = `${beforeMention}@${user.display_name} ${afterMention}`

    const mentions = parseMentions(newValue)
    onChange(newValue, mentions)
    setShowSuggestions(false)

    // Focus back to input
    inputRef.current?.focus()
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={cn('font-mono text-sm', className)}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-1 bg-background-secondary border-2 border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto"
        >
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              onClick={() => selectSuggestion(user)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                index === selectedIndex
                  ? 'bg-neon-blue/20 text-neon-blue'
                  : 'hover:bg-background-tertiary text-foreground'
              )}
            >
              <div className="h-6 w-6 rounded-full bg-background-tertiary flex items-center justify-center text-xs font-medium">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  user.display_name?.[0]?.toUpperCase() || '?'
                )}
              </div>
              <span className="font-mono">{user.display_name || 'User'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
