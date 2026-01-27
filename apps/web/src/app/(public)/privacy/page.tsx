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

          <p className="text-sm text-foreground-muted leading-relaxed">
            Hawaii Sports Center (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              1. Information We Collect
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We collect information you provide directly to us and information collected automatically when you use our service:
            </p>

            <h3 className="font-display font-bold text-sm text-foreground mt-4">Information You Provide</h3>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li><strong>Account Information:</strong> Email address or phone number, display name, password</li>
              <li><strong>Profile Information:</strong> Avatar image (optional), bio (optional)</li>
              <li><strong>User Content:</strong> Score submissions, chat messages, comments, likes</li>
              <li><strong>Communications:</strong> When you contact us for support or feedback</li>
              <li><strong>Sweepstakes/Scholarship:</strong> For winners: legal name, mailing address, tax identification (as required)</li>
            </ul>

            <h3 className="font-display font-bold text-sm text-foreground mt-4">Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages viewed, features used, actions taken, timestamps</li>
              <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
              <li><strong>Location Data:</strong> Approximate location based on IP address; precise location only when you explicitly enable location-based features and grant permission</li>
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
              <li>Send notifications about games you follow and account activity</li>
              <li>Administer sweepstakes and scholarships</li>
              <li>Moderate content and enforce our community guidelines</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Communicate with you about your account, updates, and promotional offers (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              3. Information Sharing
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              <strong>We do not sell your personal information.</strong> We may share information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li><strong>Public Display:</strong> Your display name, avatar, and activity (submissions, chat messages, points, leaderboard rankings) are visible to other users as part of the service</li>
              <li><strong>Service Providers:</strong> We use third-party services for hosting, analytics, notifications, and other operational purposes. These providers are contractually obligated to protect your information</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request, or to protect the rights, property, or safety of Hawaii Sports Center, our users, or the public</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to sharing for a specific purpose</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-pink uppercase tracking-wider">
              4. Children&apos;s Privacy (COPPA Compliance)
            </h2>
            <div className="bg-neon-pink/5 border border-neon-pink/20 p-4 space-y-3">
              <p className="text-sm text-foreground-muted leading-relaxed">
                <strong>Users Under 13:</strong> Hawaii Sports Center is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will delete that information promptly. If you believe we have collected information from a child under 13, please contact us immediately at privacy@hawaiisportscenter.com.
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed">
                <strong>Users Ages 13-17:</strong> Users between 13 and 17 years old may use Hawaii Sports Center with parental consent. By creating an account, users in this age range represent that a parent or legal guardian has reviewed and approved their use of the service and these policies. We encourage parents to supervise their children&apos;s online activities.
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed">
                <strong>Parental Rights:</strong> Parents or guardians of users under 18 may:
              </p>
              <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1 ml-4">
                <li>Request to review their child&apos;s personal information</li>
                <li>Request deletion of their child&apos;s account and personal information</li>
                <li>Refuse to allow further collection or use of their child&apos;s information</li>
                <li>Contact us at privacy@hawaiisportscenter.com to exercise these rights</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              5. Student Athlete Information
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Hawaii Sports Center displays publicly available information about Hawaii high school athletic events and participants. This information includes:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>Game schedules and scores</li>
              <li>School names and team information</li>
              <li>Player names, positions, and statistics as publicly reported</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              <strong>FERPA Disclaimer:</strong> We do not obtain student information directly from schools or educational records. Information displayed is gathered from publicly available sources such as athletic association websites, news reports, and user submissions.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              <strong>Removal Requests:</strong> Student athletes, parents, or legal guardians who wish to have a student&apos;s information removed from Hawaii Sports Center may submit a request to privacy@hawaiisportscenter.com. We will process valid removal requests within 30 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              6. Data Security
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>Encrypted connections (HTTPS/TLS) for all data transmission</li>
              <li>Secure authentication and password hashing</li>
              <li>Access controls limiting who can access personal data</li>
              <li>Regular security assessments and monitoring</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              <strong>Data Breach Notification:</strong> In compliance with Hawaii Revised Statutes Chapter 487N, if we experience a data breach involving your personal information, we will notify you and the appropriate authorities as required by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              7. Your Rights & Choices
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Update or correct your account information at any time through your profile settings</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated personal data. Some information may be retained as required by law or for legitimate business purposes</li>
              <li><strong>Data Portability:</strong> Request your data in a portable format</li>
              <li><strong>Notifications:</strong> Manage notification preferences in your account settings; opt out of push notifications through your device settings</li>
              <li><strong>Marketing:</strong> Opt out of promotional emails by clicking &quot;unsubscribe&quot; in any marketing email</li>
              <li><strong>Location:</strong> Deny or revoke location access through your device settings; this only affects optional location-based features</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              To exercise these rights, contact us at privacy@hawaiisportscenter.com. We will respond to valid requests within 30 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              8. Cookies & Tracking Technologies
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Understand how you use our service to improve it</li>
              <li><strong>Performance Cookies:</strong> Monitor and improve service performance</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              You can control cookies through your browser settings. Note that disabling certain cookies may affect service functionality.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              9. Third-Party Services
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We use the following third-party services that may collect information:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li><strong>Supabase:</strong> Authentication and database hosting</li>
              <li><strong>Vercel:</strong> Application hosting and analytics</li>
              <li><strong>GIPHY:</strong> GIF content in chat (subject to GIPHY&apos;s privacy policy)</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              These services have their own privacy policies governing their data practices. We encourage you to review their policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              10. Data Retention
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. Specifically:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>User Content:</strong> Chat messages and submissions may be retained even after account deletion for community continuity (with personal identifiers removed)</li>
              <li><strong>Usage Logs:</strong> Retained for up to 12 months for security and analytics</li>
              <li><strong>Legal Records:</strong> Retained as required by law (e.g., tax records for sweepstakes winners)</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal purposes or legitimate business interests.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              11. International Users
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Hawaii Sports Center is operated from the United States. If you access our service from outside the United States, your information will be transferred to and processed in the United States, where data protection laws may differ from those in your country. By using the service, you consent to this transfer.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              12. Do Not Track
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Some browsers have a &quot;Do Not Track&quot; feature. We do not currently respond to Do Not Track signals because there is no industry standard for how to respond to such signals.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              13. Changes to This Policy
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting a prominent notice on our service and/or sending you an email (if you have provided one). The &quot;Last updated&quot; date at the top indicates when the policy was last revised. Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              14. Contact Us
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              If you have questions about this Privacy Policy, our data practices, or wish to exercise your privacy rights, please contact us at:
            </p>
            <ul className="list-none text-sm text-foreground-muted space-y-1 mt-2">
              <li><strong>Privacy Inquiries:</strong> privacy@hawaiisportscenter.com</li>
              <li><strong>General Support:</strong> support@hawaiisportscenter.com</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-4">
              For COPPA-related inquiries or parental requests, please email privacy@hawaiisportscenter.com with &quot;COPPA Request&quot; in the subject line.
            </p>
          </section>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-foreground-muted">
              See also our{' '}
              <Link href="/terms" className="text-neon-blue hover:underline">
                Terms of Service
              </Link>
              {', '}
              <Link href="/terms/raffle" className="text-neon-blue hover:underline">
                Sweepstakes Rules
              </Link>
              {', and '}
              <Link href="/terms/scholarship" className="text-neon-blue hover:underline">
                Scholarship Rules
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
