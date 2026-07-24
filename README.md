# SwitchUp

A cozy Notion-cute study operating system for leveling up into senior backend, AI, MLOps & architecture roles.

**Stack:** Next.js (App Router) · Prisma · Supabase Postgres · jose password gate · Fraunces + Nunito UI

No AI features in v1. Today is a **view**, not a module.

---

## 1. Create a free Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Open **Project Settings → Database**.
3. Copy connection strings:

| Env var | Which string | Notes |
|---------|----------------|-------|
| `DATABASE_URL` | **Transaction** pooler (port **6543**) | Used by the Next.js app / Prisma Client. Append `?pgbouncer=true` if not already present. |
| `DIRECT_URL` | **Direct** or **Session** mode (port **5432**) | Used by Prisma Migrate. Prefer the direct host `db.PROJECT_REF.supabase.co:5432` when shown. |

Example shapes (placeholders only — use your real values):

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
```

If your database password has special characters (`@`, `#`, `/`, etc.), URL-encode them.

> Local Docker Postgres is **not** used. `docker-compose.yml` is not part of the runtime path.

---

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` — Supabase pooler URI
- `DIRECT_URL` — Supabase direct URI (migrations)
- `APP_PASSWORD` — shared login password (default in example: `career-os`)
- `SESSION_SECRET` — long random string
- `APP_TIMEZONE` / `NEXT_PUBLIC_APP_TIMEZONE` — default `Asia/Kolkata`

---

## 3. Install, migrate, seed

Use Node 22:

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22.22.2

npm install
npx prisma generate
npx prisma migrate deploy   # applies prisma/migrations to Supabase via DIRECT_URL
npm run db:seed             # or POST /api/seed after login
```

For local schema iteration (creates new migrations against Supabase):

```bash
npx prisma migrate dev --name your_change
```

---

## 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → login with `APP_PASSWORD` → **Settings → Seed starter roadmap** (or `npm run db:seed`).

### Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm test` | Vitest (reminder + streak units) |
| `npm run build` | Production build |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Seed roadmaps / sample data |

---

## App map

- **Login** — single-user password cookie (`career_os_session`)
- **Dashboard** — streak, goal ring, overdue callout, module %
- **Today** — Needs attention → Today → Later; focus mode; Quick Add (`N`)
- **Calendar** — heatmap from `DailyLog`
- **LeetCode / Backend / AI / Azure** — topic bars + checklists
- **Articles · Notes · Projects · Interviews · Settings**

---

## Health check

`GET /api/health` — returns `{ ok: true, db: "up" }` when Supabase is reachable (no auth required).
# switchup
