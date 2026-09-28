# Arena Path

Shared shortcuts to your team’s resources. Create `wiki` pointing at your documentation, then open `https://surfingcowarena.com/wiki` or use **go → Tab → wiki → Enter** after browser setup.

The directory supports search, create, edit, and delete. Both `/{name}` and `/go/{name}` issue non-cached HTTP 302 redirects. Unknown shortcuts open a prefilled creation form. All approved teammates can edit any link; names stay fixed when destinations change.

## What’s ready

- Next.js/React app with the existing Radix UI and Google team sign-in.
- Neon Postgres storage and explicit migrations, suitable for Vercel. A new database starts empty; old SQLite files are not imported.
- Fixes for invalid redirect URLs, repeated name query parameters, and stale directory data.
- Small regression tests using Node’s built-in runner; no additional test framework, linter, or CI configuration.

## 8-BIT NBA

`public/game/` contains a self-contained, fan-made 8-bit arcade basketball game (pure HTML/JS/CSS, no dependencies or build step). Open `/game` — which redirects to `/game/index.html` — for 1P vs CPU (three difficulties) or 2P on one keyboard. Controls and options are listed below the court.

**Handoff:** credentials, the Vercel project, team allowlist, DNS changes, and live preview verification are deferred. Nothing has been deployed. Missing authentication configuration denies private access.

## Run locally

Use Node 22.12 or newer within 22.x (`nvm use` selects Node 22):

```bash
npm ci
cp .env.example .env.local
```

Fill in `.env.local` with a development Neon database and Google OAuth Web application client. Register `http://localhost:3000/api/auth/callback/google` as its authorized redirect URI. Generate a session secret with `openssl rand -base64 32`.

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string, including its TLS options. |
| `NEXTAUTH_URL` | `http://localhost:3000` locally; `https://surfingcowarena.com` in production. |
| `NEXTAUTH_SECRET` | Random secret, distinct for each environment. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth client credentials for that environment. |
| `AUTH_ALLOWED_DOMAINS` | Comma-separated exact email domains, without `@` or wildcards. |
| `AUTH_ALLOWED_EMAILS` | Comma-separated full Google addresses for individual access. |

At least one allowlist must have an entry. Google emails must be verified; domain matching does not include subdomains. Membership is checked on each authenticated request. Keep credentials in the gitignored environment file or Vercel settings.

```bash
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`, sign in, and create a link. Use the hostname in `NEXTAUTH_URL` consistently: mutations require its exact origin. Local development requires real Google/Neon configuration; there is no login bypass.

## Deploy to surfingcowarena.com

1. Create a Vercel project for this repository using the Next.js preset, repository root, Node 22.x, `npm ci`, and `npm run build`. Default output settings are sufficient.
2. Create separate Neon databases or branches for development, preview, and production. Configure the variables above in their corresponding Vercel environments. Use a stable preview hostname and its own `NEXTAUTH_URL`, secret, and Google callback.
3. Register the production Google callback **`https://surfingcowarena.com/api/auth/callback/google`**. Configure the real team allowlist; the app’s hostname does not determine which email domains are allowed. Ensure the Google consent screen permits your team or lists them as test users.
4. Apply migrations to the selected database before serving traffic. Locally, `npm run db:migrate` reads `.env.local`. For preview, use `node --env-file=.env.preview.local scripts/migrate.mjs` with the target connection string in that gitignored file. Clear any old shell-exported `DATABASE_URL`, which takes precedence over file values. Run one migration job at a time. Applied files are recorded and skipped on reruns; migrations are deliberately separate from builds.
5. Deploy a preview and complete the checks below. Then configure and deploy production with its own credentials. Add surfingcowarena.com to the correct Vercel project and copy the exact DNS records from its Domains settings into Cloudflare. Start with **DNS only**, replace conflicting web records, and leave unrelated records intact. Wait for Vercel’s domain and HTTPS checks to pass. Cloudflare 526 means the origin certificate/domain configuration needs repair.
6. Configure monitoring of `/health` and enable Neon backup/restore retention before launch. Health returns 200 with `{ "ok": true }` or 503 with `{ "ok": false }`. Rehearse restoring into an isolated database; application rollback does not undo database changes.

## Verify before launch

Use a disposable link in the preview database:

- Sign in through an unknown shortcut; confirm login returns to its prefilled creation form. Create the link and find it by name and description.
- Open both shortcut formats, edit the destination, and confirm both immediately use the new URL. Redeploy and verify the saved link survives.
- Follow `/setup` to install the browser search template (`https://surfingcowarena.com/%s` in production). Test the `go` keyword, then delete the disposable link and verify the creation form appears again.
- Sign out and confirm private pages and redirects require login, including on the direct Vercel URL. Anonymous link API requests must return 401, and an unapproved Google account must be denied.
- Verify `/health`, HTTPS, and real Google sign-in on the intended hostname. Record the tested preview URL and commit before production launch.

## Local checks

```bash
npm test
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=moderate
```

These checks need no live credentials. Tests cover URL validation/serialization, alias and query normalization, email allowlists, and safe login return paths. They do not verify live OAuth, database connectivity, or the complete UI workflow; use the preview checklist for those.
