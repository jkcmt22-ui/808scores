'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Phone, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type AuthMethod = 'email' | 'phone'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [authMethod, setAuthMethod] = useState<AuthMethod>('email')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
    setError(null)
  }

  const getCleanPhoneNumber = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) {
      return `+1${digits}`
    }
    return null
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanPhone = getCleanPhoneNumber()
    if (!cleanPhone) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('Unable to connect. Please try again.')
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
        options: {
          channel: 'sms',
        },
      })

      if (signInError) {
        throw signInError
      }

      sessionStorage.setItem('verifyPhone', cleanPhone)
      sessionStorage.setItem('verifyRedirect', redirect)
      sessionStorage.setItem('acceptedTerms', 'true')
      sessionStorage.setItem('termsAcceptedAt', new Date().toISOString())
      sessionStorage.setItem('marketingOptIn', marketingOptIn ? 'true' : 'false')

      router.push('/verify')
    } catch (err) {
      console.error('Login error:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send verification code. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('Unable to connect. Please try again.')
      }

      if (isSignUp) {
        // Sign up with terms acceptance and marketing preferences
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}`,
            data: {
              accepted_terms: true,
              terms_accepted_at: new Date().toISOString(),
              terms_version: '2026-01',
              marketing_opt_in: marketingOptIn,
            },
          },
        })

        if (signUpError) throw signUpError

        setMessage('Check your email for a confirmation link!')
      } else {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        // Navigate and refresh to ensure server sees auth cookies
        router.push(redirect)
        router.refresh()
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm border-2 border-border">
      <div className="p-6">
        {/* Auth Method Toggle */}
        <div className="mb-6 flex rounded border-2 border-border">
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setError(null); setMessage(null); }}
            className={cn(
              'flex-1 py-2 px-4 text-sm font-display font-bold uppercase tracking-wider transition-colors',
              authMethod === 'email'
                ? 'bg-neon-blue/20 text-neon-blue'
                : 'text-foreground-muted hover:text-foreground'
            )}
          >
            <Mail className="inline h-4 w-4 mr-1" /> Email
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('phone'); setError(null); setMessage(null); }}
            className={cn(
              'flex-1 py-2 px-4 text-sm font-display font-bold uppercase tracking-wider transition-colors',
              authMethod === 'phone'
                ? 'bg-neon-blue/20 text-neon-blue'
                : 'text-foreground-muted hover:text-foreground'
            )}
          >
            <Phone className="inline h-4 w-4 mr-1" /> Phone
          </button>
        </div>

        <h1 className="mb-2 text-center text-xl font-bold font-display text-foreground">
          Welcome to Hawaii Sports Center
        </h1>
        <p className="mb-6 text-center text-sm text-foreground-muted">
          {authMethod === 'email'
            ? (isSignUp ? 'Create an account to start reporting scores' : 'Sign in to your account')
            : 'Enter your phone number to sign in'}
        </p>

        {authMethod === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                disabled={isLoading}
              />
            </div>

            {/* Terms checkbox for signup */}
            {isSignUp && (
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-2 border-border bg-background-secondary text-neon-blue focus:ring-neon-blue focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-foreground-muted leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="text-neon-blue hover:underline" target="_blank">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-neon-blue hover:underline" target="_blank">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-2 border-border bg-background-secondary text-neon-blue focus:ring-neon-blue focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-foreground-muted leading-relaxed">
                    Send me updates about Hawaii high school sports, new features, and special announcements (optional)
                  </span>
                </label>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-neon-pink/10 border border-neon-pink/30 p-3 text-sm text-neon-pink">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 rounded-lg bg-neon-green/10 border border-neon-green/30 p-3 text-sm text-neon-green">
                <span>{message}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password || (isSignUp && !acceptedTerms)}
              loading={isLoading}
            >
              {!isLoading && (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-foreground-muted">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                className="text-neon-blue hover:underline font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">
                  +1
                </span>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="(808) 555-1234"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="pl-10"
                  autoComplete="tel"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1.5 text-xs text-foreground-subtle">
                We&apos;ll send you a verification code via SMS
              </p>
            </div>

            {/* Terms checkbox for phone auth (could be new user) */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-2 border-border bg-background-secondary text-neon-blue focus:ring-neon-blue focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-foreground-muted leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-neon-blue hover:underline" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-neon-blue hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-2 border-border bg-background-secondary text-neon-blue focus:ring-neon-blue focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-foreground-muted leading-relaxed">
                  Send me updates about Hawaii high school sports, new features, and special announcements (optional)
                </span>
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-neon-pink/10 border border-neon-pink/30 p-3 text-sm text-neon-pink">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || phone.replace(/\D/g, '').length !== 10 || !acceptedTerms}
              loading={isLoading}
            >
              {!isLoading && (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {!isSignUp && (
          <p className="mt-6 text-center text-xs text-foreground-subtle">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-neon-blue hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-neon-blue hover:underline">
              Privacy Policy
            </Link>
          </p>
        )}
      </div>
    </Card>
  )
}

function LoginFormFallback() {
  return (
    <Card className="w-full max-w-sm">
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-blue border-t-transparent" />
      </div>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background grid-bg">
      <header className="flex h-14 items-center justify-center border-b-2 border-border bg-background-secondary">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-display text-lg font-black text-neon-pink uppercase">Hawaii</span>
          <span className="font-display text-lg font-bold text-neon-blue uppercase">Sports</span>
          <span className="font-display text-lg font-bold text-neon-yellow uppercase">Center</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        <Link
          href="/"
          className="mt-4 text-sm text-foreground-muted hover:text-neon-blue transition-colors font-display"
        >
          Continue as guest
        </Link>
      </main>
    </div>
  )
}
