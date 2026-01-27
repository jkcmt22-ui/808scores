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

          <div className="bg-neon-pink/10 border-2 border-neon-pink/30 p-4">
            <p className="text-sm text-neon-pink font-bold uppercase mb-2">
              IMPORTANT: PLEASE READ CAREFULLY
            </p>
            <p className="text-xs text-foreground-muted">
              These Terms include a binding arbitration agreement and class action waiver in Section 15, which affect your legal rights. By using Hawaii Sports Center, you agree to resolve disputes through individual arbitration rather than court proceedings or class actions.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              By accessing or using Hawaii Sports Center (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;), our Privacy Policy, and all applicable laws and regulations. If you do not agree to these Terms, you must not use the Service.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Hawaii Sports Center is operated from the State of Hawaii, United States. We make no representation that the Service is appropriate or available for use in other locations. Those who access the Service from other jurisdictions do so at their own risk and are responsible for compliance with local laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              2. User Accounts & Eligibility
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              When you create an account, you must provide accurate, complete, and current information. You are responsible for safeguarding your account credentials and for all activities under your account.
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li><strong>Minimum Age:</strong> You must be at least 13 years old to create an account</li>
              <li><strong>Parental Consent:</strong> If you are between 13 and 17 years old, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf</li>
              <li><strong>Raffle Participation:</strong> You must be at least 18 years old and a Hawaii resident to enter raffles</li>
              <li><strong>One Account:</strong> Each person may maintain only one account</li>
              <li><strong>Account Security:</strong> You must not share your account credentials with others</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              We reserve the right to suspend or terminate accounts that violate these Terms or for any reason at our sole discretion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              3. User Conduct
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              You agree to use Hawaii Sports Center responsibly and in compliance with all applicable laws. The following are strictly prohibited:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>Submitting false, misleading, or intentionally inaccurate score information</li>
              <li>Harassment, bullying, threats, or abusive behavior toward other users</li>
              <li>Hate speech, discriminatory content, or content promoting violence</li>
              <li>Spam, advertising, or unauthorized promotional content</li>
              <li>Impersonating other users, athletes, coaches, or school officials</li>
              <li>Attempting to manipulate the points, ranking, or voting systems</li>
              <li>Using automated tools, bots, or scripts to interact with the Service</li>
              <li>Creating multiple accounts to circumvent restrictions or manipulate features</li>
              <li>Attempting to gain unauthorized access to other accounts or systems</li>
              <li>Uploading malware, viruses, or other harmful code</li>
              <li>Posting content that infringes intellectual property rights</li>
              <li>Any activity that violates applicable law</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              4. User-Generated Content
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              You retain ownership of content you submit to Hawaii Sports Center. However, by submitting content (including score submissions, chat messages, comments, and any other user contributions), you grant Hawaii Sports Center a worldwide, non-exclusive, royalty-free, perpetual, irrevocable license to use, reproduce, modify, publish, distribute, and display such content in connection with the Service.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed">
              You represent and warrant that: (a) you own or have the necessary rights to submit the content; (b) the content does not violate the rights of any third party; and (c) the content complies with these Terms and all applicable laws.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We do not pre-screen user content but reserve the right to remove or modify any content at our sole discretion without notice. We are not responsible for user-generated content and do not endorse any opinions expressed by users.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              5. Score Submissions
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Users may submit game scores and updates. By submitting, you represent that:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>The information is accurate to the best of your knowledge</li>
              <li>You have firsthand knowledge of the game or a reliable source</li>
              <li>You understand that false submissions may result in account penalties or termination</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              Hawaii Sports Center does not guarantee the accuracy of user-submitted scores. All game information is for entertainment and informational purposes only and should not be relied upon for official records.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              6. Points, Rewards & Raffles
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Hawaii Sports Center offers a points system for user engagement. Points are earned through activities including score submissions and chat participation.
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>Points have no monetary value and cannot be exchanged for cash</li>
              <li>Points may expire at the end of each season as specified</li>
              <li>We reserve the right to adjust, reset, or forfeit points for any reason</li>
              <li>Abuse of the points system may result in points forfeiture and account termination</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              For raffles and prize drawings, see our{' '}
              <Link href="/terms/raffle" className="text-neon-blue hover:underline">
                Raffle Terms & Conditions
              </Link>
              . For the Sportsman of the Year Scholarship, see our{' '}
              <Link href="/terms/scholarship" className="text-neon-blue hover:underline">
                Scholarship Official Rules
              </Link>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              7. Chat Guidelines
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Our chat feature allows users to discuss games. By using chat, you agree to:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>Keep discussions respectful and sports-focused</li>
              <li>Not use profanity, slurs, or offensive language</li>
              <li>Not harass, threaten, or demean other users</li>
              <li>Not post personal information about others without consent</li>
              <li>Not post content that is illegal, harmful, or objectionable</li>
              <li>Report inappropriate content rather than engaging with it</li>
            </ul>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              Violations may result in message removal, temporary timeouts, or permanent bans at our sole discretion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              8. Intellectual Property
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              The Hawaii Sports Center name, logo, and all original content, features, and functionality are owned by Hawaii Sports Center and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed">
              <strong>Third-Party Trademarks:</strong> School names, team names, mascots, logos, and related marks displayed on Hawaii Sports Center are the property of their respective owners. Hawaii Sports Center is not affiliated with, endorsed by, or sponsored by any school, athletic league, or the Hawaii Department of Education. Use of such marks is for identification purposes only and does not imply any affiliation or endorsement.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed">
              <strong>GIPHY:</strong> GIF content is provided by GIPHY. GIPHY and all related marks are trademarks of GIPHY, Inc.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              9. DMCA & Copyright Claims
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We respect intellectual property rights and respond to valid DMCA takedown notices. If you believe content on Hawaii Sports Center infringes your copyright, please send a notice to: dmca@hawaiisportscenter.com containing:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>Identification of the copyrighted work claimed to be infringed</li>
              <li>Identification of the allegedly infringing material and its location</li>
              <li>Your contact information (name, address, email, phone)</li>
              <li>A statement that you have a good faith belief the use is not authorized</li>
              <li>A statement under penalty of perjury that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
              <li>Your physical or electronic signature</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              10. Privacy
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Your privacy is important to us. Our collection and use of personal information is described in our{' '}
              <Link href="/privacy" className="text-neon-blue hover:underline">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. By using the Service, you consent to our data practices as described in the Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              11. Disclaimers
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed uppercase">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              We do not warrant that: (a) the Service will be uninterrupted, secure, or error-free; (b) any defects will be corrected; (c) the Service or servers are free of viruses or harmful components; or (d) the results obtained from the Service will be accurate or reliable.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              <strong>Score Accuracy:</strong> Game scores and information displayed on Hawaii Sports Center are user-submitted and may not be accurate. We do not verify all submissions and make no guarantees regarding accuracy. Do not rely on Hawaii Sports Center for official scoring information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              12. Limitation of Liability
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed uppercase">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, HAWAII SPORTS CENTER AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2 uppercase">
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT YOU HAVE PAID TO HAWAII SPORTS CENTER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed mt-2">
              Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              13. Indemnification
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              You agree to indemnify, defend, and hold harmless Hawaii Sports Center and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from or related to: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any rights of another party; (d) your user-generated content; or (e) any dispute between you and another user.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              14. Governing Law & Jurisdiction
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              These Terms are governed by the laws of the State of Hawaii, without regard to its conflict of law provisions. Subject to the arbitration agreement below, you agree that any legal action or proceeding arising from these Terms shall be brought exclusively in the state or federal courts located in Honolulu, Hawaii, and you consent to the personal jurisdiction of such courts.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-pink uppercase tracking-wider">
              15. Dispute Resolution & Arbitration
            </h2>
            <div className="bg-neon-pink/5 border border-neon-pink/20 p-4 space-y-4">
              <p className="text-sm text-foreground-muted leading-relaxed">
                <strong>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT.</strong>
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed">
                <strong>Informal Resolution:</strong> Before initiating arbitration, you agree to contact us at legal@hawaiisportscenter.com to attempt to resolve any dispute informally. We will attempt to resolve the dispute within 30 days.
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed">
                <strong>Binding Arbitration:</strong> If we cannot resolve a dispute informally, any controversy or claim arising out of or relating to these Terms or the Service shall be settled by binding arbitration administered by the American Arbitration Association (&quot;AAA&quot;) in accordance with its Consumer Arbitration Rules. The arbitration shall take place in Honolulu, Hawaii, or at another mutually agreed location, or via telephone/video conference.
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed">
                <strong>CLASS ACTION WAIVER:</strong> YOU AND HAWAII SPORTS CENTER AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. The arbitrator may not consolidate more than one person&apos;s claims and may not preside over any form of class or representative proceeding.
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed">
                <strong>Exceptions:</strong> This arbitration agreement does not preclude you from bringing issues to the attention of federal, state, or local agencies. Such agencies can, if the law allows, seek relief against us on your behalf. Additionally, either party may bring a claim in small claims court if it qualifies.
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed">
                <strong>Opt-Out:</strong> You may opt out of this arbitration agreement by sending written notice to legal@hawaiisportscenter.com within 30 days of first accepting these Terms. Your notice must include your name, address, and a clear statement that you wish to opt out of arbitration.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              16. Force Majeure
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Hawaii Sports Center shall not be liable for any failure or delay in performing our obligations under these Terms due to circumstances beyond our reasonable control, including but not limited to: natural disasters, pandemic, war, terrorism, riots, government actions, power failures, internet or telecommunications failures, or any other event beyond our reasonable control.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              17. Changes to Terms
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on the Service and updating the &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes acceptance of the modified Terms. If you do not agree to the modified Terms, you must stop using the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              18. Termination
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              19. Severability
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              20. Entire Agreement
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              These Terms, together with our Privacy Policy, Raffle Terms, and Scholarship Official Rules (where applicable), constitute the entire agreement between you and Hawaii Sports Center regarding the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-neon-blue uppercase tracking-wider">
              21. Contact
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <ul className="list-none text-sm text-foreground-muted space-y-1">
              <li>Email: legal@hawaiisportscenter.com</li>
              <li>General inquiries: support@hawaiisportscenter.com</li>
            </ul>
          </section>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-foreground-muted">
              Related documents:{' '}
              <Link href="/privacy" className="text-neon-blue hover:underline">
                Privacy Policy
              </Link>
              {' | '}
              <Link href="/terms/raffle" className="text-neon-blue hover:underline">
                Raffle Terms
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
