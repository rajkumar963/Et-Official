# ET Trader

A trading journal built from the supplied Stitch designs and the separated architecture specification. Next.js renders the interface; Express owns authentication, MongoDB access, trades, profile updates, and analytics.

## Project structure

```text
frontend/                        Next.js 16, React 19, TypeScript, Tailwind 4, Recharts
  src/
    app/                         Routes only — thin pages that compose feature components
      (marketing)/               /, /contact, /courses (route group, no URL segment)
      (auth)/                    /login, /signup
      dashboard/                 Authenticated area; layout checks the session server-side
    components/                  Shared, feature-agnostic building blocks
      ui/                        Brand, Modal, PageHeading, StatCard
      charts/                    Equity, outcomes, daily P&L, behavioral radar, sparkline
      effects/                   Motion helpers (CountUp, reveal, spotlight) and market canvas
    features/                    One folder per domain: components + API calls + helpers
      auth/                      auth.api.ts, components/auth-form
      journal/                   journal-provider (dashboard state), dashboard-shell, overview
      trades/                    trades.api.ts, export-csv.ts, trade form/table/ledger view
      calendar/                  42-cell trade calendar
      analytics/                 analytics.api.ts, analytics view
      settings/                  settings.api.ts, settings view
      marketing/                 Landing page, dashboard preview, navbar/footer, contact,
                                 courses/e-books (components/, data/, styles/)
    config/                      env.ts (public env vars), site.ts (contact channels)
    lib/                         api-client (fetch + session refresh), format helpers
backend/                         Express 5, TypeScript, Mongoose
  src/
    app.ts / server.ts           Express app (importable by tests) / process entry point
    config/                      Validated environment and database connection
    middleware/                  require-auth, check-origin (CSRF), error-handler
    models/                      User, Trade, revocable Session (+ DTO mappers)
    modules/                     One folder per domain: routes → controller → service → repository
      auth/                      Password auth, tokens/cookies, Google OAuth
      trades/                    Trade CRUD scoped to the session user
      analytics/                 API and pure analytics engine (calculations.ts)
      users/                     Profile and starting balance
    scripts/                     Explicit, idempotent demo seed
    utils/                       HttpError
  tests/
    unit/                        Pure logic and schema contracts (no database)
    integration/                 Full API workflow against a real MongoDB
  tsconfig.json                  Type-checks src + tests (no emit)
  tsconfig.build.json            Production build of src → dist
packages/shared/                 Zod contracts and public DTO types shared by both apps
tests/e2e/                       Playwright desktop and mobile workflows
docs/                            Verification notes
docker-compose.yml               Optional local MongoDB
```

## Requirements and quick start

Use Node.js **22.13+** (or Node.js 24 LTS), npm, and MongoDB 7+. On Windows PowerShell where execution policy blocks `npm.ps1`, use `npm.cmd` in place of `npm`.

From this folder:

```sh
npm install
npm run build -w @et-trader/shared
```

Copy `backend/.env.example` to `backend/.env`, and `frontend/.env.example` to `frontend/.env.local`. Generate a unique secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and put it in `JWT_ACCESS_SECRET`. Set `NEXT_PUBLIC_CONTACT_EMAIL` in the frontend env file to enable the contact form. Local environment files are ignored by Git; never commit secrets. The build session has already created local env files with a random secret.

Start your installed MongoDB, or run:

```sh
docker compose up -d
npm run dev
```

Open **http://localhost:3000**. The independent API is **http://localhost:4000/api/v1**, with readiness at `/health`. You can also run `npm run dev:frontend` and `npm run dev:backend` in separate terminals. Both workspace scripts work independently after the shared package is built. Rebuild the shared package after changing its contracts.

New accounts start empty. To populate an explicit demo account:

```sh
npm run seed
```

Sign in with `demo@et-trader.local` / `JournalDemo2026!`. The seed inserts only when this demo account has no trades. Do not run it against production. Landing-page charts are explicitly labeled illustrative data; authenticated dashboards always use API data.

## Features

- Responsive landing page, signup, login, logout and Google OAuth integration.
- Overview with six performance cards, equity chart, outcome donut, recent executions and behavioral radar.
- Sunday-first, six-week calendar with month navigation, Today, daily review, and correctly distinct positive, negative, breakeven and empty states.
- Shared create/edit form with explicit trading date, prices, quantity, strategy, notes and tags. Inspection dialog, clipboard trade summary, confirmed delete, search, direction/outcome/date filters, pagination and CSV export.
- Analytics with average/biggest wins and losses, symbol frequency, best/worst days and daily P&L.
- Profile and starting capital settings. Successful mutations refresh the central journal data and analytics.

## Environment and MongoDB Atlas

Backend settings are documented in `backend/.env.example`; startup validates the secret and URLs. For Atlas, create a database user restricted to the journal database, allow the backend deployment's network, and set `MONGODB_URI` to your Atlas connection string. URL-encode credentials. Database credentials belong exclusively in the backend environment.

The default local URI uses `127.0.0.1` to avoid IPv6 resolution mismatches on Windows. Backend startup waits for MongoDB and fails clearly if it cannot connect; health returns 503 when disconnected.

## Google sign-in setup

1. In Google Cloud Console, configure an OAuth consent screen and create a Web application OAuth client. Add test users if the app is in testing.
2. Set the authorized redirect URI to `http://localhost:4000/api/v1/auth/google/callback` exactly.
3. Put `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` in the backend `.env`; restart the backend.

The backend generates and validates a short-lived HttpOnly state cookie, exchanges the code server-side and verifies Google's identity token and verified email. An email/password account cannot be silently linked by matching email. Missing Google credentials do not prevent email authentication. A real OAuth round trip requires your Google credentials and consent configuration.

## API and authentication

All APIs live under `/api/v1`. Responses are `{ data: ... }` or `{ error: { message: ... } }`.

| Method               | Path                                    | Purpose                               |
| -------------------- | --------------------------------------- | ------------------------------------- |
| POST                 | `/auth/signup`, `/auth/login`           | Credentials authentication            |
| GET                  | `/auth/google`, `/auth/google/callback` | Google OAuth                          |
| GET                  | `/auth/me`                              | Current session's public user         |
| POST                 | `/auth/refresh`, `/auth/logout`         | Rotate or revoke session              |
| GET / POST           | `/trades`                               | List or create owned trades           |
| GET / PATCH / DELETE | `/trades/:id`                           | Inspect, update or delete owned trade |
| GET                  | `/analytics/summary`                    | Current user's computed analytics     |
| GET / PATCH          | `/users/me`                             | Profile and starting balance          |
| GET                  | `/health`                               | API/database readiness                |

The optional trade month filter is zero-indexed: `?month=9&year=2026` means October 2026. Supply both parameters. The journal loads all records for current charts and client-side filters; server pagination is a future improvement for very large accounts.

Passwords are bcrypt-hashed with 12 rounds. The backend issues a 15-minute access JWT and a random seven-day refresh token in HttpOnly cookies. Only a SHA-256 hash of the refresh token is stored. Access JWTs reference a database session, so logout invalidates captured access cookies too. Refresh atomically consumes the old session before issuing new cookies. Tokens never go into localStorage. MongoDB TTL removes expired sessions.

The dashboard layout checks the backend session on server navigation. Expired access cookies with a refresh cookie defer to the credentialed browser client to rotate the session; protected data is only rendered after API authorization. Every trade query is scoped to the verified session user. Invalid or foreign IDs cannot access other accounts' trades.

Write requests require an `Origin` matching `FRONTEND_URL`; command-line API clients must include that header. CORS allows only that configured origin with credentials. Login/signup/refresh are rate-limited. Request bodies are size-limited and parsed through shared Zod schemas.

## Analytics rules

- Win rate = positive trades / all trades, including breakeven, × 100. Profit factor is gross positive P&L / absolute gross negative P&L; `null` means no losses (displayed as ∞ when there are wins, or — when empty).
- Best/worst days use aggregate daily net, and can both be positive or negative if all days have the same sign. The equity series starts at starting balance and adds chronological daily totals.
- A streak counts the latest consecutive trading days of the same nonzero sign. A neutral day stops it; an empty journal or most recent neutral day has type `neutral`, count 0. Days without trades are skipped.
- Canonical `YYYY-MM-DD` strings define trading dates; no UTC conversion shifts a trade into another day.
- Behavioral scores are deterministic **heuristics**, clamped to 0–100: Discipline = percentage with notes; Risk Management = 40 × average win / absolute average loss (100 with wins and no losses); Timing = win rate; Consistency = 100 / (1 + coefficient of variation of absolute daily P&L); Strategy = percentage with a strategy; Psychology = 50 + 30 × note coverage + 4 × signed current streak. Empty journals score zero. These names are reflection prompts and do not measure clinical psychology or validated skill.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npm run test:unit   # no database needed
npm test            # unit + MongoDB integration tests
npm run test:e2e
```

API integration tests require MongoDB and use `et-trader_test` by default, or `TEST_MONGODB_URI`. They use unique users and delete only records they created. Tests cover unauthorized access, cross-user reads/edits/deletes, origin enforcement, invalid dates, month filters, daily neutrality, balance shifts, refresh, login and revocation.

For end-to-end tests, start both services first and install Playwright Chromium if missing (`npx playwright install chromium`). E2E creates distinct test accounts through the signup UI, logs and edits a trade, checks 42 calendar cells, updates the baseline, and deletes the trade on desktop and mobile. E2E accounts remain for debugging; use a dedicated development database for browser tests. See [`docs/VERIFICATION.md`](docs/VERIFICATION.md) for the actual checks performed during this build.

## Production deployment

Build with `npm run build`, then run `npm run start -w @et-trader/backend` and `npm run start -w @et-trader/frontend` as independently managed processes. Provision MongoDB separately. Prefer a reverse proxy with the frontend at `https://journal.example.com` and the API at `https://journal.example.com/api/v1`; route `/api/v1/*` to Express and everything else to Next.js. Set `FRONTEND_URL` and build-time `NEXT_PUBLIC_API_URL` accordingly. Use `NODE_ENV=production`, `COOKIE_SECURE=true`, TLS, a random deployment secret, database backups, and a process supervisor.

Cookies use SameSite=Lax and host-only scope. Keep frontend and API same-origin (recommended) or on the same site. Unrelated domains need a reviewed SameSite=None/Secure cookie and CSRF configuration; the current code intentionally targets same-site deployments. Browser CORS and backend origin checks must match the exact frontend origin. Google callback URLs must be registered for the deployed backend. Configure proxy trust deliberately if deploying rate limits behind a proxy; do not blindly trust client-supplied forwarding headers.

This is a working local implementation, not a claim of a completed production security audit. Before public use, configure real OAuth, operational monitoring, account recovery/email verification, distributed rate-limit storage, retention controls, and production infrastructure appropriate to your needs.
