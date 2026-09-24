# Arena Path — product and release plan

This document replaces the original unauthenticated SQLite prototype plan. It describes the implemented product and the remaining external launch checks. For commands and environment variables, see the [README](README.md); for operational steps, see [deployment and operations](docs/deployment.md).

## Product

Arena Path gives a team memorable names for long URLs. Someone creates `wiki` pointing at the team’s documentation. A teammate opens `https://surfingcowarena.com/wiki` or types **go → Tab → wiki → Enter** after configuring their browser shortcut.

The directory is shared: every approved teammate can find, create, edit, and delete links. It starts empty. Names stay fixed when destinations change so memorized shortcuts continue working.

## Implemented behavior

- Search the directory by name, description, or destination URL.
- Create a unique, normalized name with an HTTP(S) destination and optional description.
- Edit destinations/descriptions while keeping names immutable; delete only after confirmation in the UI.
- Resolve both `/{name}` and `/go/{name}` with non-cached HTTP 302 responses. Unknown names lead to the prefilled creation form.
- Support a browser search template of `https://surfingcowarena.com/%s`, with instructions for Chrome, Edge, and Firefox. Literal `go/wiki` hostname resolution and a Safari keyword shortcut are not provided.
- Require Google sign-in for directory data, setup, redirect resolution, and all link API operations. Preserve the requested internal path through login.
- Accept only verified Google emails matching configured exact team domains or full addresses; deny access when configuration is missing. Recheck membership on authenticated requests.
- Store links and atomic per-teammate mutation limits in Neon Postgres. Use explicit, versioned migrations and keep environment data separate.
- Enforce same-origin mutations, bounded JSON bodies, validated URLs, and a shared 60-mutations-per-minute allowance per teammate.
- Keep private content out of search indexes, return generic API service errors, and expose a minimal public database health endpoint.

## Architecture and interfaces

One Next.js App Router application serves the React/Radix directory, forms, Google authentication, JSON APIs, and redirects. It is intended to run on Vercel with Node 22 and Neon’s serverless Postgres driver. Database access is asynchronous and credentials are loaded at runtime, so builds do not need a database connection.

The existing link representation remains `name`, `url`, `description`, `createdAt`, and `updatedAt`. Routes remain `/api/links` for list/create and `/api/links/{name}` for read/update/delete. Unauthorized API requests return 401; private pages and shortcuts send visitors to `/login`. Public exceptions are login/auth endpoints, static assets, and `/health`.

The database includes a mutation-counter table and migration ledger. Google sessions use encrypted JWT cookies; there is no user/account table. Production starts with an empty database, and existing SQLite files are not imported.

## Verification

Local checks cover validation, SQL-backed CRUD and redirects, duplicates, missing names, repeated query parameters, directory refresh behavior, team allowlists, shared rate limits, origin checks, and error responses. Browser tests cover protected routes, the Google authorization handoff, setup, sign-out, and rejected identities. CI runs lint, type checking, tests, dependency auditing, the production build, and browser checks.

Local test fixtures substitute the Neon transport and external Google authorization page. They validate application behavior but do not verify deployed credentials or provider connectivity.

Before launch, complete the [live preview checklist](docs/deployment.md#verify-a-live-preview) using real Google login and a dedicated Neon preview database. Verify create → search → redirect → edit → redeploy → delete, both shortcut forms, browser keyword setup, and unauthenticated access rejection. Record the tested preview URL and commit.

External configuration and live preview verification are deliberately deferred until the team supplies the Vercel project, Google/Neon credentials, and access allowlist. They remain required before launch; the repository can be prepared and its local checks run without them. Private access stays disabled until authentication is configured.

## Launch criteria

- Vercel project configured for this repository, with isolated Development, Preview, and Production variables.
- Production Neon database created empty, initial migration applied, and database recovery rehearsed.
- Google OAuth clients, exact callback URLs, unique session secrets, and the actual team allowlists configured.
- Complete preview workflow verified, including persistence across redeployment.
- surfingcowarena.com attached to the correct Vercel project; Cloudflare DNS and HTTPS verified.
- Production health, sign-in, shortcut setup, and anonymous access controls verified.
- Monitoring, service ownership, and database recovery retention established.

Repository changes alone do not complete these external launch steps. No production deployment or DNS change is implied by passing CI.

## Deferred features

Personal ownership, administrator roles, rename support, click analytics, edit history, bulk imports, nested aliases, browser extensions, and internal DNS for hostname `go` remain outside this release. Preserve the simple shared-shortcut workflow when adding production configuration.
