# MapMyVisitors

[![Live Demo](https://img.shields.io/badge/Live%20Demo-map--my--visitors.vercel.app-black?style=flat&logo=vercel)](https://map-my-visitors.vercel.app/demo)

> Add a real-time 3D globe to any website with one script tag — your visitors appear as glowing dots as they land.

## Built with

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

## Highlights

- **Embeddable widget** — a self-contained IIFE (`public/widget.js`) built with esbuild, designed to run safely on unknown host pages: no global pollution, guarded DOM ops, full cleanup of timers, fetch aborts, and event listeners on teardown
- **Real-time updates** — SSE stream with hash-based deduplication (no-op events are suppressed) and keepalive pings to survive proxy timeouts; widget falls back to polling automatically if SSE fails
- **Full-stack in one repo** — Next.js App Router handles both the React UI and all API routes; Supabase Postgres stores visitor geo data with RLS enabled throughout
- **License-gated access** — Gumroad license verification provisions a customer record, sets an auth cookie, and gates the widget behind payment; watermark is removed on upgrade
- **Production-aware API** — widget ID format validation before any DB query, in-memory rate limiters with bounded maps, atomic monthly counter increments via DB RPC to prevent race conditions, and `server-only` on the Supabase service client to prevent accidental client-side exposure

> **Note:** the live demo at `/demo` uses simulated data — the full tracking pipeline is built and ready, the product is currently in pre-launch.

## How it works

A customer pastes one script tag onto their site:

```html
<script src="https://mapmyvisitors.com/widget.js?id=YOUR_WIDGET_ID"></script>
```

The widget fires a tracking event on each page load → the API resolves the visitor's location via GeoIP and writes it to Supabase → the widget receives updates via SSE (or polling fallback) and renders the visitor's coordinates as a dot on the globe.

## Local setup

<details>
<summary>Prerequisites · environment variables · running locally</summary>

**Prerequisites:** Node.js 18+, npm

```bash
npm install
cp .env.example .env.local
```

**`.env.local`**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...                  # min 32 chars
RESEND_API_KEY=...
GUMROAD_PRODUCT_ID=...
```

**Supabase schema:** run `supabase/SQL_SETUP_FOR_SUPABASE_EDITOR.sql` in your Supabase SQL editor.

```bash
npm run dev          # start Next.js dev server → http://localhost:3000
npm run build:widget # build the embeddable widget separately
npm run build        # widget + Next.js production build
```

</details>
