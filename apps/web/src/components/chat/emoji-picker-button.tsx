'use client'

import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { Smile, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Lazy load emoji picker to reduce initial bundle size (~170KB)
const Picker = lazy(() => import('@emoji-mart/react'))

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void
  disabled?: boolean
}

export function EmojiPickerButton({ onEmojiSelect, disabled }: EmojiPickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [emojiData, setEmojiData] = useState<any>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Preload emoji data when component mounts (background load)
  useEffect(() => {
    import('@emoji-mart/data').then((module) => setEmojiData(module.default))
  }, [])

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleEmojiSelect = (emoji: { native: string }) => {
    onEmojiSelect(emoji.native)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
          'text-foreground-muted hover:text-neon-yellow transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Add emoji"
        aria-expanded={isOpen}
      >
        <Smile className="h-5 w-5" />
      </button>

      {isOpen && emojiData && (
        <div
          ref={pickerRef}
          className="absolute bottom-full right-0 mb-2 z-50"
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8 bg-background-secondary border-2 border-border rounded">
                <Loader2 className="h-6 w-6 animate-spin text-neon-yellow" />
              </div>
            }
          >
            <Picker
              data={emojiData}
              onEmojiSelect={handleEmojiSelect}
              theme="dark"
              previewPosition="none"
              skinTonePosition="none"
              maxFrequentRows={2}
              perLine={8}
              emojiSize={24}
              emojiButtonSize={32}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
