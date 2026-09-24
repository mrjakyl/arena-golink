# Deploy and operate Arena Path

Target: **https://surfingcowarena.com**, hosted on Vercel with Google team sign-in and Neon Postgres. Production starts with an empty directory. This guide covers the external configuration that the repository cannot supply.

The Vercel project, provider credentials, team allowlist, and live preview verification can be added later. They are deferred for the current repository preparation and must be completed before launch. Without authentication configuration, private pages and APIs remain inaccessible; the local automated checks still run without live credentials.

## 1. Create isolated environments

Create a Vercel project for this repository with the **Next.js** preset, repository root as the root directory, and Node **22.x**. Use `npm ci` to install and `npm run build` to build; leave the Next.js output settings at their defaults. No custom `vercel.json` is required.

Provision a fresh Neon database for production and separate development/preview databases or branches. Use a region close to the Vercel function region. Start previews from an empty development baseline, rather than copying real team links into previews.

Set the variables listed in the [README](../README.md#environment-variables) in the appropriate Vercel environment. Production database credentials and session secrets must not be exposed to Preview or Development deployments. Environment changes take effect on a new deployment.

Use a stable hostname for the preview under test, such as a Vercel branch alias or a dedicated staging domain. Set preview `NEXTAUTH_URL` to that exact origin. Configure the branch’s Preview variables separately if other branches use different hosts or databases. Open the app through its configured hostname when testing mutations: alternate deployment URLs remain protected, but their different origins are not accepted for writes.

## 2. Configure Google sign-in

In Google Cloud, configure the OAuth consent screen and create a **Web application** OAuth client. Use an Internal audience if the intended team is entirely in an eligible Google Workspace organization; otherwise configure the appropriate External audience and add test users while the Google app is in Testing status. The application’s email allowlists are enforced in either case.

Register these exact authorized redirect URIs on the clients used by each environment:

| Environment | Authorized redirect URI |
| --- | --- |
| Production | `https://surfingcowarena.com/api/auth/callback/google` |
| Development | `http://localhost:3000/api/auth/callback/google` |
| Preview | The exact preview origin followed by `/api/auth/callback/google`. |

Use separate production and nonproduction OAuth clients so preview configuration does not affect production. Google does not accept wildcard redirect URIs. If the preview hostname changes, update both its `NEXTAUTH_URL` and its Google redirect URI.

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a unique `NEXTAUTH_SECRET` per environment. Set production `NEXTAUTH_URL=https://surfingcowarena.com`. Configure the real team domains and/or Google addresses in `AUTH_ALLOWED_DOMAINS` and `AUTH_ALLOWED_EMAILS`; do not infer team membership from the application’s domain name.

There is no database table of Google users and no test-login bypass. Only verified, allowed Google identities receive usable sessions. All approved teammates have equal editing rights. Removing an allowlist entry revokes access on subsequent requests after the configuration is deployed.

## 3. Apply database migrations

Run migrations explicitly against the selected environment **before** directing traffic to its app deployment. They are intentionally not part of `npm run build`, so ordinary preview builds cannot silently migrate a shared database.

For local development, `npm run db:migrate` loads `.env.local` when present. For a deployed environment, save its database configuration to a separate gitignored environment file and select it explicitly:

```bash
node --env-file=.env.preview.local scripts/migrate.mjs
```

Use `.env.production.local` only when deliberately migrating production. Verify the target database in Neon first. A shell-exported `DATABASE_URL` takes precedence over a value in an environment file; clear any old exported value before selecting a different target. Do not put a connection string directly in shell history or deployment logs.

The runner applies numbered SQL files from `migrations/` in order. Each file’s statements and migration-ledger entry commit together in a transaction. Successfully applied files are skipped on subsequent runs. Run only one migration job per database at a time; append new migration files rather than editing an applied file. The initial migration creates `links` and `mutation_limits` without seed links. There is no automatic rollback command or SQLite importer.

If a migration fails, inspect the database error in a private operator session, correct the cause, and rerun it. Do not manually mark an unapplied migration as complete. Before future schema changes, preserve compatibility with the current production deployment and establish a recovery point.

## 4. Deploy and verify a preview

Deploy the branch to Vercel’s Preview environment after its variables and database schema are configured. Keep Vercel Deployment Protection enabled if available; authorized testers may need to sign in to Vercel as well as Google. Do not change production DNS for this step.

### Verify a live preview

Use a real allowed Google account and a separate browser profile for unauthenticated checks. These steps intentionally create and delete a disposable link in the **preview database only**. Choose an unused name such as `launch-check-20260924` and temporary destinations `https://example.com/?arena-path=before` and `https://example.com/?arena-path=after`.

1. In the unauthenticated profile, open `/<test-name>`. Verify that Google login returns you to the requested shortcut and then to the prefilled creation form. Create it with the first destination and a distinctive description.
2. Return to the directory. Search by the name and by its description; confirm the new link is visible without a hard refresh.
3. Open both `/<test-name>` and `/go/<test-name>`. In browser network tools, verify HTTP **302**, the expected `Location`, and `Cache-Control` containing `no-store`.
4. Edit the destination to the second URL and update the description. Confirm the name cannot be changed, the directory shows the update, and both shortcuts immediately use the new destination.
5. Redeploy the same preview commit without changing its database. Confirm the saved link and edited destination survive. This verifies hosted persistence across deployment.
6. On `/setup`, copy the search template and add the browser’s `go` shortcut. Test **go → Tab → test-name → Enter** in Chrome/Edge, or **go → Space → test-name → Enter** in Firefox.
7. Delete the test link using the confirmation dialog. Verify it disappears from the directory and both shortcut formats lead to a prefilled creation form again. Leave the database free of the test link.
8. Sign out. Verify the directory, create/edit/setup pages, and both shortcut formats require sign-in; anonymous link API requests return **401** with no link data. Repeat against the direct Vercel deployment URL. Try an unapproved Google account and confirm it is denied.
9. Check `/health`: it must return **200** and `{ "ok": true }`. Recheck after redeployment. If Deployment Protection is enabled, satisfy that access layer before evaluating the app response.

Record the preview URL, commit/deployment identifier, date, and pass/fail result for each step in the release review. Keep credentials, session cookies, and private destinations out of the record. Automated local test success is not a substitute for this live check.

## 5. Connect surfingcowarena.com

Once the preview check passes, configure the production environment, run its initial migration, and create a production deployment. Add **surfingcowarena.com** to the intended Vercel project and use the exact DNS records and any ownership-verification records shown by that project’s Domains settings.

Cloudflare remains the authoritative DNS provider. Set the app’s web records to **DNS only** initially so Vercel can serve and manage HTTPS directly. Replace conflicting A, AAAA, or CNAME records for the same web hostname; leave unrelated mail and verification records intact. Do not copy a generic Vercel IP or an old record from another project.

Wait for Vercel to report a valid domain configuration and an issued certificate. If Cloudflare proxying is enabled later, configure Full (strict) TLS and verify the origin certificate covers the hostname. A Cloudflare **526** means origin certificate validation failed: correct the origin/domain/certificate configuration rather than switching to Flexible TLS. Review cache rules so authenticated pages, APIs, and shortcut redirects are never forcibly cached.

Verify the public endpoints without bypassing TLS certificate checks:

```bash
curl --head https://surfingcowarena.com/login
curl --fail --silent --show-error https://surfingcowarena.com/health
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' https://surfingcowarena.com/api/links
```

Expect a successful login page, `{ "ok": true }` from health, and **401** from the anonymous API request. Verify HTTP redirects to HTTPS, then complete Google sign-in through the production hostname and confirm the browser shortcut template is `https://surfingcowarena.com/%s`.

Do not promote a Preview deployment with preview secrets as a production-ready app. Create or rebuild the deployment with the Production environment configuration. A green build alone does not verify credentials, schema, DNS, or OAuth callbacks.

## 6. Monitor and recover

Configure an external HTTPS check of `/health` every minute and alert the service owner after three consecutive failures. The endpoint is public, returns no link data, and makes a lightweight query against the links table. It reports **503** for missing credentials, an unavailable database, or a missing links schema; it does not verify Google OAuth or every mutation path. Account for Vercel Deployment Protection in any monitor configuration.

Use Vercel runtime logs to investigate failed requests and Neon’s metrics to investigate connection, latency, or database availability issues. A **429** is the per-teammate mutation limit, not necessarily an outage; clients receive `Retry-After: 60`. Avoid logging private link destinations, session cookies, or connection strings. Run the preview workflow after changes to authentication, schema, or domain settings.

Enable Neon’s restore/history capability and choose a plan and retention window that meet the team’s recovery needs; at least seven days is a recommended starting point. Verify the available window in the Neon console rather than assuming it is enabled. The application has no edit history, soft delete, scheduled dump, or built-in backup job.

Before launch, rehearse a restore in an isolated environment:

1. Choose a known recovery timestamp within the configured retention window. Use Neon’s recovery tooling to restore into a **new isolated branch/database**, keeping the current database intact.
2. Check the restored migration ledger and link data. Use an access-restricted recovery deployment with the restored connection string, a compatible application revision, and its own Google callback configuration. Do not expose restored private data in a general preview.
3. Verify health, expected links, and a disposable create/edit/delete workflow. Record the recovery time and any expected data loss since the selected timestamp.
4. During an actual incident, restrict app access at the hosting layer before switching databases so new writes cannot diverge. Update Production `DATABASE_URL`, deploy the compatible app, and verify sign-in, health, and redirects before restoring normal access.
5. Keep the former database available until the recovery has been confirmed. A Vercel code rollback does **not** reverse migrations or recover deleted links; verify database compatibility before rolling back code.

Repeat this exercise after material database changes. Keep ownership, alert destinations, and the tested recovery window in the team’s operations record.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| “Sign-in isn’t available yet” | Required auth variables and at least one nonempty allowlist must be configured in this deployment. |
| Google `redirect_uri_mismatch` | Exact scheme, hostname, and `/api/auth/callback/google` path must match the Google client and `NEXTAUTH_URL`. |
| A valid Google account is denied | The email must be verified and match an exact allowed address or domain; also check Google consent-screen test-user restrictions. |
| Reads work but saves return 403 | Use the hostname in `NEXTAUTH_URL`; mutations require its exact origin. |
| `/health` returns 503 | Verify the selected Neon database is reachable and migrations were applied there; confirm Production/Preview variables are not mixed. |
| Cloudflare returns 526 | Confirm the Vercel project’s domain mapping and TLS certificate, then correct DNS/proxy configuration. |
| Browser tests cannot launch | Run `npx playwright install chromium`; on Linux CI, include `--with-deps`. |
