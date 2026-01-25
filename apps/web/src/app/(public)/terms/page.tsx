'use client'

import { Header } from '@/components/layout'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <>
      <Header title="Terms & Conditions" showBack />

      <main className="px-4 pb-24 grid-bg">
        <div className="mt-4 scoreboard-panel p-6 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground uppercase tracking-widest mb-2">
              Terms of Service
            </h1>
            <p className="text-xs text-foreground-subtle">Last updated: January 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              By accessing and using 808scores, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              2. User Accounts
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account credentials and for any activities under your account.
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>You must be at least 13 years old to use this service</li>
              <li>One account per person is allowed</li>
              <li>You are responsible for all activity on your account</li>
              <li>You must not share your account credentials</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              3. User Conduct
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              You agree to use 808scores responsibly and in compliance with all applicable laws. The following behaviors are prohibited:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>Submitting false or misleading score information</li>
              <li>Harassment, bullying, or abusive behavior toward other users</li>
              <li>Spam, advertising, or promotional content in chat</li>
              <li>Impersonating other users or school officials</li>
              <li>Attempting to manipulate the points or ranking system</li>
              <li>Using automated tools or bots</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              4. Score Submissions
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Users may submit game scores and updates. By submitting, you represent that:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>The information you provide is accurate to the best of your knowledge</li>
              <li>You have firsthand knowledge of the game or reliable source</li>
              <li>You understand that false submissions may result in account penalties</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              5. Points & Rewards
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              808scores offers a points system for user engagement. Points may be earned through various activities including score submissions and chat participation. Points have no monetary value and cannot be exchanged for cash.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed">
              For information about raffles and prize drawings, please see our{' '}
              <Link href="/terms/raffle" className="text-neon-blue hover:underline">
                Raffle Terms & Conditions
              </Link>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              6. Chat Guidelines
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Our game chat feature allows users to discuss live games. By using chat, you agree to:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>Keep discussions respectful and sports-focused</li>
              <li>Not use profanity, slurs, or offensive language</li>
              <li>Not harass or threaten other users</li>
              <li>Report inappropriate content rather than engaging with it</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Violations may result in message removal, temporary timeouts, or permanent bans.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              7. Privacy
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Your privacy is important to us. We collect and use your information only as necessary to provide our services. Your display name and activity may be visible to other users. We do not sell your personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              8. Intellectual Property
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              808scores and its original content, features, and functionality are owned by 808scores and are protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              9. Disclaimer
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              808scores is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy of user-submitted scores. Game information is for entertainment purposes only.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              10. Changes to Terms
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              11. Contact
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              If you have questions about these Terms of Service, please contact us at support@808scores.com.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
