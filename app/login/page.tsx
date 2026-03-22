'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, licenseKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Verification failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-dark flex flex-col">
      <header className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-accent-blue" aria-label="MapMyVisitors logo" />
            <span className="text-lg sm:text-xl font-bold">MapMyVisitors</span>
          </Link>
          <Link
            href="/"
            className="flex px-4 sm:px-6 h-9 sm:h-10 text-sm sm:text-base items-center bg-gradient-to-r from-accent-blue to-accent-purple text-white font-medium rounded-lg hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-accent-blue/50"
          >
            Back
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-start md:items-center justify-center px-4 sm:px-6 pt-2 pb-6 md:py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-4 md:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Access Your Dashboard</h1>
            <p className="text-text-secondary">
              Enter your email and license key from your Gumroad purchase
            </p>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 px-4 bg-space-dark border border-space-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="licenseKey" className="block text-sm font-medium text-text-primary">
                    License Key
                  </label>
                  <input
                    id="licenseKey"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    required
                    className="w-full h-12 px-4 bg-space-dark border border-space-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                  />
                  <p className="text-xs text-text-muted">
                    Find this in your Gumroad purchase receipt
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-accent-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Verifying...' : 'Access Dashboard'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-text-secondary">
                  Don&apos;t have a license key?{' '}
                  <a
                    href="https://tally.so/r/9qlzDp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:text-accent-purple font-medium transition-colors"
                  >
                    Buy now
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-12 px-4 sm:px-6 border-t border-space-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-accent-blue" aria-hidden="true" />
              <span className="text-lg font-bold">MapMyVisitors</span>
            </div>

            <p className="text-text-secondary">
              Show the world where your visitors come from
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-text-secondary">
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
