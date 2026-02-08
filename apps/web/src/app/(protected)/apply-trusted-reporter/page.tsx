'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Award,
  Star,
  Key,
} from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { useRequireAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'

type ApplicationStatus = 'pending' | 'approved' | 'rejected'

interface ExistingApplication {
  id: string
  status: ApplicationStatus
  created_at: string
  reviewed_at: string | null
}

export default function ApplyTrustedReporterPage() {
  const router = useRouter()
  const { profile, isLoading: authLoading } = useRequireAuth()
  const supabase = useMemo(() => createClient(), [])

  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null)
  const [isCheckingApplication, setIsCheckingApplication] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [schoolAffiliation, setSchoolAffiliation] = useState('')
  const [reason, setReason] = useState('')

  // Invite code state
  const [inviteCode, setInviteCode] = useState('')
  const [isRedeemingCode, setIsRedeemingCode] = useState(false)

  // Check for existing application
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!profile?.id) return

      if (!supabase) {
        setIsCheckingApplication(false)
        return
      }

      const { data, error } = await supabase
        .from('trusted_reporter_applications')
        .select('id, status, created_at, reviewed_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        setExistingApplication(data as ExistingApplication)
      }
      setIsCheckingApplication(false)
    }

    if (profile) {
      checkExistingApplication()
    }
  }, [profile, supabase])

  // Handle invite code redemption
  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter an invite code' })
      return
    }

    setIsRedeemingCode(true)
    setMessage(null)

    try {
      // Call the database function to redeem the code
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('redeem_trusted_reporter_code', {
        code_input: inviteCode.trim().toUpperCase(),
      })

      if (error) throw error

      const result = data as { success: boolean; error?: string; message?: string }

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'You are now a Trusted Reporter!' })
        // Redirect to profile after a short delay
        setTimeout(() => router.push('/profile'), 2000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to redeem code' })
      }
    } catch (err) {
      console.error('Error redeeming code:', err)
      setMessage({ type: 'error', text: 'Failed to redeem code. Please try again.' })
    } finally {
      setIsRedeemingCode(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile?.id) return

    // Validate required fields
    if (!fullName.trim() || !role.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Database connection not available' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('trusted_reporter_applications')
        .insert({
          user_id: profile.id,
          full_name: fullName.trim(),
          role: role.trim(),
          school_affiliation: schoolAffiliation.trim() || null,
          reason: reason.trim() || null,
          status: 'pending',
        } as never)

      if (error) throw error

      setMessage({ type: 'success', text: 'Application submitted successfully!' })

      // Refresh to show the pending status
      const { data } = await supabase
        .from('trusted_reporter_applications')
        .select('id, status, created_at, reviewed_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setExistingApplication(data as ExistingApplication)
      }
    } catch (err) {
      console.error('Error submitting application:', err)
      setMessage({ type: 'error', text: 'Failed to submit application. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (authLoading || isCheckingApplication) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
      </div>
    )
  }

  // Already a trusted reporter
  if (profile?.is_trusted_reporter) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
          <div className="flex h-14 items-center px-4">
            <Link href="/profile" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-foreground-muted" />
            </Link>
            <h1 className="font-display font-bold neon-text-purple uppercase tracking-wider">
              Trusted Reporter
            </h1>
          </div>
        </header>

        <main className="p-4">
          <Card className="border-2 border-neon-green/30 bg-neon-green/5 p-6 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-neon-green" />
            <h2 className="font-display text-xl font-bold text-neon-green mb-2">
              You&apos;re Already a Trusted Reporter!
            </h2>
            <p className="text-foreground-muted mb-4">
              Enjoy instant score publishing, 2x points multiplier, and your exclusive badge.
            </p>
            <Button onClick={() => router.push('/profile')}>Back to Profile</Button>
          </Card>
        </main>
      </div>
    )
  }

  // Has pending or approved application (rejected users can reapply)
  if (existingApplication && existingApplication.status !== 'rejected') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
          <div className="flex h-14 items-center px-4">
            <Link href="/profile" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-foreground-muted" />
            </Link>
            <h1 className="font-display font-bold neon-text-purple uppercase tracking-wider">
              Application Status
            </h1>
          </div>
        </header>

        <main className="p-4">
          {existingApplication.status === 'pending' && (
            <Card className="border-2 border-neon-yellow/30 bg-neon-yellow/5 p-6 text-center">
              <Clock className="mx-auto mb-4 h-12 w-12 text-neon-yellow" />
              <h2 className="font-display text-xl font-bold text-neon-yellow mb-2">
                Application Pending
              </h2>
              <p className="text-foreground-muted mb-2">
                Your application is being reviewed by our team.
              </p>
              <p className="text-xs text-foreground-subtle mb-4">
                Submitted on {new Date(existingApplication.created_at).toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu' })}
              </p>
              <Button variant="outline" onClick={() => router.push('/profile')}>
                Back to Profile
              </Button>
            </Card>
          )}

          {existingApplication.status === 'approved' && (
            <Card className="border-2 border-neon-green/30 bg-neon-green/5 p-6 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-neon-green" />
              <h2 className="font-display text-xl font-bold text-neon-green mb-2">
                Application Approved!
              </h2>
              <p className="text-foreground-muted mb-4">
                Congratulations! You are now a Trusted Reporter.
              </p>
              <Button onClick={() => router.push('/profile')}>Back to Profile</Button>
            </Card>
          )}
        </main>
      </div>
    )
  }

  // Show application form
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
        <div className="flex h-14 items-center px-4">
          <Link href="/profile" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-foreground-muted" />
          </Link>
          <h1 className="font-display font-bold neon-text-purple uppercase tracking-wider">
            Apply to be a Trusted Reporter
          </h1>
        </div>
      </header>

      <main className="p-4 pb-8">
        {/* Benefits */}
        <Card className="mb-6 border-2 border-neon-purple/30 bg-neon-purple/5">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-neon-purple" />
              <h2 className="font-display font-bold text-neon-purple">Trusted Reporter Benefits</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-neon-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Instant Publishing</p>
                  <p className="text-sm text-foreground-muted">
                    Your scores go live immediately without waiting for verification
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-neon-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">2x Points Multiplier</p>
                  <p className="text-sm text-foreground-muted">
                    Earn double points on every verified submission
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-neon-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Exclusive Badge</p>
                  <p className="text-sm text-foreground-muted">
                    Stand out with the Trusted Reporter badge on your profile
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 flex items-center gap-2 p-3 text-sm border-2 ${
              message.type === 'success'
                ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                : 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Invite Code Section */}
        <Card className="mb-6 border-2 border-neon-green/30 bg-neon-green/5">
          <form onSubmit={handleRedeemCode} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-5 w-5 text-neon-green" />
              <h3 className="font-display font-bold text-neon-green">Have an Invite Code?</h3>
            </div>
            <p className="text-sm text-foreground-muted mb-4">
              If you received an invite code from a trusted source, enter it below to instantly become a Trusted Reporter.
            </p>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter code (e.g., ABC12345)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="flex-1 font-mono uppercase"
                maxLength={10}
              />
              <Button
                type="submit"
                disabled={isRedeemingCode || !inviteCode.trim()}
                className="bg-neon-green hover:bg-neon-green/80 text-background"
              >
                {isRedeemingCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Redeem'
                )}
              </Button>
            </div>
          </form>
        </Card>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-foreground-subtle">Or apply below</span>
          </div>
        </div>

        {/* Application Form */}
        <Card className="border-2 border-border">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <h3 className="font-display font-bold text-foreground mb-4">Application Form</h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name <span className="text-neon-pink">*</span>
              </label>
              <Input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Your Role <span className="text-neon-pink">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
              >
                <option value="">Select your role...</option>
                <option value="coach">Coach</option>
                <option value="athletic_director">Athletic Director</option>
                <option value="school_staff">School Staff</option>
                <option value="parent">Parent/Guardian</option>
                <option value="student">Student</option>
                <option value="media">Media/Press</option>
                <option value="official">Game Official</option>
                <option value="fan">Dedicated Fan</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                School Affiliation
              </label>
              <Input
                type="text"
                placeholder="e.g., Kahuku High School"
                value={schoolAffiliation}
                onChange={(e) => setSchoolAffiliation(e.target.value)}
              />
              <p className="text-xs text-foreground-subtle mt-1">
                Optional: Which school(s) are you associated with?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Why do you want to become a Trusted Reporter?
              </label>
              <textarea
                placeholder="Tell us about your involvement with Hawaii high school sports..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border-2 border-border bg-background text-foreground font-display text-sm resize-none"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neon-purple hover:bg-neon-purple/80"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-foreground-subtle text-center">
              Applications are typically reviewed within 24-48 hours.
            </p>
          </form>
        </Card>
      </main>
    </div>
  )
}
