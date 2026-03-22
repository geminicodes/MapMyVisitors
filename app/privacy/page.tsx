import { Globe } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-text-secondary mb-12">Last updated: December 26, 2024</p>

          <div className="space-y-8 text-text-primary break-words">
            <section>
              <div className="p-6 bg-space-card border border-accent-blue/30 rounded-xl mb-8">
                <p className="text-lg font-semibold text-text-primary mb-2">
                  Your Privacy Matters
                </p>
                <p className="text-text-secondary">
                  We do not collect, store, or sell your personal information or data to third parties. We are committed to protecting your privacy and maintaining transparency about our data practices.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  When you use MapMyVisitors, we collect minimal information necessary to provide the service:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Email address and password (encrypted). Payment information is processed directly by our payment provider (Gumroad) and never stored on our servers.</li>
                  <li><strong>Visitor Data:</strong> Geographic location data (country, city, region) derived from IP addresses of visitors to your website, timestamps, and page views. This data is used solely to power your globe widget visualization.</li>
                  <li><strong>Product Analytics:</strong> Anonymous usage data collected through PostHog (<a href="https://posthog.com/" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">https://posthog.com/</a>), a privacy-friendly analytics platform. This includes how you interact with our dashboard, feature usage patterns, and technical performance metrics. This data helps us monitor product stability, identify bugs, and improve functionality.</li>
                </ul>
                <p className="mt-4">
                  <strong>Important:</strong> We do not collect or store sensitive personal information such as your name, address, phone number, financial details, or any personally identifiable information beyond your email address for account access.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-text-secondary">
                <p>We use the collected information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain the MapMyVisitors service</li>
                  <li>Display visitor location data on your 3D globe widget</li>
                  <li>Process account authentication and access control</li>
                  <li>Send important service updates and respond to support requests</li>
                  <li>Monitor product stability and performance through PostHog analytics</li>
                  <li>Identify and fix bugs quickly to ensure a reliable experience</li>
                  <li>Improve our service and develop new features based on anonymous usage patterns</li>
                  <li>Prevent fraud and ensure security of our platform</li>
                </ul>
                <p className="mt-4">
                  <strong>PostHog Analytics:</strong> We use PostHog to collect anonymous product analytics data. This helps us understand how the product is being used, identify technical issues, monitor performance, and improve functionality. PostHog is a privacy-friendly analytics platform that does not sell data to third parties. You can learn more about PostHog&apos;s privacy practices at <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">https://posthog.com/privacy</a>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">3. Data Sharing and Disclosure</h2>
              <div className="space-y-4 text-text-secondary">
                <p className="font-semibold">
                  We do not sell, rent, or trade your personal information or data to third parties. Period.
                </p>
                <p>
                  We only share limited information in the following specific circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Analytics Provider:</strong> Anonymous usage data is shared with PostHog for product analytics purposes only. This data cannot be used to identify you personally.</li>
                  <li><strong>Payment Processor:</strong> Payment transactions are handled directly by Gumroad. We do not have access to your complete payment information.</li>
                  <li><strong>Hosting Provider:</strong> Your data is stored on secure servers located in the European Union.</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation.</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new owner with the same privacy protections.</li>
                </ul>
                <p className="mt-4">
                  We will never sell your email address, visitor data, or any other information to marketing companies, data brokers, or advertisers.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">4. Data Storage and Security</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  <strong>Server Location:</strong> All data is stored on secure servers located in the European Union, providing strong data protection under EU privacy regulations.
                </p>
                <p>
                  We implement industry-standard security measures to protect your data, including encryption for passwords and secure authentication tokens. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
                <p>
                  Visitor location data is retained for the duration of your account. Upon account deletion, we will remove your personal information within 30 days, though some data may be retained for legal or operational purposes as required by law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">5. Cookies and Tracking</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Keep you signed in to your dashboard</li>
                  <li>Remember your preferences and settings</li>
                  <li>Track visitor data for your website widget</li>
                  <li>Collect anonymous product analytics through PostHog to monitor stability and fix bugs</li>
                  <li>Analyze service usage and improve functionality</li>
                </ul>
                <p>
                  You can control cookie settings through your browser, but disabling cookies may affect service functionality. PostHog cookies are used solely for product improvement and do not track you across other websites.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-text-secondary">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                  <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications (service emails may still be sent)</li>
                </ul>
                <p>
                  To exercise these rights, contact us at support@mapmyvisitors.com
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">7. Third-Party Websites</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  Our service may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">8. Children&apos;s Privacy</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  MapMyVisitors is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">9. International Data Transfers</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  Your information may be transferred to and processed in countries other than your own. By using MapMyVisitors, you consent to the transfer of your information to our servers and service providers globally.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">10. Changes to This Policy</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our website. Continued use of MapMyVisitors after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">11. Contact Us</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us at:
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
