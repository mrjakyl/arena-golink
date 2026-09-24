# Arena Path

Shared, memorable shortcuts to your team’s resources. Create `wiki` pointing to your team’s documentation, then open `https://surfingcowarena.com/wiki`. With the browser shortcut configured, type **go → Tab → wiki → Enter**.

The directory lets teammates search, create, edit, and delete links. Unknown shortcuts open a creation form with the name filled in. Editing a destination keeps its shortcut intact. A new installation starts empty.

## Access and stack

- Google sign-in is required for the directory, setup, redirects, and link APIs. Only verified Google emails matching configured team domains or individual addresses are accepted.
- Every approved teammate can create, edit, or delete any link. There are no personal owners or separate administrator roles.
- Next.js App Router, React, TypeScript, and Radix Themes; Neon Postgres stores links and shared mutation counters. Vercel hosts the app.
- The SQLite prototype has been replaced. Existing `data/*.sqlite` files are not read or imported; this release is intended to start with an empty Postgres database.

See [deployment and operations](docs/deployment.md) for Vercel, Google OAuth, Cloudflare, migrations, and recovery. [PLAN.md](PLAN.md) records the current product behavior and launch criteria.

## Local setup

Use Node **22.12 or newer within 22.x**; `.nvmrc` selects Node 22. Local development needs its own Neon database and Google OAuth configuration. There is no authentication bypass.

```bash
nvm use
npm ci
cp .env.example .env.local
```

Fill in `.env.local` using the table below. Generate a session secret with `openssl rand -base64 32`, and register a Google OAuth **Web application** client with this authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Then initialize the database and start the app:

```bash
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`, sign in using an allowed Google account, and select **New link**. Use that hostname consistently: mutation requests must come from the origin configured in `NEXTAUTH_URL`.

## Environment variables

All variables are server-side. Keep local values in the gitignored `.env.local`; put deployed values in Vercel’s environment settings. Never commit credentials.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string for this environment, including TLS options supplied by Neon. |
| `NEXTAUTH_URL` | Canonical app origin, with no path: `http://localhost:3000` locally; `https://surfingcowarena.com` in production. |
| `NEXTAUTH_SECRET` | Random session-signing/encryption secret; use a different secret per environment. Rotating it invalidates existing sessions. |
| `GOOGLE_CLIENT_ID` | Google OAuth Web application client ID. |
| `GOOGLE_CLIENT_SECRET` | Corresponding Google OAuth client secret. |
| `AUTH_ALLOWED_DOMAINS` | Comma-separated exact email domains, without `@`, protocols, or wildcards. Subdomains are not implicitly included. |
| `AUTH_ALLOWED_EMAILS` | Comma-separated full Google email addresses, useful for individual teammates or guests. |

At least one allowlist must contain an entry. The two lists are combined; entries are trimmed and compared without case sensitivity. Empty allowlists deny everyone. Membership is rechecked on each authenticated request, so removing an entry takes effect for existing sessions too. Sessions last up to eight hours.

If sign-in configuration is missing, the login page reports that sign-in is unavailable and private endpoints remain inaccessible. A successful build does not mean runtime credentials or database migrations are configured.

## Routes and shortcuts

| Route | Behavior |
| --- | --- |
| `/` | Team directory; filter by name, description, or destination URL. |
| `/new` | Create a shortcut; accepts `?name=wiki` to prefill the name. |
| `/edit/{name}` | Edit the URL or description; names are immutable. |
| `/{name}` and `/go/{name}` | After sign-in, issue a non-cached HTTP 302 to the saved URL, or to `/new?name=…` when missing. |
| `/setup` | Chrome, Edge, and Firefox browser-shortcut instructions. |
| `/login` | Google sign-in; preserves the original internal destination. |
| `/api/auth/*` | Sign-in, callback, session, and sign-out endpoints. |
| `/api/links` | Authenticated `GET` list and `POST` create. |
| `/api/links/{name}` | Authenticated `GET`, `PATCH`, and `DELETE`. |
| `/health` | Public database readiness probe: HTTP 200 with `{ "ok": true }`, or HTTP 503 with `{ "ok": false }`. |

The production browser search template is `https://surfingcowarena.com/%s`. The keyword is `go`: this is a browser search shortcut, so literal hostname resolution for `go/wiki` is not provided. Safari users can open shortcuts directly or use the directory.

Names contain 1–64 lowercase letters, digits, or hyphens and start/end with a letter or digit. App route names are reserved. URLs must explicitly use HTTP or HTTPS, contain no credentials or control characters, and fit within 4,096 characters after URL serialization. Descriptions have a 500-character limit.

The API retains the link fields `name`, `url`, `description`, `createdAt`, and `updatedAt`. Mutations require an authenticated session and an `Origin` matching `NEXTAUTH_URL`; create/update also require a JSON object with `Content-Type: application/json`. The request body limit is 32 KiB. Each teammate has a shared limit of 60 mutation attempts per minute across all app instances; a 429 response includes `Retry-After: 60`.

## Checks

These checks need no real Google credentials or hosted database:

```bash
npm run lint
npm run typecheck
npm test
npm audit --omit=dev --audit-level=moderate
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite starts the production build on `127.0.0.1:4318`; run the build first and keep that port free. CI installs Chromium’s Linux dependencies too.

Unit/integration tests exercise real Postgres SQL through an in-memory PGlite engine while substituting the Neon transport. Browser tests use local test credentials, signed fixture sessions, and a stub for the external Google authorization page. They verify access controls, setup, and sign-out, but do **not** establish that live Google OAuth, Neon networking, or Vercel deployment works. Complete the [live preview checklist](docs/deployment.md#verify-a-live-preview) before launch.
