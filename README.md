# Go Links

Internal nicknames for URLs. Create links in the app; type `go` in the browser, then the alias.

See [PLAN.md](./PLAN.md) for the prototype plan.

## Run

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`. The directory starts empty — add links from **New link**.

- Directory: `/`
- Redirects: `/go/{name}` (302)
- Setup (browser shortcut): `/setup`
- Health: `/health`

SQLite file: `data/golinks.sqlite` (created on first boot, not committed). Uses Node’s built-in `node:sqlite`.
