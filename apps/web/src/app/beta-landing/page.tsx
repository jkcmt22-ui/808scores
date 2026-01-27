'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Trophy, Radio, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function BetaLandingPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError(null)

    try {
      const supabase = createClient()

      // Verify beta code
      const { data: betaCode, error: codeError } = await supabase
        .from('beta_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .single()

      if (codeError || !betaCode) {
        setError('Invalid beta code. Please check and try again.')
        setIsVerifying(false)
        return
      }

      // Check if code is expired
      if (betaCode.expires_at && new Date(betaCode.expires_at) < new Date()) {
        setError('This beta code has expired.')
        setIsVerifying(false)
        return
      }

      // Check if code has uses remaining
      if (betaCode.max_uses !== -1 && betaCode.use_count >= betaCode.max_uses) {
        setError('This beta code has reached its maximum uses.')
        setIsVerifying(false)
        return
      }

      // Store code in session for post-login
      sessionStorage.setItem('betaCode', code.trim().toUpperCase())

      // Redirect to login
      router.push('/login?redirect=/&beta=true')
    } catch (err) {
      console.error('Beta code verification error:', err)
      setError('Something went wrong. Please try again.')
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background grid-bg scanlines">
      {/* Header */}
      <header className="flex h-14 items-center justify-center border-b-2 border-neon-pink bg-background-secondary">
        <div className="flex items-center gap-0.5">
          <span className="font-display text-lg font-black neon-text-pink">HAWAII</span>
          <span className="font-display text-lg font-bold neon-text-blue">SPORTS</span>
          <span className="font-display text-lg font-bold neon-text-yellow">CENTER</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-neon-blue animate-pulse" />
          <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-neon-pink animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-neon-yellow animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Hero Section */}
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-neon-pink opacity-50 animate-pulse" />
              <Lock className="h-20 w-20 neon-text-pink relative animate-neon-flicker" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-wider mb-4">
            <span className="neon-text-pink">BETA</span>
            <br />
            <span className="neon-text-blue">ACCESS</span>
            <br />
            <span className="neon-text-yellow">REQUIRED</span>
          </h1>

          {/* Subtitle */}
          <div className="scoreboard-panel p-6 max-w-lg mx-auto">
            <p className="font-display text-sm text-foreground-muted uppercase tracking-wider mb-4">
              Welcome to the Future of Hawaii High School Sports
            </p>
            <p className="text-foreground/80 text-sm leading-relaxed">
              We're currently in closed beta testing. Enter your exclusive beta code to access live scores, real-time chat, and the most radical sports platform in the islands.
            </p>
          </div>

          {/* Beta Code Form */}
          <form onSubmit={handleSubmitCode} className="max-w-md mx-auto space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="ENTER BETA CODE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="text-center font-display text-lg tracking-widest uppercase border-2 border-neon-blue bg-background-secondary"
                maxLength={16}
                required
              />
              {code.length >= 4 && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neon-green animate-fade-in" />
              )}
            </div>

            {error && (
              <div className="p-3 border-2 border-neon-pink bg-neon-pink/10">
                <p className="text-sm text-neon-pink font-display uppercase tracking-wider">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isVerifying || code.length < 4}
              className="w-full btn-neon text-lg py-6"
            >
              {isVerifying ? (
                <>
                  <Radio className="mr-2 h-5 w-5 animate-spin" />
                  VERIFYING...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  ACCESS BETA
                </>
              )}
            </Button>
          </form>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {[
              { icon: Radio, label: 'LIVE SCORES', color: 'neon-pink' },
              { icon: Trophy, label: 'STANDINGS', color: 'neon-blue' },
              { icon: Zap, label: 'REAL-TIME CHAT', color: 'neon-yellow' },
            ].map((feature, i) => (
              <div
                key={feature.label}
                className={`p-4 border-2 border-${feature.color}/30 bg-${feature.color}/5`}
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <feature.icon className={`h-8 w-8 mx-auto mb-2 text-${feature.color}`} />
                <p className={`font-display text-xs text-${feature.color} uppercase tracking-wider`}>
                  {feature.label}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-border">
            <p className="text-foreground-muted text-xs">
              Don't have a beta code? Contact the admin to request access.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
