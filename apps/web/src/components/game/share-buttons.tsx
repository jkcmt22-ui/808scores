'use client'

import { useState, useCallback } from 'react'
import { Share2, Twitter, Facebook, Link2, Check, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonsProps {
  title: string
  text: string
  url: string
  className?: string
}

export function ShareButtons({ title, text, url, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const fullUrl = url.startsWith('http') ? url : `https://808scores.vercel.app${url}`
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedText = encodeURIComponent(text)
  const encodedTitle = encodeURIComponent(title)

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${fullUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = `${text}\n${fullUrl}`
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text, fullUrl])

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: fullUrl,
        })
      } catch {
        // User cancelled or error - show options instead
        setShowOptions(true)
      }
    } else {
      setShowOptions(!showOptions)
    }
  }, [title, text, fullUrl, showOptions])

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      color: 'hover:bg-[#4267B2]/10 hover:text-[#4267B2] hover:border-[#4267B2]',
    },
    {
      name: 'SMS',
      icon: MessageCircle,
      href: `sms:?body=${encodedText}%20${encodedUrl}`,
      color: 'hover:bg-neon-green/10 hover:text-neon-green hover:border-neon-green',
    },
  ]

  return (
    <div className={cn('relative', className)}>
      {/* Main Share Button */}
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-3 py-2 border-2 border-border bg-background-secondary hover:border-neon-blue hover:text-neon-blue transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span className="font-display text-xs font-bold uppercase tracking-wider">Share</span>
      </button>

      {/* Share Options Dropdown */}
      {showOptions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-48 border-2 border-border bg-background shadow-lg">
            <div className="p-2 space-y-1">
              {shareLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowOptions(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 border border-transparent transition-colors',
                      link.color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-display text-sm">{link.name}</span>
                  </a>
                )
              })}

              <button
                onClick={() => {
                  handleCopyLink()
                  setShowOptions(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 border border-transparent hover:bg-neon-yellow/10 hover:text-neon-yellow hover:border-neon-yellow transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="font-display text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    <span className="font-display text-sm">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Compact inline share buttons for use in cards
export function InlineShareButtons({ title, text, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const fullUrl = url.startsWith('http') ? url : `https://808scores.vercel.app${url}`
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedText = encodeURIComponent(text)

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${fullUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text, fullUrl])

  return (
    <div className="flex items-center gap-1">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-foreground-muted hover:text-[#1DA1F2] transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-foreground-muted hover:text-[#4267B2] transition-colors"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <button
        onClick={handleCopyLink}
        className={cn(
          'p-2 transition-colors',
          copied ? 'text-neon-green' : 'text-foreground-muted hover:text-neon-yellow'
        )}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  )
}
