'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Globe, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 429) {
          setError('Too many attempts. Please try again in an hour.');
        } else {
          setError('Failed to send email. Please try again.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-md w-full">
          <div className="flex items-center justify-center mb-8">
            <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-accent-blue mr-3" aria-hidden="true" />
            <Link href="/" className="text-xl sm:text-2xl font-bold hover:text-accent-blue transition-colors">
              MapMyVisitors
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl blur-3xl" aria-hidden="true"></div>

            <div
              className="relative p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-transparent shadow-2xl text-center"
              style={{
                borderImage: 'linear-gradient(to right, #3b82f6, #8b5cf6) 1',
                boxShadow: '0 0 60px rgba(59, 130, 246, 0.2)',
              }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-accent-green" aria-hidden="true" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-4">Check Your Email!</h1>
              <p className="text-base sm:text-lg text-text-secondary mb-2">
                We&apos;ve sent a magic link to <span className="text-text-primary font-medium">{email}</span>
              </p>
              <p className="text-sm text-text-muted mb-8">
                The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
              </p>

              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-accent-blue/50"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-dark flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-accent-blue mr-3" aria-hidden="true" />
          <Link href="/" className="text-xl sm:text-2xl font-bold hover:text-accent-blue transition-colors">
            MapMyVisitors
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl blur-3xl" aria-hidden="true"></div>

          <div
            className="relative p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-transparent shadow-2xl"
            style={{
              borderImage: 'linear-gradient(to right, #3b82f6, #8b5cf6) 1',
              boxShadow: '0 0 60px rgba(59, 130, 246, 0.2)',
            }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center">Recover Your Widget Code</h1>
            <p className="text-base sm:text-lg text-text-secondary mb-8 text-center">
              Enter your email to receive a magic link
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-12 sm:h-14 px-4 bg-space-dark border border-space-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                  disabled={loading}
                  aria-label="Email address"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 sm:h-14 px-6 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-accent-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                aria-label="Send magic link"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  'Send Magic Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
