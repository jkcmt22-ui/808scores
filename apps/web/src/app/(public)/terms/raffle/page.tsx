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
              Official Sweepstakes Rules
            </h1>
            <p className="text-xs text-foreground-subtle">Last updated: January 2026</p>
          </div>

          <div className="bg-neon-yellow/10 border-2 border-neon-yellow/30 p-4">
            <p className="text-sm text-neon-yellow font-bold uppercase">
              NO PURCHASE OR PAYMENT NECESSARY TO ENTER OR WIN. A PURCHASE OR PAYMENT WILL NOT INCREASE YOUR CHANCES OF WINNING. VOID WHERE PROHIBITED.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              1. Sponsor
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              The Hawaii Sports Center Sweepstakes (&quot;Sweepstakes&quot;) is sponsored by Hawaii Sports Center (&quot;Sponsor&quot;), with principal place of business in the State of Hawaii. This Sweepstakes is not sponsored, endorsed, or administered by, or associated with, any school, athletic league, or the Hawaii Department of Education.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              2. Eligibility
            </h2>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>You must be at least 18 years old at the time of entry</li>
              <li>You must be a legal resident of the State of Hawaii</li>
              <li>Employees, officers, and directors of Hawaii Sports Center and their immediate family members (spouse, parent, child, sibling) and household members are not eligible</li>
              <li>You must have a valid Hawaii Sports Center account in good standing (for online entries) or provide required information (for mail-in entries)</li>
              <li>You must agree to these Official Rules before entering</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-pink uppercase tracking-wider">
              3. How to Enter
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              There are TWO methods of entry with EQUAL chances of winning:
            </p>

            <div className="bg-background-tertiary p-4 border border-border mt-4">
              <h3 className="font-display font-bold text-neon-blue uppercase text-sm mb-2">
                Method 1: Online Entry (Using Points)
              </h3>
              <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
                <li>Log in to your Hawaii Sports Center account</li>
                <li>Navigate to the active sweepstakes</li>
                <li>Use your accumulated points to submit entries</li>
                <li>Entry costs: As specified for each sweepstakes (e.g., 25 points per entry)</li>
                <li>Maximum entries: As specified for each sweepstakes (e.g., 10 entries maximum)</li>
                <li>Points spent on entries are deducted from your balance and are non-refundable</li>
              </ul>
            </div>

            <div className="bg-neon-green/10 p-4 border-2 border-neon-green/30 mt-4">
              <h3 className="font-display font-bold text-neon-green uppercase text-sm mb-2">
                Method 2: Free Mail-In Entry (No Purchase/Points Required)
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed mb-2">
                To enter without using points, hand-print the following information on a 3&quot; x 5&quot; card or piece of paper:
              </p>
              <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
                <li>Your full legal name</li>
                <li>Your complete mailing address</li>
                <li>Your email address</li>
                <li>Your phone number</li>
                <li>Your date of birth</li>
                <li>The name of the specific sweepstakes you are entering</li>
              </ul>
              <p className="text-sm text-foreground-muted leading-relaxed mt-3">
                Mail your entry to:<br />
                <strong>Hawaii Sports Center Sweepstakes Entry<br />
                [Address to be provided]<br />
                Honolulu, HI 96XXX</strong>
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed mt-3">
                <strong>Mail-in entries:</strong> One (1) entry per envelope. Multiple entries in a single envelope will be disqualified. Entries must be postmarked by the sweepstakes end date and received within 7 days of that date. Sponsor is not responsible for lost, late, misdirected, damaged, or illegible mail.
              </p>
              <p className="text-sm text-neon-green font-bold mt-3">
                Each valid mail-in entry receives ONE (1) entry into the sweepstakes, equivalent to the minimum online entry.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              4. Earning Points (For Online Entries)
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Points can be earned through legitimate participation on Hawaii Sports Center:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Submitting accurate game scores and updates</li>
              <li>Participating in game chats (subject to daily limits)</li>
              <li>Receiving likes on your chat messages</li>
              <li>Being mentioned by other users</li>
              <li>Other promotional activities as announced</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              <strong>Note:</strong> Daily caps apply to prevent abuse. Points have no cash value.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              5. Sweepstakes Schedule
            </h2>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li><strong>Monthly Sweepstakes:</strong> Smaller prizes drawn at the end of each month</li>
              <li><strong>Season-End Sweepstakes:</strong> Larger prizes drawn at the end of sports seasons</li>
              <li>Specific entry periods, drawing dates, and prizes are displayed on each sweepstakes</li>
              <li>Entry periods close at 11:59 PM Hawaii-Aleutian Time on the specified end date</li>
              <li>Entries received after the deadline will not be included in that drawing</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              6. Drawing Process
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Winners are selected using a random drawing:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Each entry (online or mail-in) is treated as one &quot;ticket&quot; in the drawing</li>
              <li>More entries = higher chance of winning (proportional to total entries)</li>
              <li>Selection is made using a cryptographically secure random number generator</li>
              <li>The same person cannot win multiple prize positions in a single sweepstakes</li>
              <li>Drawings are conducted by Sponsor or its designated representative</li>
              <li>All decisions of Sponsor are final and binding</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              <strong>Odds of winning</strong> depend on the total number of eligible entries received.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              7. Winner Notification
            </h2>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Potential winners will be notified via email and/or phone within 7 days of the drawing</li>
              <li>Winners may also be notified via push notification and in-app message</li>
              <li>Winner names may be publicly announced on Hawaii Sports Center and social media</li>
              <li>Potential winners must respond within 7 days of notification to claim their prize</li>
              <li>Failure to respond within 7 days may result in forfeiture and selection of an alternate winner</li>
              <li>Sponsor reserves the right to redraw if a winner is found ineligible or cannot be contacted</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              8. Prize Fulfillment
            </h2>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Prizes will be as described in each sweepstakes announcement</li>
              <li>Gift cards and digital prizes will be delivered electronically when possible</li>
              <li>Physical prizes require a valid Hawaii mailing address</li>
              <li>Winners of prizes valued at $100 or more may be required to provide valid government-issued identification</li>
              <li>Prizes are non-transferable and cannot be exchanged for cash (unless specified otherwise)</li>
              <li>No prize substitution allowed except at Sponsor&apos;s sole discretion</li>
              <li>Sponsor is not responsible for lost, stolen, or undelivered prizes</li>
              <li>Prize values are determined at time of sweepstakes announcement</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              9. Tax Responsibility
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Winners are solely responsible for all federal, state, and local taxes on prizes. For prizes valued at $600 or more, winners will be required to provide a valid Social Security Number or Tax Identification Number, and Sponsor will issue an IRS Form 1099-MISC. Failure to provide required tax information may result in prize forfeiture.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              10. Verification & Disqualification
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              All entries are subject to verification. Sponsor reserves the right to disqualify any entrant who:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Violates these Official Rules or the Hawaii Sports Center Terms of Service</li>
              <li>Attempts to manipulate the sweepstakes or points system</li>
              <li>Uses multiple accounts, false identities, or automated means to enter</li>
              <li>Provides false or misleading information</li>
              <li>Engages in any fraudulent or deceptive activity</li>
              <li>Is determined to be ineligible</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              Sponsor&apos;s decisions regarding eligibility and disqualification are final.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              11. Release & Indemnification
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              By entering, you agree to release and hold harmless Sponsor, its parent, subsidiaries, affiliates, directors, officers, employees, and agents from any and all liability, claims, or actions of any kind arising from or in connection with this Sweepstakes, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Participation in the Sweepstakes</li>
              <li>Technical failures, errors, or malfunctions</li>
              <li>Human error in administration</li>
              <li>Lost, late, misdirected, or incomplete entries</li>
              <li>Acceptance, use, or misuse of prizes</li>
              <li>Any injury, damage, or loss of any kind</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              12. Publicity Rights
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Except where prohibited by law, acceptance of a prize constitutes permission for Sponsor to use the winner&apos;s name, photograph, likeness, and city/state of residence for advertising and promotional purposes in any media without additional compensation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              13. Privacy
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Information collected in connection with this Sweepstakes will be used in accordance with Sponsor&apos;s{' '}
              <Link href="/privacy" className="text-neon-blue hover:underline">
                Privacy Policy
              </Link>
              . By entering, you consent to the collection and use of your information as described.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              14. Governing Law & Disputes
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              This Sweepstakes is governed by the laws of the State of Hawaii, without regard to conflict of law provisions. Any disputes shall be resolved exclusively in the state or federal courts located in Honolulu, Hawaii. Entrants consent to personal jurisdiction in such courts. The Sweepstakes is void where prohibited by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              15. Modification & Cancellation
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Sponsor reserves the right to modify, suspend, or cancel any Sweepstakes at any time if fraud, technical failures, or other factors beyond Sponsor&apos;s reasonable control impair the integrity or proper functioning of the Sweepstakes. In the event of cancellation, Sponsor may, in its sole discretion, select winners from among all eligible, non-suspect entries received prior to cancellation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              16. Winner List
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              A list of winners will be posted on the Hawaii Sports Center website within 30 days of the drawing. To receive a copy of the winner list by mail, send a self-addressed stamped envelope to: Hawaii Sports Center Winner List, [Address], Honolulu, HI 96XXX. Requests must be received within 60 days of the drawing date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-yellow uppercase tracking-wider">
              17. General Terms
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              These Official Rules are supplemental to the Hawaii Sports Center{' '}
              <Link href="/terms" className="text-neon-blue hover:underline">
                Terms of Service
              </Link>
              . In case of conflict, these Official Rules take precedence for Sweepstakes-related matters.
            </p>
          </section>

          <div className="pt-4 border-t-2 border-border space-y-4">
            <p className="text-xs text-foreground-subtle text-center">
              By entering any Hawaii Sports Center Sweepstakes, you confirm that you have read, understood, and agree to these Official Rules.
            </p>
            <p className="text-sm text-foreground-muted">
              Related:{' '}
              <Link href="/terms" className="text-neon-blue hover:underline">
                Terms of Service
              </Link>
              {' | '}
              <Link href="/privacy" className="text-neon-blue hover:underline">
                Privacy Policy
              </Link>
              {' | '}
              <Link href="/terms/scholarship" className="text-neon-blue hover:underline">
                Scholarship Rules
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
