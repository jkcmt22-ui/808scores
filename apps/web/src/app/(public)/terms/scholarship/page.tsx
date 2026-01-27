'use client'

import { Header } from '@/components/layout'
import Link from 'next/link'

export default function ScholarshipTermsPage() {
  return (
    <>
      <Header title="Scholarship Rules" showBack />

      <main className="px-4 pb-24 grid-bg">
        <div className="mt-4 scoreboard-panel p-6 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground uppercase tracking-widest mb-2">
              Hawaii Sports Center Sportsman of the Year Scholarship
            </h1>
            <h2 className="font-display text-lg text-neon-green uppercase tracking-wider mb-2">
              Official Rules
            </h2>
            <p className="text-xs text-foreground-subtle">Effective: January 2026</p>
          </div>

          <div className="bg-neon-yellow/10 border-2 border-neon-yellow/30 p-4">
            <p className="text-sm text-neon-yellow font-bold uppercase">
              NO PURCHASE NECESSARY TO NOMINATE OR VOTE. A PURCHASE OR PAYMENT WILL NOT INCREASE YOUR CHANCES OF WINNING.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              1. Sponsor & Administrator
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              The Hawaii Sports Center Sportsman of the Year Scholarship (&quot;Scholarship&quot;) is sponsored and administered by Hawaii Sports Center (&quot;Sponsor&quot;), with principal place of business in the State of Hawaii. This Scholarship is not sponsored, endorsed, or administered by, or associated with, any school, athletic league, or the Hawaii Department of Education.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              2. Scholarship Award
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              One (1) scholarship in the amount of Ten Thousand Dollars ($10,000.00 USD) will be awarded to the selected winner. The scholarship funds will be paid directly to the accredited post-secondary educational institution of the winner&apos;s choice upon verification of enrollment, or as a check payable to the winner if they choose not to pursue higher education.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed">
              <strong>Tax Responsibility:</strong> The scholarship award may be considered taxable income. Winner will receive an IRS Form 1099-MISC for the full award amount. Winner is solely responsible for all federal, state, and local taxes associated with the scholarship. Sponsor recommends consulting with a tax professional.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              3. Eligibility Requirements
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              To be eligible for nomination and selection, an individual must meet ALL of the following criteria at the time of nomination:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Be a current student-athlete enrolled at a Hawaii high school (public or private) recognized by the Hawaii High School Athletic Association (HHSAA) or participating in HHSAA-sanctioned sports</li>
              <li>Be in good academic standing at their school (minimum 2.0 GPA)</li>
              <li>Be in good standing with their school&apos;s athletic program with no current athletic suspensions</li>
              <li>Be a legal resident of the State of Hawaii</li>
              <li>Be at least 14 years of age at the time of nomination</li>
              <li>Have remaining high school eligibility OR be a graduating senior in the current school year</li>
              <li>Not be an immediate family member of any Hawaii Sports Center employee, officer, or director</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-4">
              <strong>NCAA/NAIA Eligibility Notice:</strong> Student-athletes considering collegiate athletics should consult with their school&apos;s athletic director or guidance counselor regarding how accepting this scholarship may affect their collegiate eligibility under NCAA, NAIA, or other governing body rules. Sponsor makes no representation regarding the impact on collegiate eligibility.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              4. Nomination Process
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Nominations may be submitted by any registered Hawaii Sports Center user during the nomination period. Self-nominations are permitted.
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li><strong>Nomination Period:</strong> As specified for each scholarship year (typically February-March)</li>
              <li><strong>Required Information:</strong> Nominee&apos;s name, school, sport(s), grade level, and reason for nomination</li>
              <li><strong>Review Process:</strong> All nominations are reviewed by Hawaii Sports Center administrators for eligibility verification</li>
              <li><strong>Approval:</strong> Only nominees who meet all eligibility requirements and whose information can be verified will be approved for the voting phase</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-4">
              <strong>Alternative Nomination Method (No Account Required):</strong> Nominations may also be submitted by mail to: Hawaii Sports Center Scholarship Nomination, [Address to be provided], Honolulu, HI 96XXX. Include nominee&apos;s full name, school, sport, grade, and contact information for verification. Mailed nominations must be postmarked by the nomination deadline.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              5. Voting Process
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Public voting determines the scholarship recipient from among approved nominees.
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li><strong>Voting Period:</strong> April 1 through May 15 (or as specified)</li>
              <li><strong>Voter Eligibility:</strong> Any registered Hawaii Sports Center user may cast one (1) vote per scholarship</li>
              <li><strong>Vote Changing:</strong> Voters may change their vote at any time during the voting period</li>
              <li><strong>No Points Required:</strong> Voting does not require or consume Hawaii Sports Center points</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-4">
              <strong>Alternative Voting Method (No Account Required):</strong> Votes may be cast by mail to: Hawaii Sports Center Scholarship Vote, [Address to be provided], Honolulu, HI 96XXX. Include your full name, mailing address, email (optional), and the name of your chosen nominee. Limit one vote per person. Mailed votes must be postmarked by the voting deadline. Mail-in votes will be added to the electronic vote count.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              6. Selection Criteria
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              The Sportsman of the Year Scholarship recognizes student-athletes who exemplify:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li><strong>Sportsmanship:</strong> Fair play, respect for opponents and officials, and positive attitude</li>
              <li><strong>Leadership:</strong> Positive influence on teammates and peers, on and off the field</li>
              <li><strong>Athletic Excellence:</strong> Demonstrated skill and dedication to their sport(s)</li>
              <li><strong>Community Impact:</strong> Positive contribution to their school and local community</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-4">
              The nominee receiving the most votes at the close of the voting period will be selected as the scholarship recipient, subject to final eligibility verification.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              7. Winner Notification & Verification
            </h2>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>The potential winner will be notified within seven (7) days of the voting deadline via email and/or phone</li>
              <li>Winner must respond within fourteen (14) days to claim the scholarship</li>
              <li>Winner (and parent/guardian if under 18) must sign an Affidavit of Eligibility, Liability Release, and where permitted, a Publicity Release</li>
              <li>Winner must provide proof of enrollment at a Hawaii high school and academic standing</li>
              <li>Winner must provide a valid Social Security Number or Tax Identification Number for tax reporting</li>
              <li>If the potential winner cannot be contacted, fails to respond, or is found ineligible, the scholarship may be awarded to the nominee with the next highest vote count</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              8. Parental/Guardian Consent
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              If the winner is under 18 years of age, a parent or legal guardian must:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Co-sign all required documents including the Affidavit of Eligibility and Liability Release</li>
              <li>Provide consent for the winner&apos;s name, likeness, school, and sport to be used for promotional purposes</li>
              <li>Acknowledge the tax implications of the scholarship award</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              9. Publicity Rights
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Except where prohibited by law, acceptance of the scholarship constitutes permission for Sponsor to use the winner&apos;s name, photograph, likeness, voice, biographical information, school name, and statements for advertising, publicity, and promotional purposes in any media without additional compensation, unless prohibited by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              10. Voting Integrity & Fraud Prevention
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Sponsor reserves the right to disqualify any nominee or void any votes that it believes, in its sole discretion, to be:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Generated by bots, scripts, or automated means</li>
              <li>Cast from multiple accounts by the same person</li>
              <li>The result of vote manipulation, vote buying, or other fraudulent activity</li>
              <li>Otherwise in violation of these Official Rules</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-4">
              Sponsor may conduct audits of voting patterns and reserves the right to adjust vote counts or disqualify nominees accordingly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              11. Limitation of Liability
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              BY PARTICIPATING, NOMINATORS, VOTERS, NOMINEES, AND WINNERS AGREE TO RELEASE AND HOLD HARMLESS SPONSOR, ITS PARENT COMPANIES, SUBSIDIARIES, AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS FROM ANY AND ALL LIABILITY, CLAIMS, OR ACTIONS OF ANY KIND ARISING FROM OR IN CONNECTION WITH THIS SCHOLARSHIP, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2">
              <li>Technical failures, errors, or malfunctions</li>
              <li>Unauthorized human intervention</li>
              <li>Lost, late, misdirected, or incomplete nominations or votes</li>
              <li>Any injury or damage to persons or property</li>
              <li>Any claims based on publicity rights, defamation, or invasion of privacy</li>
              <li>The winner&apos;s acceptance, use, or misuse of the scholarship</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              12. Disputes & Governing Law
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              These Official Rules are governed by the laws of the State of Hawaii, without regard to conflict of law principles. Any disputes arising from this Scholarship shall be resolved exclusively in the state or federal courts located in Honolulu, Hawaii. Participants consent to personal jurisdiction in such courts.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed mt-4">
              All decisions of the Sponsor regarding the Scholarship are final and binding in all matters.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              13. Modification & Cancellation
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Sponsor reserves the right to modify, suspend, or cancel the Scholarship at any time if fraud, technical failures, or other factors beyond Sponsor&apos;s control impair the integrity or proper functioning of the Scholarship. In the event of cancellation, Sponsor may, in its sole discretion, select a winner from among all eligible, non-suspect entries received prior to cancellation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              14. Privacy
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Information collected in connection with this Scholarship will be used in accordance with Sponsor&apos;s{' '}
              <Link href="/privacy" className="text-neon-blue hover:underline">
                Privacy Policy
              </Link>
              . Nominee information submitted by third parties is subject to verification with the nominee before public display.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              15. Winner List
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              The name of the scholarship winner will be posted on the Hawaii Sports Center website within thirty (30) days of winner verification. A copy of the winner list may also be obtained by sending a self-addressed stamped envelope to: Hawaii Sports Center Scholarship Winner List, [Address], Honolulu, HI 96XXX.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              16. Conflict of Interest
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Immediate family members (parent, child, sibling, spouse) and household members of Hawaii Sports Center employees, officers, directors, and administrators are not eligible to be nominated for or receive the Scholarship. Hawaii Sports Center employees and administrators will not vote in the Scholarship selection process.
            </p>
          </section>

          <div className="pt-4 border-t-2 border-border space-y-4">
            <p className="text-xs text-foreground-subtle text-center">
              By nominating a student-athlete or voting in the Hawaii Sports Center Sportsman of the Year Scholarship, you acknowledge that you have read and agree to these Official Rules.
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
              <Link href="/terms/raffle" className="text-neon-blue hover:underline">
                Raffle Terms
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
