'use client'

import { Header } from '@/components/layout'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <>
      <Header title="Privacy Policy" showBack />

      <main className="px-4 pb-24 grid-bg">
        <div className="mt-4 scoreboard-panel p-6 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground uppercase tracking-widest mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs text-foreground-subtle">Last updated: January 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              1. Information We Collect
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We collect information you provide directly to us when you create an account, submit scores, or interact with our services:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li><strong>Account Information:</strong> Email address or phone number, display name</li>
              <li><strong>Profile Information:</strong> Avatar image (optional)</li>
              <li><strong>Activity Data:</strong> Score submissions, chat messages, likes, game attendance</li>
              <li><strong>Device Information:</strong> Browser type, device type, IP address</li>
              <li><strong>Location Data:</strong> Only when you submit scores with location verification (optional)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              2. How We Use Your Information
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process score submissions and verify accuracy</li>
              <li>Calculate points, rankings, and eligibility for rewards</li>
              <li>Send notifications about games you follow</li>
              <li>Moderate content and enforce our community guidelines</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Communicate with you about your account or our services</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              3. Information Sharing
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We do not sell your personal information. We may share information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li><strong>Public Display:</strong> Your display name, avatar, and activity (submissions, chat messages, points) are visible to other users</li>
              <li><strong>Service Providers:</strong> We use third-party services for hosting, analytics, and notifications</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to sharing</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              4. Data Security
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We implement industry-standard security measures to protect your information, including encrypted connections (HTTPS), secure authentication, and access controls. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              5. Your Choices & Rights
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              You have the following rights regarding your information:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Correction:</strong> Update your account information at any time</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Notifications:</strong> Opt out of push notifications in your device settings</li>
              <li><strong>Location:</strong> Deny location access; this only affects bonus points for submissions</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed">
              To exercise these rights, contact us at privacy@808scores.com.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              6. Children&apos;s Privacy
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              808scores is intended for users 13 years of age and older. We do not knowingly collect information from children under 13. If we learn that we have collected information from a child under 13, we will delete it promptly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              7. Cookies & Tracking
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>Keeping you signed in</li>
              <li>Remembering your preferences</li>
              <li>Understanding how you use our service (analytics)</li>
              <li>Improving performance and user experience</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              8. Third-Party Services
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li><strong>Supabase:</strong> Authentication and database hosting</li>
              <li><strong>Vercel:</strong> Application hosting and analytics</li>
              <li><strong>Sentry:</strong> Error tracking and performance monitoring</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed">
              These services have their own privacy policies governing their use of data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              9. Data Retention
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. If you delete your account, we will delete your personal information within 30 days, except where we need to retain it for legal purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              10. Changes to This Policy
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our service or sending you an email.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              11. Contact Us
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-sm text-neon-blue">
              privacy@808scores.com
            </p>
          </section>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-foreground-muted">
              See also our{' '}
              <Link href="/terms" className="text-neon-blue hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/terms/raffle" className="text-neon-blue hover:underline">
                Raffle Terms
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
