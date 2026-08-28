# Go Links — prototype plan

Internal nickname service. Create `payroll` → a real URL. Everyone else types `go`, Tab, `payroll`, Enter, and lands on the right page. If the destination moves, edit the link; the nickname stays the same.

**Name:** Go Links  
**Shortcut keyword:** `go`  
**Public URL shape:** `https://YOUR-HOST/` (directory) and `https://YOUR-HOST/go/payroll` (redirect)

No accounts. Anyone who can reach the site can add or change links. Fine for a first demo. Do not put this on the public internet without a VPN, IP allowlist, or login later.

---

## How links get into the app

**You add them in the UI.** There is no seed list to paste in chat, no import spreadsheet, and no hardcoded company URLs.

The directory starts **empty**. First-run is:

1. Open the app
2. Click **New link** (or land on the miss path)
3. Enter name, URL, optional description
4. Save
5. `go` + Tab + that name redirects

That *is* the demo: create `wiki` in under 15 seconds, then open it from the omnibox.

Two create entry points, same form:

| From | What happens |
|---|---|
| Home → **New link** | Blank form |
| Shortcut / `/go/unknown` | Redirect to `/new?name=unknown` with the name filled in |

Optional later (not now): CSV import, Slack bot, “paste a list.” Until then, the form is the only way.

Do **not** ship placeholder destinations (`https://example.com/...`). An empty table with a clear CTA is more honest than fake links.

---

## How it should feel

Day to day this is **not** a literal `go/payroll` URL. A search shortcut is:

1. Type `go`
2. Press **Tab** or **Space**
3. Type `payroll`
4. Enter

The browser hits the app; the app **302/307-redirects** to the saved URL.

Real `go/payroll` (slash, no tab) needs DNS or a browser extension. Save that for v2.

First-run for each coworker: add one custom search engine (~30 seconds). Put those steps on `/setup` or the shortcut will not catch on.

Safari is out of scope (no comparable keyword search). Say so on the setup page.

---

## In scope / out of scope

### Build now

- Create a link in the app (name, URL, optional description)
- Empty state on home when there are zero links
- List all links
- Search by name or description (filter as you type)
- Edit URL and description (name locked)
- Delete with confirm
- Redirect `GET /go/:name` → stored URL
- Miss: “this isn’t a go link yet” + create form with name filled in
- Setup page: Chrome / Edge / Firefox shortcut instructions, copy-paste ready
- Name rules so `payroll` and `PAYROLL` are the same link
- `noindex` from day one

### Do not build yet

- Login / SSO / owners
- Click counts, history, audit log
- Permissions (“only I can edit”)
- Chrome extension
- Company DNS for hostname `go`
- Nested names like `eng/oncall` (use `eng-oncall`)
- Slack/Teams bots
- CSV / bulk import
- Seed data or “starter pack” of company links
- Rename (breaks memorized shortcuts)

---

## Product rules

| Rule | Recommendation |
|---|---|
| Link name | Lowercase, letters / digits / hyphens, **1–64** chars (`payroll`, `q3-okrs`, `hr`, `g`) |
| URL | Must start with `http://` or `https://`. Reject `javascript:`, `data:`, `file:`. Same URL may have many names. |
| Uniqueness | One name → one URL |
| Missing name | Do not 404. **302 to `/new?name=…`** with **Create this link** |
| Reserved names | Disallow aliases that you may want as hostname-`go` paths later: `new`, `edit`, `api`, `go`, `health`, `setup`, `favicon.ico` |
| Home vs redirect | `/` is the directory. Redirects live under `/go/...` so the UI never collides with an alias |
| Shortcut query | Trim, lowercase. If the query has spaces, use the **first token** only |
| Redirect status | **302 or 307**, never 301/308. `Cache-Control: no-store`. Edits must take effect immediately |
| Rename | Not in v1. Name is immutable after create |

Reserved names are insurance for a future `go` hostname, not a routing necessity (aliases already sit under `/go/`).

---

## App shape

One TypeScript web app. Three jobs:

1. **Directory UI** — empty state, list, search, create, edit, delete, setup
2. **JSON API** (or Server Actions) — save and load links
3. **Redirector** — `GET /go/payroll` → 302 to the stored URL (no HTML on a hit)

A SPA cannot issue the omnibox 302. The redirect is always a server response.

### Stack

- **Next.js (App Router) + TypeScript + React**
- **Radix Themes** (`@radix-ui/themes`) — not unstyled primitives, not shadcn unless you already live in Tailwind
- **SQLite** — one file, created empty on first boot. No seed insert of demo URLs
- **Host with a disk** — Railway, Fly.io, internal VM, or this environment

Avoid serverless + local SQLite (classic Vercel). If you ever want Vercel, switch to a hosted DB.

SQLite is enough for hundreds or thousands of links. Client-side filter over the full list is enough; no search index.

### Data

- `name` (unique, canonical lowercase)
- `url`
- `description` (optional)
- `createdAt` / `updatedAt`

No owner, no click count, no seed table of company links.

---

## Screens and routes

| Route | Behavior |
|---|---|
| `GET /` | Directory. If empty: short explanation + **New link** + link to Setup. If not: search box, table of name / URL / description / actions |
| `GET /new` | Create form. `?name=` prefilled from the miss path |
| `GET /edit/[name]` | Same form, name locked |
| `GET /setup` | Chrome / Edge / Firefox instructions + copy URL template |
| `GET /go/[name]` | Lookup → 302 target, or 302 `/new?name=` |
| `GET /health` | `{ ok: true }` |
| `GET/POST /api/links` | List / create |
| `GET/PATCH/DELETE /api/links/[name]` | Read / update / delete |

Redirects are not a screen. Miss/create stays a **page** (shareable after 302), not only a dialog.

### Radix Themes usage

- `TextField` / `TextArea` — name, URL, description, search
- `Button`, `Heading`, `Text`, `Link`, `Theme`
- `Table` — directory
- `Dialog` — optional create/edit from the table; `/new` and `/edit/[name]` still exist as pages
- `AlertDialog` — delete confirm
- `DropdownMenu` — row actions (Edit, Delete)
- `Toast` — “Saved `payroll`”

Do not mount Radix on the redirect path.

---

## Browser shortcut (this *is* the product)

Search-engine URL template:

```
https://YOUR-HOST/go/%s
```

Put a “copy this URL template” control on `/setup` (and a short reminder on the empty home). Host is whatever this instance is served as.

**Chrome / Edge:** Settings → Search engine → Manage → Add

- Name: `Go Links`
- Shortcut: `go`
- URL: `https://YOUR-HOST/go/%s`

Then: type `go`, Tab, alias, Enter.

**Firefox:** Bookmark with keyword `go` and URL `https://YOUR-HOST/go/%s`.

**Safari:** Not supported in v1.

Optional later: IT pushes the search engine with Chrome enterprise policy.

---

## Build order

Always have something demoable. Population of the directory happens **in the running app**, starting as soon as create works.

### Milestone 1 — create one link, then redirect works

- Empty SQLite file, no seed rows
- Create form with validation (name format, http(s) URL, reserved names, duplicates)
- `GET /go/:name` 302s to the saved URL
- Add the search shortcut on your own machine
- Demo: save `payroll` (or anything) in the UI, then `go` + Tab + that name

This is the magic. Do not wait for a polished table.

Hardcoded links are **not** a milestone. If you need a throwaway 302 while wiring the route, delete it before calling M1 done.

### Milestone 2 — directory

- Home lists everything (empty state when zero)
- Search filters as you type (name + description)
- Edit updates URL and description
- Delete with confirm
- Toast on save

### Milestone 3 — miss path + setup page

- Unknown alias → create form with name filled in
- `/setup` with copy-paste Chrome / Edge / Firefox steps
- Empty home links to setup
- Give it to 3–5 teammates; they add their own links

### Milestone 4 — harden for a pilot

- `noindex` (do this as soon as the layout exists, not only here)
- Basic rate limit on create/edit
- Backup the SQLite file daily
- Health check at `/health`
- HTTPS on the real host (custom search engines are happier)

Stop there. Working company prototype. Links that matter were added by people using the app.

---

## Empty state (home)

When there are no rows:

- Heading: Go Links
- One sentence: nicknames for internal URLs, shared by everyone who can open this site
- Primary button: **New link**
- Secondary: **Add the browser shortcut** → `/setup`
- No fake table rows

After the first save, the table replaces this.

---

## How you’ll know it’s working

- You can create `wiki` in the app in under 15 seconds
- A coworker with only the setup page can open it via `go` + Tab + `wiki`
- Search finds it by description, not just exact name
- Edit changes the destination; the name stays `wiki`
- A typo like `wki` shows create-this-link, not a blank error
- A fresh install has **zero** links until someone uses the form

Pilot with one team, not the whole company. They will invent the names (`pto` vs `time-off`) by using the product.

---

## Rollout (no auth)

Treat the host like an internal wiki anyone can edit:

- Internal hostname or VPN, not a public marketing URL
- Tell people it’s a shared directory, not personal bookmarks
- If junk links appear, that’s the signal to add login — not a reason to overbuild now
- Each person (or IT) must add the `go` search engine once

---

## Explicitly postponed

| Later | Why wait |
|---|---|
| Google/Microsoft SSO | Dominates the first week; prototype doesn’t need it |
| Real `go/payroll` via DNS | Needs IT |
| Chrome extension | Extra install friction |
| Owners + click stats | Useful after people rely on it |
| Nested paths (`go/eng/oncall`) | Messy routing; hyphens are enough |
| Bulk import / chat-supplied seed list | The form is the product; don’t split how links are born |

When you’re ready for real `go/payroll`, the app stays the same. You only change how the browser gets to `/go/payroll` (DNS name `go`, or an extension).

---

## Next step

Implement Milestone 1: empty database, create form, persist, redirect.
