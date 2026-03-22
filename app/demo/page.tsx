'use client';

import { useEffect, useState } from 'react';
import InteractiveGlobe from '@/components/DemoGlobe';
import {
  Activity,
  ArrowRight,
  Check,
  Copy,
  Globe,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

type VisitorEvent = {
  city: string;
  country: string;
  flag: string;
  page: string;
  secondsAgo: number;
};

const FEED_TEMPLATES: Omit<VisitorEvent, 'secondsAgo'>[] = [
  { city: 'San Francisco', country: 'United States', flag: 'US', page: '/pricing' },
  { city: 'Berlin', country: 'Germany', flag: 'DE', page: '/blog/how-we-built-it' },
  { city: 'Singapore', country: 'Singapore', flag: 'SG', page: '/features' },
  { city: 'London', country: 'United Kingdom', flag: 'GB', page: '/about' },
  { city: 'Tokyo', country: 'Japan', flag: 'JP', page: '/docs/install' },
  { city: 'Paris', country: 'France', flag: 'FR', page: '/case-studies' },
  { city: 'Sao Paulo', country: 'Brazil', flag: 'BR', page: '/contact' },
  { city: 'Toronto', country: 'Canada', flag: 'CA', page: '/pricing' },
];

const INITIAL_FEED: VisitorEvent[] = [
  { ...FEED_TEMPLATES[0], secondsAgo: 9 },
  { ...FEED_TEMPLATES[3], secondsAgo: 24 },
  { ...FEED_TEMPLATES[1], secondsAgo: 38 },
  { ...FEED_TEMPLATES[4], secondsAgo: 57 },
  { ...FEED_TEMPLATES[2], secondsAgo: 76 },
  { ...FEED_TEMPLATES[6], secondsAgo: 103 },
  { ...FEED_TEMPLATES[5], secondsAgo: 132 },
];

const TOP_COUNTRIES = [
  { name: 'United States', visitors: 412, share: 34 },
  { name: 'United Kingdom', visitors: 188, share: 15 },
  { name: 'Germany', visitors: 153, share: 12 },
  { name: 'Japan', visitors: 139, share: 11 },
  { name: 'Canada', visitors: 104, share: 8 },
];

const TOP_PAGES = [
  { path: '/pricing', views: 398 },
  { path: '/features', views: 276 },
  { path: '/blog/how-we-built-it', views: 182 },
  { path: '/case-studies', views: 143 },
  { path: '/docs/install', views: 97 },
];

const INSTALL_SNIPPET = `<!-- Step 1: Add container (optional) -->
<div id="mapmyvisitors-widget"></div>

<!-- Step 2: Add widget script -->
<script src="https://mapmyvisitors.com/widget.js?id=DEMO1234ABCD"></script>`;

function timeAgoLabel(secondsAgo: number): string {
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  const mins = Math.floor(secondsAgo / 60);
  return `${mins}m ago`;
}

export default function DemoPage() {
  const [activeNow, setActiveNow] = useState(18);
  const [visitorsToday, setVisitorsToday] = useState(1247);
  const [countriesReached, setCountriesReached] = useState(42);
  const [feed, setFeed] = useState<VisitorEvent[]>(INITIAL_FEED);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeed((prev) => {
        const randomTemplate = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
        const aged = prev.map((item) => ({
          ...item,
          secondsAgo: Math.min(item.secondsAgo + 5, 3600),
        }));
        return [{ ...randomTemplate, secondsAgo: 4 }, ...aged].slice(0, 7);
      });

      setVisitorsToday((prev) => prev + (Math.random() < 0.7 ? 1 : 2));
      setActiveNow((prev) => {
        const next = prev + (Math.random() < 0.5 ? -1 : 1);
        return Math.max(8, Math.min(40, next));
      });
      setCountriesReached((prev) => {
        if (Math.random() < 0.15 && prev < 60) return prev + 1;
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-dark">
      <section className="pt-14 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-space-card border border-space-border mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 text-accent-blue" />
            <span className="text-sm text-text-secondary">Signature Demo Experience</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Give Your Website a
            <span className="block bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
              Global Presence in Seconds
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-6 sm:mb-8">
            A premium, visual-first experience designed for social proof. Your audience sees momentum, global
            reach, and brand credibility at a glance.
          </p>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
            <div className="px-4 py-2 rounded-xl bg-space-card border border-space-border text-sm text-text-secondary">
              <span className="text-accent-green font-semibold">{activeNow}</span> exploring right now
            </div>
            <div className="px-4 py-2 rounded-xl bg-space-card border border-space-border text-sm text-text-secondary">
              <span className="text-accent-blue font-semibold">{visitorsToday.toLocaleString()}</span> visits today
            </div>
            <div className="px-4 py-2 rounded-xl bg-space-card border border-space-border text-sm text-text-secondary">
              <span className="text-accent-purple font-semibold">{countriesReached}</span> markets reached
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl blur-3xl" aria-hidden="true"></div>
            <div className="relative rounded-3xl border border-space-border bg-space-card p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-2xl font-bold">Signature Globe Preview</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-accent-green/20 text-accent-green border border-accent-green/30">
                  Curated live simulation
                </span>
              </div>
              <InteractiveGlobe />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-space-border bg-space-card">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-sm text-text-muted mb-1">Live Audience</p>
            <p className="text-2xl font-bold">{activeNow}</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-space-border bg-space-card">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/15 text-accent-purple flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm text-text-muted mb-1">Today&apos;s Visits</p>
            <p className="text-2xl font-bold">{visitorsToday.toLocaleString()}</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-space-border bg-space-card">
            <div className="w-10 h-10 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <p className="text-sm text-text-muted mb-1">Countries Reached</p>
            <p className="text-2xl font-bold">{countriesReached}</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-space-border bg-space-card">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm text-text-muted mb-1">Average Visit Time</p>
            <p className="text-2xl font-bold">2m 18s</p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1 p-4 sm:p-6 rounded-2xl border border-space-border bg-space-card">
            <h3 className="text-xl font-semibold mb-4 sm:mb-5">Audience Spotlight</h3>
            <div className="space-y-2.5 sm:space-y-3">
              {feed.map((item, idx) => (
                <div key={`${item.city}-${item.page}-${idx}`} className="rounded-xl border border-space-border bg-space-dark p-2.5 sm:p-3">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-medium">
                      {item.city}, {item.country}
                    </p>
                    <span className="text-xs text-text-muted">{item.flag}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{item.page}</span>
                    <span className={idx === 0 ? 'text-accent-green animate-pulse' : ''}>{timeAgoLabel(item.secondsAgo)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 p-4 sm:p-6 rounded-2xl border border-space-border bg-space-card">
            <h3 className="text-xl font-semibold mb-4 sm:mb-5">Top Countries</h3>
            <div className="space-y-3.5 sm:space-y-4">
              {TOP_COUNTRIES.map((country) => (
                <div key={country.name}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-secondary">{country.name}</span>
                    <span className="font-medium">{country.visitors}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-space-dark overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-blue to-accent-purple"
                      style={{ width: `${country.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 p-4 sm:p-6 rounded-2xl border border-space-border bg-space-card">
            <h3 className="text-xl font-semibold mb-4 sm:mb-5">Most Viewed Pages</h3>
            <div className="space-y-2.5 sm:space-y-3">
              {TOP_PAGES.map((page) => (
                <div key={page.path} className="flex items-center justify-between rounded-xl border border-space-border bg-space-dark p-2.5 sm:p-3">
                  <span className="text-sm text-text-secondary">{page.path}</span>
                  <span className="text-sm font-semibold">{page.views}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="install" className="px-4 sm:px-6 pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 rounded-2xl border border-space-border bg-space-card">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Launch in One Elegant Snippet</h3>
            <p className="text-text-secondary mb-4">
              Designed for founders and lean teams who want premium social proof without analytics overhead.
            </p>
            <div className="rounded-xl bg-space-dark border border-space-border p-3 sm:p-4 mb-4 overflow-x-auto">
              <pre className="text-sm text-text-primary whitespace-pre-wrap">{INSTALL_SNIPPET}</pre>
            </div>
            <button
              onClick={handleCopy}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy snippet'}
            </button>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl border border-space-border bg-space-card">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">How It Comes to Life</h3>
            <div className="space-y-3.5 sm:space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-text-secondary">Place the script once and keep your site clean.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-text-secondary">Visitors are translated into elegant global signals.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-text-secondary">Your audience sees momentum, trust, and worldwide reach.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-14 sm:pb-20">
        <div className="max-w-6xl mx-auto rounded-3xl p-6 sm:p-10 md:p-14 text-center bg-gradient-to-r from-accent-blue to-accent-purple">
          <div className="inline-flex items-center gap-2 text-white/90 mb-4">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Crafted for premium brand presence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4">Elevate Your Website Presence Instantly</h2>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8">
            Lightweight insights. High-end visuals. A small widget that makes your growth feel unmistakably global.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <a
              href="/login"
              className="px-7 h-11 rounded-xl bg-white text-accent-blue font-semibold flex items-center gap-2 hover:bg-slate-100 transition-colors"
            >
              Get Your Widget
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/"
              className="px-7 h-11 rounded-xl border border-white/30 text-white font-semibold flex items-center hover:bg-white/10 transition-colors"
            >
              Back to Homepage
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
