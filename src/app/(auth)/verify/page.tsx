'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export default function VerifyPage() {
  const router = useRouter()
  const [phone, setPhone] = useState<string>('')
  const [redirect, setRedirect] = useState<string>('/')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Get phone from session storage
  useEffect(() => {
    const storedPhone = sessionStorage.getItem('verifyPhone')
    const storedRedirect = sessionStorage.getItem('verifyRedirect')

    if (!storedPhone) {
      router.push('/login')
      return
    }

    setPhone(storedPhone)
    if (storedRedirect) setRedirect(storedRedirect)

    // Start cooldown timer
    setResendCooldown(60)
  }, [router])

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError(null)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (value && index === 5 && newCode.every((c) => c)) {
      handleVerify(newCode.join(''))
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setCode(newCode)
      handleVerify(pasted)
    }
  }

  // Verify code
  const handleVerify = async (verificationCode: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: verificationCode,
        type: 'sms',
      })

      if (verifyError) {
        throw verifyError
      }

      setSuccess(true)

      // Clean up session storage
      sessionStorage.removeItem('verifyPhone')
      sessionStorage.removeItem('verifyRedirect')

      // Redirect after short delay
      setTimeout(() => {
        router.push(redirect)
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error('Verification error:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid verification code. Please try again.'
      )
      // Clear code on error
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  // Resend code
  const handleResend = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: resendError } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'sms',
        },
      })

      if (resendError) {
        throw resendError
      }

      setResendCooldown(60)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      console.error('Resend error:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to resend code. Please try again.'
      )
    } finally {
      setIsResending(false)
    }
  }

  // Format phone for display
  const formatPhoneDisplay = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/\D/g, '').slice(-10)
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
        <Card className="w-full max-w-md">
          <div className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              You&apos;re in!
            </h1>
            <p className="text-gray-500">Redirecting you now...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="flex h-14 items-center border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
        <Link
          href="/login"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-6">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
              Enter verification code
            </h1>
            <p className="mb-6 text-center text-gray-500">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {phone ? formatPhoneDisplay(phone) : '...'}
              </span>
            </p>

            {/* Code inputs */}
            <div className="mb-6 flex justify-center gap-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="h-14 w-12 rounded-lg border border-gray-300 bg-white text-center text-2xl font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="mb-4 flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Verifying...</span>
              </div>
            )}

            {/* Resend button */}
            <div className="text-center">
              <p className="mb-2 text-sm text-gray-500">Didn&apos;t receive the code?</p>
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Resend code'
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Help text */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Having trouble?{' '}
          <Link href="/help" className="text-blue-600 hover:underline">
            Contact support
          </Link>
        </p>
      </main>
    </div>
  )
}
