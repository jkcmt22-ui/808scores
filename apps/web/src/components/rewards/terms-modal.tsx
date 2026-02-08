'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Check } from 'lucide-react'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  userId: string
}

export function TermsModal({ isOpen, onClose, onAccept, userId }: TermsModalProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [hasReadTerms, setHasReadTerms] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const handleAccept = async () => {
    setIsAccepting(true)

    const supabase = createClient()
    if (!supabase) {
      setIsAccepting(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('users')
      .update({
        accepted_raffle_terms: true,
        raffle_terms_accepted_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error accepting terms:', error)
      setIsAccepting(false)
      return
    }

    setIsAccepting(false)
    onAccept()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-background border-2 border-border rounded-lg shadow-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border">
          <h2 className="font-display text-lg font-bold text-foreground uppercase tracking-wider">
            Raffle Terms
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-foreground-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-foreground-muted">
            Before entering raffles, please review and accept our Raffle Terms & Conditions.
          </p>

          <div className="scoreboard-panel p-4 space-y-3">
            <h3 className="font-display font-bold text-foreground">Key Points:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Must be 18+ and a Hawaii resident</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Points used for entries are non-refundable</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>More entries = higher chance of winning</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Winners must claim prizes within 7 days</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Prizes cannot be exchanged for cash</span>
              </li>
            </ul>
          </div>

          <Link
            href="/terms/raffle"
            target="_blank"
            className="flex items-center justify-center gap-2 text-neon-blue hover:underline text-sm"
          >
            Read full terms & conditions
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasReadTerms}
              onChange={(e) => setHasReadTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-2 border-border bg-background-secondary accent-neon-blue"
            />
            <span className="text-sm text-foreground-muted">
              I am 18 years or older, a Hawaii resident, and I have read and agree to the Raffle Terms & Conditions
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t-2 border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!hasReadTerms || isAccepting}
            loading={isAccepting}
            className="flex-1"
          >
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
