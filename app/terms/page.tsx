import { Globe } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-space-dark">
      <header className="fixed top-0 left-0 right-0 z-50 bg-space-dark/80 backdrop-blur-xl border-b border-space-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-accent-blue" aria-label="MapMyVisitors logo" />
            <span className="text-lg sm:text-xl font-bold">MapMyVisitors</span>
          </Link>
          <Link
            href="/login"
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-accent-blue to-accent-purple text-white font-medium rounded-lg hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-accent-blue/50"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-text-secondary mb-12">Last updated: December 26, 2024</p>

          <div className="space-y-8 text-text-primary break-words">
            <section>
              <h2 className="text-3xl font-bold mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  By accessing or using MapMyVisitors (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you and MapMyVisitors. Your use of the Service indicates your acceptance of these Terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">2. Description of Service</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  MapMyVisitors provides a 3D globe widget that displays real-time visitor location data for websites. The Service includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>A customizable 3D globe visualization widget</li>
                  <li>Real-time visitor tracking and geographic location detection</li>
                  <li>Dashboard for monitoring visitor statistics</li>
                  <li>Integration script for embedding the widget on your website</li>
                  <li>Email support for technical issues</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">3. Account Registration and Security</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  To use MapMyVisitors, you must create an account with a valid email address and password. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Providing accurate and current information</li>
                </ul>
                <p>
                  You may not share your account with others or create multiple accounts to circumvent usage limits.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">4. Payment and Billing</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  MapMyVisitors is offered as a one-time payment product. By purchasing the Service, you agree to pay the specified fee of $29 for lifetime access to the basic plan, with an optional $19 upgrade to remove the watermark.
                </p>
                <p>
                  <strong>Lifetime Access and Updates:</strong> &quot;Lifetime access&quot; means access to the Service for as long as it remains operational. &quot;Lifetime updates&quot; refers to all updates, improvements, and bug fixes that we release during the lifecycle of the product itself. This does not guarantee the product will operate indefinitely, but rather that you will receive all updates made available while the Service is active.
                </p>
                <p>
                  Payments are processed through our third-party payment provider (Gumroad). All sales are final except as outlined in our Refund Policy. We reserve the right to change pricing for new customers, but existing customers will maintain their original pricing terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">5. Usage Limits and Fair Use</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  Your account includes the following usage limits:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>10,000 pageviews per month</li>
                  <li>1 website domain</li>
                  <li>Reasonable API request limits to prevent abuse</li>
                </ul>
                <p>
                  Exceeding these limits may result in temporary service interruption or additional charges. We reserve the right to throttle or suspend accounts engaged in abusive usage patterns, including but not limited to: generating fake traffic, attempting to overload our servers, or circumventing technical limitations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">6. Support Response Time</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  We strive to provide timely customer support. Support requests submitted via email will receive a response within 24 hours to 5 business days, depending on the complexity of the issue and current support volume.
                </p>
                <p>
                  Support is provided for technical issues, account access problems, and general questions about the Service. We do not provide custom development, integration assistance beyond basic documentation, or debugging of your website code.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">7. Service Availability and Uptime</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  While we make every effort to ensure high availability, we do not guarantee uninterrupted access to the Service. The Service is provided &quot;as is&quot; without warranty of any kind.
                </p>
                <p className="font-semibold">
                  We are not responsible for service interruptions caused by:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Scheduled maintenance (we will provide advance notice when possible)</li>
                  <li>Third-party service outages (hosting providers, CDN, payment processors)</li>
                  <li>Global server shutdowns or infrastructure failures beyond our control</li>
                  <li>Force majeure events (natural disasters, wars, pandemics, government actions)</li>
                  <li>DDoS attacks or other malicious activities targeting our infrastructure</li>
                  <li>Internet service provider issues or network connectivity problems</li>
                </ul>
                <p>
                  No refunds or service credits will be issued for downtime resulting from circumstances beyond our reasonable control.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">8. Service Termination and Shutdown</h2>
              <div className="space-y-4 text-text-secondary">
                <p className="font-semibold">
                  We reserve the right to discontinue or shut down the MapMyVisitors service at any time for any reason. In the event of a planned shutdown, we will provide customers with 30 calendar days advance notice via email to the address associated with their account.
                </p>
                <p>
                  During the notice period, you will continue to have access to the Service and may export your data. After the shutdown date, all data will be permanently deleted and the Service will no longer be accessible.
                </p>
                <p>
                  In the event of a service shutdown, no refunds will be provided for time remaining on lifetime access accounts, as the one-time payment model is based on usage over an indefinite period rather than a guaranteed timeframe.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">9. Account Termination by User</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  You may terminate your account at any time through your dashboard or by contacting support. Upon termination:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your access to the Service will be immediately revoked</li>
                  <li>Your widget will stop functioning on your website</li>
                  <li>Your data will be deleted within 30 days</li>
                  <li>No refunds will be provided except as outlined in our Refund Policy</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">10. Account Termination by MapMyVisitors</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  We reserve the right to suspend or terminate your account if you:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violate these Terms of Service</li>
                  <li>Use the Service for illegal activities or harmful content</li>
                  <li>Engage in abusive behavior toward our staff or other users</li>
                  <li>Attempt to reverse engineer, hack, or compromise the Service</li>
                  <li>Exceed usage limits repeatedly or egregiously</li>
                  <li>Provide false information or commit fraud</li>
                </ul>
                <p>
                  We will make reasonable efforts to warn you before termination, except in cases of severe abuse or illegal activity.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">11. Intellectual Property</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  All content, features, and functionality of MapMyVisitors, including but not limited to text, graphics, logos, code, and software, are owned by MapMyVisitors and protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  You are granted a limited, non-exclusive, non-transferable license to use the Service for its intended purpose. You may not:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Copy, modify, or create derivative works of the Service</li>
                  <li>Reverse engineer or attempt to extract the source code</li>
                  <li>Remove or modify any proprietary notices or branding</li>
                  <li>Use the Service to create a competing product</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">12. User Data and Privacy</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  You retain ownership of your website visitor data. By using the Service, you grant us permission to collect, store, and process this data to provide the Service. Our data practices are detailed in our Privacy Policy.
                </p>
                <p>
                  You are responsible for ensuring your use of MapMyVisitors complies with applicable privacy laws, including GDPR, CCPA, and other regional regulations. This includes obtaining necessary consent from your website visitors for tracking and data collection.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">13. Limitation of Liability</h2>
              <div className="space-y-4 text-text-secondary">
                <p className="font-semibold">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, MAPMYVISITORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES.
                </p>
                <p>
                  Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid for the Service. Some jurisdictions do not allow limitations on implied warranties or liability, so these limitations may not apply to you.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">14. Disclaimer of Warranties</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Merchantability and fitness for a particular purpose</li>
                  <li>Accuracy, reliability, or availability of the Service</li>
                  <li>Error-free or uninterrupted operation</li>
                  <li>Security or freedom from viruses or malicious code</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">15. Indemnification</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  You agree to indemnify and hold harmless MapMyVisitors from any claims, damages, losses, or expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your use of the Service</li>
                  <li>Violation of these Terms</li>
                  <li>Violation of any third-party rights</li>
                  <li>Your website content or activities</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">16. Modifications to Terms</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify you of significant changes by email or through a prominent notice on our website. Continued use of the Service after changes constitutes acceptance of the modified Terms.
                </p>
                <p>
                  If you do not agree to the modified Terms, you must stop using the Service. We recommend reviewing these Terms periodically.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">17. Governing Law and Disputes</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where MapMyVisitors is registered, without regard to conflict of law principles.
                </p>
                <p>
                  Any disputes arising from these Terms or the Service shall be resolved through binding arbitration, except where prohibited by law. You waive the right to participate in class actions or class arbitrations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">18. Severability</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">19. Entire Agreement</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  These Terms, along with our Privacy Policy and Refund Policy, constitute the entire agreement between you and MapMyVisitors regarding the Service and supersede all prior agreements or understandings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">20. Contact Information</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  If you have questions about these Terms of Service, please contact us at:
                </p>
                <p>
                  Email: support@mapmyvisitors.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-12 px-4 sm:px-6 border-t border-space-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-accent-blue" />
              <span className="text-lg font-bold">MapMyVisitors</span>
            </div>
            <p className="text-text-secondary">
              Show the world where your visitors come from
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-text-secondary">
              <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link href="/refund-policy" className="hover:text-text-primary transition-colors">Refund Policy</Link>
            </div>
            <p className="text-sm text-text-muted">
              © 2024 MapMyVisitors. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
