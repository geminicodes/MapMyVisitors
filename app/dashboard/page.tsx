'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Check, Loader2, AlertCircle, Globe, LogOut } from 'lucide-react';

interface CustomerData {
  id: string;
  email: string;
  plan: string;
  widget_id: string;
  pageviews_used: number;
  pageviews_limit: number;
  website_domains: string[];
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        const response = await fetch('/api/customer');

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          setError('generic');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setCustomerData(data.customer);
        setLoading(false);
      } catch {
        setError('network');
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [router]);

  const handleCopy = async () => {
    if (!customerData) return;

    const widgetCode = `<!-- Step 1: Add container (optional) -->
<div id="mapmyvisitors-widget"></div>

<!-- Step 2: Add widget script -->
<script src="https://mapmyvisitors.com/widget.js?id=${customerData.widget_id}"></script>`;

    try {
      await navigator.clipboard.writeText(widgetCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Failed to copy. Please copy the code manually.');
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      setLoggingOut(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center px-4 sm:px-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-blue mx-auto mb-4 animate-spin" aria-label="Loading" />
          <p className="text-text-secondary text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorConfig = {
      'network': {
        icon: <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />,
        heading: 'Connection Error',
        message: 'Unable to load your dashboard. Please check your internet connection.',
        buttonText: 'Retry',
        buttonAction: handleRetry,
      },
      'generic': {
        icon: <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />,
        heading: 'Something Went Wrong',
        message: 'Failed to load dashboard. Please try again.',
        buttonText: 'Retry',
        buttonAction: handleRetry,
      },
    };

    const config = errorConfig[error as keyof typeof errorConfig] || errorConfig.generic;

    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-md w-full bg-space-card border border-space-border rounded-2xl p-8 text-center">
          {config.icon}
          <h1 className="text-3xl font-bold mb-4">{config.heading}</h1>
          <p className="text-text-secondary mb-6">{config.message}</p>
          <button
            onClick={config.buttonAction}
            className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-accent-blue/50"
          >
            {config.buttonText}
          </button>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return null;
  }

  const percentageUsed = (customerData.pageviews_used / customerData.pageviews_limit) * 100;

  return (
    <div className="min-h-screen bg-space-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center">
            <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-accent-blue mr-3" aria-hidden="true" />
            <Link href="/" className="text-xl sm:text-2xl font-bold hover:text-accent-blue transition-colors">
              MapMyVisitors
            </Link>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-space-card border border-space-border rounded-lg hover:bg-space-dark transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Your Globe is Ready!</h1>
          <p className="text-lg font-medium text-text-secondary mb-2">
            Copy the code below and paste it on your website
          </p>
          <p className="text-sm text-text-muted">
            Logged in as: {customerData.email}
          </p>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl blur-3xl" aria-hidden="true"></div>

          <div
            className="relative p-5 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-transparent shadow-2xl"
            style={{
              borderImage: 'linear-gradient(to right, #3b82f6, #8b5cf6) 1',
              boxShadow: '0 0 60px rgba(59, 130, 246, 0.2)',
            }}
          >
            <h2 className="text-lg font-semibold mb-4">Your Widget Code</h2>

            <div className="bg-space-dark p-4 sm:p-6 rounded-xl mb-4 overflow-x-auto">
              <pre className="text-sm font-mono text-white whitespace-pre-wrap break-words">
{`<!-- Step 1: Add container (optional) -->
<div id="mapmyvisitors-widget"></div>

<!-- Step 2: Add widget script -->
<script src="https://mapmyvisitors.com/widget.js?id=${customerData.widget_id}"></script>`}
              </pre>
            </div>

            <button
              onClick={handleCopy}
              className="w-full sm:w-auto h-12 px-6 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-accent-blue/50 flex items-center justify-center gap-2 mb-4"
              aria-label="Copy widget code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" aria-hidden="true" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" aria-hidden="true" />
                  Copy Code
                </>
              )}
            </button>

            <p className="text-sm text-text-secondary">
              Paste this code anywhere in your HTML, just before the closing &lt;/body&gt; tag
            </p>
          </div>
        </div>

        <div className="relative mb-12">
          <div className="p-6 bg-space-card border border-space-border rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">Pageviews Used</span>
                  <span className="text-text-primary font-medium">
                    {customerData.pageviews_used.toLocaleString()} / {customerData.pageviews_limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-space-dark rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-300"
                    style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-space-border">
                <div>
                  <p className="text-sm text-text-muted mb-1">Plan</p>
                  <p className="text-lg font-semibold capitalize">{customerData.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-1">Status</p>
                  <p className="text-lg font-semibold capitalize">
                    <span className={customerData.status === 'active' ? 'text-accent-green' : 'text-red-500'}>
                      {customerData.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 space-y-2">
          <p className="text-sm text-text-muted">
            Need help?{' '}
            <a
              href="mailto:hello@mapmyvisitors.com"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              hello@mapmyvisitors.com
            </a>
          </p>
          <p className="text-sm text-text-muted">
            Want multiple websites?{' '}
            <a
              href="mailto:hello@mapmyvisitors.com"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
