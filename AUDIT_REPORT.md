# Audit and repair notes

## Scope and constraints

This audit is based on the checked-in source at commit `5b6ea1d008b1a2ecae5ed6fd325b0868e5c0672b`. No Firebase project, users, Firestore documents, Storage objects, or PostgreSQL resources were modified. The Firebase project remains `ywsf-al-zaka`. No secrets were added to Git.

## Prioritized findings

1. **Vercel API routing (critical runtime issue)** — `vercel.json` routed `/api/*` to a single function without preserving the Express endpoint path for the app. The Vercel handler now reconstructs the `/api/...` URL using the rewritten route query parameter and imports the named `appPromise`. The `server.ts` listen guard already excludes Vercel and AWS Lambda environments; it was retained.
2. **Admin bootstrap and trust boundary (critical security issue)** — `server.ts` currently assigns admin role using hard-coded email allowlists in both the client (`src/context/AuthContext.tsx`) and API profile creation (`server.ts`). Admin checks should use server-controlled custom claims or a server-only allowlist environment variable, and client-provided profile roles must never elevate access. A full account-safe migration of this authorization policy needs confirmation of the current production admin identities and external Firebase configuration; this change set does not reassign existing accounts.
3. **Billing proof validation and idempotency (critical financial issue)** — `server.ts` accepts an HMAC-signed proof but does not bind the proof payload to the authenticated UID, requested tier, amount, expiration, or a unique transaction, and no payment gateway verification is implemented. The UI (`src/components/PricingModal.tsx`) sends no proof, so legitimate tier upgrades are rejected. Do not enable/advertise paid upgrades until an actual gateway integration and replay protection are configured.
4. **Credit double charge / partial writes (high)** — AI endpoints call the provider, deduct credits, then write project records separately. Replayed requests can generate duplicate work and failures after deduction or project write can produce inconsistent outcomes. Add server-generated idempotency keys and transactional ledger/job state before treating this as production-safe.
5. **Gemini model/video contract (high)** — `server.ts` references model identifiers such as `gemini-3.8-flash`, `gemini-4-argon`, and `gemini-omni-1.1-flash`. Text success is incorrectly represented as video readiness in `/api/ai/test-connection`; only an actual supported video-generation request can establish that capability. No live call was made in this environment, so names and video support remain unverified and should be checked against current Google documentation/account entitlements before enabling.
6. **SSRF and uploaded media (high)** — URL fetchers in `server.ts` do not validate resolved IP addresses, and the scraper follows redirects without revalidating their destinations. The Firebase Storage helper falls back to inline data on upload failure and attempts to make objects public. Restrict fetches to public IPs on every redirect, cap streamed bytes, and use authenticated/private Storage access rather than public ACLs. The current `/api/upload` returns inline data and does not actually upload an object.
7. **Firebase Admin deployment credentials (high)** — `server.ts` supports `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`, but falls back to `initializeApp({ projectId })`; project ID alone is not credentials. Configure server-side credentials in Vercel Environment Variables as described below. Keep the Firebase project and existing data intact.
8. **Database ownership (medium)** — Express API uses Firebase Admin Firestore (`server.ts`). PostgreSQL/Drizzle code is separately present in `src/db/index.ts`, `src/db/schema.ts`, and `src/db/users.ts`; this audit did not establish that it is unused, so neither the code nor database configuration was removed.
9. **Firestore rules vs API usage (medium)** — The API uses Firebase Admin, which bypasses Firestore client security rules. Client code also accesses the `users` collection directly for profile creation/reads. Rules should be tested with the Firebase Emulator and aligned deliberately; they were not loosened because doing so could expose user/account data.

## Firebase/Vercel configuration

Keep `FIREBASE_PROJECT_ID=ywsf-al-zaka`.

Set these as **server-side** Vercel Environment Variables (Production/Preview as applicable), never in Git or `VITE_*` variables:

- `FIREBASE_PROJECT_ID`: `ywsf-al-zaka`
- `FIREBASE_CLIENT_EMAIL`: service-account client email from Google Cloud IAM
- `FIREBASE_PRIVATE_KEY`: service-account private key; paste the full PEM value and preserve newlines (the server normalizes escaped `\\n`)
- `FIREBASE_STORAGE_BUCKET`: the existing project's bucket, `ywsf-al-zaka.firebasestorage.app`, if that is the bucket configured in Firebase Storage
- `GEMINI_API_KEY`: server-side Google AI API key

Create/rotate or select a least-privilege service account in Google Cloud IAM, then add values under Vercel Project Settings → Environment Variables. Do not commit the service-account JSON or send secrets in chat. The Firebase web API key in `firebase-applet-config.json` is a public client configuration value, not an Admin credential; it is not sufficient to authenticate the server.

## Tests

Added `npm run test:api` for a running local server. It checks `/api/health` and expected unauthenticated rejection on `/api/projects`, `/api/auth/me`, `/api/admin/stats`, and subscription. It does not create accounts or mutate production records.

No commands were run in this GitHub-editing session: this environment provides repository read/write APIs but no shell, package manager, local filesystem, or network access to run `npm install`, `npm run lint`, `npm run build`, or the smoke test. These results must be run in CI or a local checkout before merge.

## Not tested / external prerequisites

- Firebase Authentication registration/login/password reset with real Firebase users.
- Firebase Admin credentials, Firestore transactions/rules, Storage permissions, and existing data.
- Actual Gemini text, Imagen, or video generation and model availability.
- Payment gateway signatures, settlement, refund, and replay handling.
- End-to-end Vercel deployment/runtime and function time limits.
- `npm install`, TypeScript lint, Vite production build, and the API smoke suite.
