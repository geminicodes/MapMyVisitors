# BUGS_FIXED.md

This file records production-readiness issues found during audit and the fixes applied.

Format:

```
File: path/to/file.ts
Line: 42
Severity: Critical/High/Medium/Low
Issue: ...
Fix: ...
Why: ...
```

---

File: lib/auth.ts  
Line: 4  
Severity: Critical  
Issue: JWT signing used an insecure hardcoded fallback secret (`your-secret-key-change-this`) when `JWT_SECRET` was missing.  
Fix: Removed fallback; added `getJwtSecret()` that enforces minimum length and fails closed.  
Why: Shipping with a default secret makes tokens forgeable and breaks authentication/authorization guarantees.

File: lib/token.ts  
Line: 3  
Severity: Critical  
Issue: Magic link tokens were signed with an empty string when `JWT_SECRET` was unset, making signatures trivially forgeable.  
Fix: Enforced `JWT_SECRET` (min length) at call-time; verification now returns `null` on invalid payload shapes.  
Why: Empty/weak secrets compromise account access via magic-link flow.

File: lib/supabase.ts  
Line: 5  
Severity: High  
Issue: Server client silently fell back to the public anon key when service role key was missing, changing security semantics and causing unpredictable behavior.  
Fix: Require `SUPABASE_SERVICE_ROLE_KEY` explicitly and mark module `server-only`.  
Why: Silent fallback can lead to broken data mutations or accidental privilege changes; server-only prevents accidental client bundling.

File: next.config.js  
Line: 2  
Severity: High  
Issue: ESLint was ignored during production builds (`ignoreDuringBuilds: true`).  
Fix: Removed build-time ESLint suppression.  
Why: Hiding lint failures allows unsafe patterns and regressions to ship.

File: lib/email.ts  
Line: 3  
Severity: High  
Issue: Email client used a dummy API key at import-time, risking silent “success” in misconfigured environments.  
Fix: Lazy-init Resend client; fail gracefully with a clear error when `RESEND_API_KEY` is missing.  
Why: Production must not send emails with invalid credentials or mask configuration errors.

File: app/api/visitors/[widgetId]/route.ts  
Line: 151  
Severity: Critical  
Issue: Response shape didn’t match the embeddable widget’s expectations (`public/widget-src.js` expects top-level `visitors` / `paid` / `showWatermark`).  
Fix: Returned top-level `visitors`, `paid`, `showWatermark`, `totalToday`, `activeNow`; added safe limit parsing.  
Why: Mismatched response shape breaks the widget UI (no data / incorrect watermark behavior).

File: app/api/visitors/[widgetId]/route.ts  
Line: 143  
Severity: High  
Issue: `limit` could become `NaN` and be passed to Supabase `.limit()`.  
Fix: Sanitized `limit` with `Number.isFinite` and enforced bounds.  
Why: Avoids runtime failures and ensures predictable behavior.

File: app/api/visitors/[widgetId]/route.ts  
Line: 126  
Severity: Medium  
Issue: `totalToday` / `activeNow` were computed from the limited visitors list, producing incorrect metrics.  
Fix: Added count-only queries independent of the visual limit.  
Why: Dashboard/widget metrics must not depend on pagination/visualization limits.

File: app/api/track/route.ts  
Line: 48  
Severity: High  
Issue: Monthly pageview increment logic was non-atomic and race-prone under concurrency (select/update/insert).  
Fix: Switched to DB-side atomic function `increment_monthly_pageviews` via `supabase.rpc(...)`; also normalized month to UTC start.  
Why: Prevents undercounting/overcounting and data corruption under concurrent tracking events.

File: app/api/verify-license/route.ts  
Line: 6  
Severity: High  
Issue: Endpoint required `GUMROAD_API_TOKEN` even though it was unused and not required for Gumroad license verification.  
Fix: Removed the unnecessary requirement; kept `GUMROAD_PRODUCT_ID` as required.  
Why: Misconfigured env gating caused avoidable production outages for license verification.

File: app/api/* (multiple)  
Line: Various  
Severity: Medium  
Issue: Unbounded in-memory rate-limit maps could grow without bound and leak memory over time.  
Fix: Introduced `lib/rate-limit.ts` with pruning and per-route limiters.  
Why: Prevents memory growth in long-lived Node processes; still best-effort in serverless.

File: app/api/* and lib/* (multiple)  
Line: Various  
Severity: Low  
Issue: Direct `console.log` usage and verbose logging patterns in production paths.  
Fix: Introduced `lib/logger.ts` and migrated key routes/libs to it; removed noisy info logs where possible.  
Why: Centralized logging makes it easier to control verbosity and avoid leaking sensitive info.

File: .env.example  
Line: 1  
Severity: Medium  
Issue: No documented environment variable template existed.  
Fix: Added `.env.example` covering all required runtime configuration keys.  
Why: Prevents deploy-time crashes and misconfiguration.

File: package.json / package-lock.json  
Line: 1  
Severity: High  
Issue: `npm audit` reported high severity command-injection vulnerability in a transitive `glob` dependency pulled in by `eslint-config-next`.  
Fix: Added an npm `overrides` pin to `glob@10.5.0` and updated lockfile.  
Why: Eliminates known vulnerable transitive dependency without requiring a major Next.js upgrade.

File: components/DemoGlobe.tsx  
Line: 1  
Severity: Medium  
Issue: Multiple lint/type issues (`any`, unused refs/vars, missing hook deps) and missing cleanup of DOM event listeners.  
Fix: Added minimal type definitions for `globe.gl`, stabilized demo data with `useMemo`, fixed deps, and ensured interaction listeners are removed during cleanup.  
Why: Prevents runtime leaks and ensures strict TypeScript and ESLint pass.

File: app/* and components/ui/* (multiple)  
Line: Various  
Severity: Low  
Issue: Lint failures due to unused variables and unescaped JSX entities.  
Fix: Removed unused catch bindings, replaced problematic quotes/apostrophes with HTML entities, and simplified prop signatures where props were unused.  
Why: Keeps CI/build green and avoids subtle rendering/escaping issues.

