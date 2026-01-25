'use client'

import { Header } from '@/components/layout'
import Link from 'next/link'

export default function RaffleTermsPage() {
  return (
    <>
      <Header title="Raffle Terms" showBack />

      <main className="px-4 pb-24 grid-bg">
        <div className="mt-4 scoreboard-panel p-6 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground uppercase tracking-widest mb-2">
              Raffle Terms & Conditions
            </h1>
            <p className="text-xs text-foreground-subtle">Last updated: January 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              1. Eligibility
            </h2>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>You must be at least 18 years old to participate in raffles</li>
              <li>You must be a legal resident of the State of Hawaii</li>
              <li>Employees of 808scores and their immediate family members are not eligible</li>
              <li>You must have a valid 808scores account in good standing</li>
              <li>You must accept these Raffle Terms & Conditions before entering</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              2. Entry Requirements
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Raffle entries are earned using 808scores points. The following conditions apply:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Points used for entries are deducted from your season points balance</li>
              <li>Entry requirements vary by raffle type:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li><strong>Monthly Raffles:</strong> Minimum 50 points to enter, 25 points per entry, max 10 entries</li>
                  <li><strong>Season-End Raffles:</strong> Minimum 100 points to enter, 50 points per entry, max 20 entries</li>
                </ul>
              </li>
              <li>Points spent on entries are non-refundable</li>
              <li>Multiple entries increase your chances of winning proportionally</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              3. Earning Points
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Points can be earned through legitimate participation on 808scores:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Submitting accurate game scores and updates</li>
              <li>Participating in game chats (with daily limits)</li>
              <li>Receiving likes on your chat messages</li>
              <li>Being mentioned by other users</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              <strong>Note:</strong> Daily caps apply to chat-related points to prevent abuse.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              4. Raffle Schedule
            </h2>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li><strong>Monthly Raffles:</strong> 3 smaller prizes drawn at the end of each month</li>
              <li><strong>Season-End Raffles:</strong> 1 larger prize drawn in December, February, and May</li>
              <li>Entry periods and drawing dates are displayed on each raffle</li>
              <li>Entries close at the specified time; no late entries accepted</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              5. Drawing Process
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Winners are selected using a fair, weighted random drawing:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Each entry is treated as one &quot;ticket&quot; in the drawing</li>
              <li>More entries = higher chance of winning (proportional)</li>
              <li>A cryptographically secure random selection is used</li>
              <li>The same user cannot win multiple positions in a single raffle</li>
              <li>Drawing results are final and binding</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              6. Winner Notification
            </h2>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Winners will be notified via push notification and in-app message</li>
              <li>Winners may also be contacted via email if provided</li>
              <li>Winners will be publicly announced on 808scores</li>
              <li>Winners must respond within 7 days to claim their prize</li>
              <li>Unclaimed prizes may be forfeited or redrawn at our discretion</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              7. Prize Fulfillment
            </h2>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Prizes will be fulfilled as described in each raffle</li>
              <li>Gift cards will be delivered electronically when possible</li>
              <li>Physical prizes may require a Hawaii mailing address</li>
              <li>Winners may be required to provide identification for prizes over $100</li>
              <li>Prizes are non-transferable and cannot be exchanged for cash</li>
              <li>808scores is not responsible for lost, stolen, or unclaimed prizes</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              8. Tax Responsibility
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Winners are solely responsible for any federal, state, or local taxes on prizes. For prizes valued at $600 or more, winners may be required to provide a valid Social Security Number or Tax Identification Number for tax reporting purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              9. Disqualification
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              808scores reserves the right to disqualify any entry or winner who:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Violates these terms or the general Terms of Service</li>
              <li>Attempts to manipulate the raffle or points system</li>
              <li>Uses multiple accounts to enter</li>
              <li>Provides false information</li>
              <li>Engages in any fraudulent activity</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              10. Limitation of Liability
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              By participating, you agree to release 808scores, its affiliates, and sponsors from any liability arising from participation in raffles or acceptance of prizes. Raffles are void where prohibited by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              11. Changes to Terms
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We may modify these terms at any time. Changes will not affect raffles already in progress at the time of the change. Continued participation after changes constitutes acceptance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              12. General Terms
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              These Raffle Terms are supplemental to our{' '}
              <Link href="/terms" className="text-neon-blue hover:underline">
                general Terms of Service
              </Link>
              . In case of conflict, these Raffle Terms take precedence for raffle-related matters.
            </p>
          </section>

          <div className="pt-4 border-t-2 border-border">
            <p className="text-xs text-foreground-subtle text-center">
              By entering any 808scores raffle, you confirm that you have read, understood, and agree to these terms.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
