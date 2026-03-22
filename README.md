# MapMyVisitors

MapMyVisitors is a small SaaS tool that helps creators add a **“wow-factor” 3D globe widget** to any website.

Users paste one script tag, and their visitors appear on a rotating globe with lightweight live stats.

---

## Why this project is interesting (frontend-focused)

This project demonstrates practical frontend engineering beyond basic UI components:

- Building a **safe embeddable widget** (`public/widget-src.js`) that runs on unknown host websites
- Integrating an imperative visualization library (**globe.gl**) with lifecycle/cleanup handling
- Real-time UX with **SSE stream + polling fallback** for reliability
- Mobile-first responsive polish across marketing, auth, dashboard, and demo pages
- Strong DX hygiene: type safety, linting, and production build checks

---

## Live product concept

### Customer embed (one line)

```html
<script src="https://mapmyvisitors.com/widget.js?id=USER_WIDGET_ID"></script>
```

### End-to-end flow

1. The widget resolves `widgetId` from script URL or data attribute
2. It sends a fire-and-forget track event to `POST /api/track`
3. Backend stores location data in Supabase
4. Widget renders dots on globe.gl
5. Widget receives updates through:
   - `GET /api/visitors/[widgetId]/stream` (SSE), or
   - `GET /api/visitors/[widgetId]` polling fallback

---

## Core features

- **Embeddable 3D globe widget**
- **Live-looking visitor updates**
- **Minimal analytics** (active now, visitors today, countries reached)
- **Payment gating** and watermark behavior
- **Customer dashboard + login/recovery flows**
- **Rich demo page** with hardcoded marketing simulation (`/demo`)

---

## Tech stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Visualization:** globe.gl (external script)
- **Backend/API:** Next.js Route Handlers
- **Database:** Supabase (Postgres + RLS)
- **Build tooling:** esbuild (for embeddable widget)

---

## Project structure

```text
app/
  api/
    track/route.ts
    visitors/[widgetId]/route.ts
    visitors/[widgetId]/stream/route.ts
    verify-license/route.ts
  page.tsx
  demo/page.tsx
  login/page.tsx
  dashboard/page.tsx
  recover/page.tsx

components/
  DemoGlobe.tsx

public/
  widget-src.js    # source for embeddable runtime
  widget.js        # built production widget

supabase/
  migrations/*.sql
  SQL_SETUP_FOR_SUPABASE_EDITOR.sql
```

---

## Important implementation decisions

### 1) Next.js over React + Vite
This project needs both frontend pages and backend APIs (tracking, auth, and visitor data), so Next.js keeps product and API in one codebase and deployment path.

### 2) SSE + polling fallback
The widget prefers SSE for near-real-time updates, but automatically falls back to polling for compatibility and reliability across environments.

### 3) Defensive embeddable runtime
The widget uses an IIFE, strict validation, guarded network logic, and cleanup handlers so it does not break host pages.

### 4) Atomic monthly counters
Monthly pageview increments use a DB RPC (`increment_monthly_pageviews`) to avoid race conditions from concurrent writes.

---

## Local setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy:

```bash
cp .env.example .env.local
```

Fill required keys in `.env.local`:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `GUMROAD_PRODUCT_ID`

### 3) Set up Supabase schema

Use either:

- Existing migration files in `supabase/migrations/`, or
- One-shot SQL file for SQL Editor:
  - `supabase/SQL_SETUP_FOR_SUPABASE_EDITOR.sql`

### 4) Run the app

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Scripts

```bash
npm run dev          # start Next.js dev server
npm run build:widget # build public/widget.js from widget-src.js
npm run watch:widget # watch mode for widget build
npm run build        # build widget + Next.js production build
npm run start        # run production server
npm run lint         # ESLint checks
npm run typecheck    # TypeScript checks
```

---

## API routes (selected)

- `POST /api/track`  
  Validates request, resolves geo IP, inserts visitor event, enforces monthly limits.

- `GET /api/visitors/[widgetId]`  
  Returns formatted visitors + summary counts used by widget.

- `GET /api/visitors/[widgetId]/stream`  
  SSE stream endpoint for push-style updates with deduped snapshots.

- `POST /api/verify-license`  
  Verifies license, provisions customer/user linkage, sets auth cookie.

---

## Frontend quality notes

- Responsive improvements were applied across all major routes for mobile browsers
- Demo page intentionally uses hardcoded data to simulate product experience
- Widget runtime includes robust lifecycle cleanup (timers, listeners, observers, fetch aborts)

---

## Current status

This repository branch includes:

- Working widget build pipeline (`widget-src.js` → `widget.js`)
- Stream-enabled live updates with fallback behavior
- Recruiter-ready demo and polished responsive UI
- Supabase SQL setup script for quick environment bootstrap

---

## License

Private project / portfolio codebase.