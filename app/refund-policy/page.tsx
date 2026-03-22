import { Globe, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function RefundPolicy() {
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
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">30-Day Money-Back Guarantee</h1>
          <p className="text-text-secondary mb-12">Last updated: December 26, 2024</p>

          <div className="space-y-8 text-text-primary break-words">
            <section>
              <div className="p-6 bg-space-card border border-accent-blue/30 rounded-xl mb-8">
                <p className="text-lg text-text-secondary">
                  We stand behind MapMyVisitors and want you to be completely satisfied with your purchase. If the Service does not meet your expectations, you may request a full refund within 30 days of your purchase date, subject to the conditions outlined below.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Eligibility Requirements</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  To qualify for a refund under our 30-day money-back guarantee, you must meet all of the following requirements:
                </p>

                <div className="space-y-4 mt-6">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Contact Support First</p>
                      <p>You must contact our support team at support@mapmyvisitors.com and provide a detailed explanation of the issue you encountered. We require a genuine attempt to resolve the problem before processing a refund request.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Request Within 30 Days</p>
                      <p>Refund requests must be submitted within 30 calendar days of your original purchase date. Requests submitted after this period will not be eligible for a refund.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Demonstrate Legitimate Attempt to Use</p>
                      <p>You must show evidence that you made a legitimate attempt to install and use the Service. This includes installing the widget script on your website and testing its functionality.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Provide Technical Details</p>
                      <p>You must provide specific information about the technical issue or reason for dissatisfaction, including browser type, error messages (if any), website URL, and steps you took to troubleshoot.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">No Terms of Service Violations</p>
                      <p>Your account must be in good standing with no violations of our Terms of Service, including abuse of usage limits, fraudulent activity, or prohibited content.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Situations Eligible for Refunds</h2>
              <div className="space-y-4 text-text-secondary">
                <p>We will process refunds in the following situations:</p>

                <div className="space-y-3 mt-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                    <p>The widget fails to function on your website due to a technical issue on our end, and we are unable to resolve it after reasonable troubleshooting efforts</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                    <p>Visitor location data is consistently inaccurate or not displaying, and the issue is verified to be caused by our Service</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                    <p>The Service does not perform core advertised features as described on our website, and we cannot fix the issue within a reasonable timeframe</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                    <p>You were charged an incorrect amount or charged multiple times in error</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                    <p>We discontinue the Service within 30 days of your purchase</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Situations NOT Eligible for Refunds</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  The following situations are explicitly excluded from our refund policy:
                </p>

                <div className="space-y-3 mt-4">
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Change of Mind:</strong> Simple dissatisfaction or buyer&apos;s remorse after using the Service for an extended period (7+ days of active use)</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Excessive Usage:</strong> Accounts that have exceeded 50% of their monthly pageview limit (5,000+ pageviews tracked)</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Lack of Communication:</strong> Requesting a refund without first contacting support or attempting to resolve the issue</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Technical Incompatibility:</strong> Issues caused by your website&apos;s platform, hosting environment, conflicting scripts, or custom code modifications. You are responsible for ensuring compatibility before purchase.</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Browser or Device Limitations:</strong> Issues specific to outdated browsers, ad blockers, privacy extensions, or devices not meeting minimum technical requirements</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Aesthetic Preferences:</strong> Dislike of the design, colors, size, or visual appearance of the globe widget (customization options are documented on our website)</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Feature Requests:</strong> The Service not having specific features you wanted but were not advertised as included</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Third-Party Service Issues:</strong> Problems caused by your payment provider, email provider, internet connection, or other third-party services</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Account Suspension:</strong> Accounts terminated or suspended due to violation of our Terms of Service</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Duplicate Purchases:</strong> Accidental multiple purchases (contact us immediately for assistance, not a refund)</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>No Installation Attempt:</strong> Requesting a refund without ever installing the widget or attempting to use the Service</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Privacy Law Concerns:</strong> Issues related to your compliance with GDPR, CCPA, or other privacy regulations (you are responsible for legal compliance)</p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p><strong>Delayed Service Disruptions:</strong> Temporary outages or maintenance periods that occur more than 7 days after purchase</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Refund Process</h2>
              <div className="space-y-4 text-text-secondary">
                <p>If you believe you qualify for a refund, follow these steps:</p>

                <ol className="list-decimal list-inside space-y-3 ml-4">
                  <li className="pl-2">
                    <strong>Contact Support:</strong> Email support@mapmyvisitors.com with the subject line &quot;Refund Request - [Your Email]&quot;
                  </li>
                  <li className="pl-2">
                    <strong>Provide Information:</strong> Include your purchase date, order number (from Gumroad), detailed description of the issue, screenshots or error messages, and evidence of troubleshooting attempts
                  </li>
                  <li className="pl-2">
                    <strong>Allow Time for Resolution:</strong> Give our support team 3-5 business days to investigate and attempt to resolve the issue
                  </li>
                  <li className="pl-2">
                    <strong>Await Decision:</strong> We will review your request and respond within 5 business days with approval or denial
                  </li>
                  <li className="pl-2">
                    <strong>Receive Refund:</strong> If approved, refunds are processed within 7-10 business days to your original payment method
                  </li>
                </ol>

                <p className="mt-6">
                  Upon refund approval, your account will be immediately deactivated and you will lose access to the Service. All data will be deleted in accordance with our Privacy Policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Partial Refunds</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  Partial refunds are not available. MapMyVisitors is sold as a lifetime access product with a one-time payment. The 30-day guarantee covers the full purchase price only if eligibility requirements are met.
                </p>
                <p>
                  The watermark removal upgrade ($19) is non-refundable as it is a digital customization that is applied immediately upon purchase.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Chargebacks and Payment Disputes</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  If you initiate a chargeback or payment dispute without first contacting our support team, it will be considered fraudulent activity. We will provide evidence to your payment provider demonstrating that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You received access to the Service as advertised</li>
                  <li>You did not follow the refund request process</li>
                  <li>The purchase was legitimate and authorized</li>
                </ul>
                <p className="mt-4">
                  Accounts initiating chargebacks will be permanently banned from using MapMyVisitors, and we reserve the right to pursue legal action for fraud.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Changes to Refund Policy</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  We reserve the right to modify this refund policy at any time. Changes will not affect purchases made before the policy change date. We will notify customers of significant changes via email.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Fair Use Commitment</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  This refund policy is designed to protect both you and MapMyVisitors from abuse. We genuinely want you to be satisfied with your purchase and will work with you in good faith to resolve legitimate issues.
                </p>
                <p>
                  However, we must protect ourselves from customers who extensively use the Service and then request refunds, or who attempt to exploit the guarantee. The conditions outlined above ensure that refunds are granted to customers with genuine issues while preventing abuse.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  For refund requests or questions about this policy, contact us at:
                </p>
                <p>
                  Email: support@mapmyvisitors.com
                </p>
                <p className="mt-4 text-sm text-text-muted">
                  Please do not request refunds through payment provider disputes. All refund requests must go through our support team first.
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
