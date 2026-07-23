# Career OS — Design Spec (v1)

**Date:** 2026-07-23  
**Status:** Ready for user review (self-reviewed)  
**Goal:** A personal AI/backend interview Career OS — daily checklist + overdue reminders + study roadmaps — polished enough for everyday use and as a portfolio piece.

---

## 1. Product summary

Career OS is a **Notion-cute study operating system** for senior backend + AI interview prep. v1 combines:

- **Daily Focus OS** — today’s tasks, overdue/pending carry-forward, snooze/reschedule (reminder-app behavior)
- **Study Tracker + Roadmaps** — LeetCode, Backend, AI Engineer, Azure (and related pages) as checklist-driven modules with progress

It is **not** a generic CRUD todo. It is a personal preparation dashboard you open every day.

### Explicit v1 non-goals

- AI daily planner / recommendations / mentor
- Kanban drag-and-drop
- Analytics charts (beyond simple streak + heatmap)
- GitHub contribution sync
- Multi-user accounts / OAuth
- Push/email notifications

These may appear as “coming soon” shell stubs only if they help navigation completeness; no deep implementation in v1.

---

## 2. Decisions locked

| Topic | Choice |
|--------|--------|
| Scope | Daily Focus (A) + Study Roadmaps (B), wide page shell (C) |
| Stack | Next.js full-stack (Approach 2) — App Router + Route Handlers + Postgres |
| Auth | Single-user shared password gate (httpOnly cookie session) |
| AI | None in v1 (rules-based overdue / today only) |
| Visual | Maximal cozy: warm paper + matcha + candy pastels |

---

## 3. Architecture

```
career-os/
├── app/                      # Next.js App Router
│   ├── (auth)/login/
│   ├── (app)/                # protected shell
│   │   ├── dashboard/
│   │   ├── today/
│   │   ├── calendar/
│   │   ├── leetcode/
│   │   ├── backend/
│   │   ├── ai/
│   │   ├── azure/
│   │   ├── articles/
│   │   ├── notes/
│   │   ├── projects/
│   │   ├── interviews/
│   │   └── settings/
│   └── api/                  # Route Handlers
├── components/
├── lib/                      # db, auth, reminders, seeds
├── prisma/
└── docker-compose.yml        # local Postgres
```

**Runtime**

- Frontend: Next.js 15, React 19, TypeScript, Tailwind, Framer Motion
- API: Next.js Route Handlers under `/api/*`
- ORM: Prisma → PostgreSQL
- Local DB: Docker Compose Postgres
- Deploy target (later): Vercel + hosted Postgres (Neon or Supabase)

**Data flow**

```
UI → Route Handler → auth check → Prisma → Postgres
                ↘ reminder helpers (pure functions)
```

**Auth flow**

1. `APP_PASSWORD` (env) compared on `POST /api/auth/login`
2. Signed httpOnly cookie session via `jose` (HS256 JWT, 30-day expiry)
3. Middleware protects `(app)/*` and `/api/*` except login/health
4. Logout clears cookie

---

## 4. Data model

### 4.1 Task (core)

One task model powers Today, Overdue, and every module checklist.

| Field | Type | Notes |
|--------|------|--------|
| id | cuid/uuid | PK |
| title | string | required |
| notes | string? | optional |
| status | enum | `todo` \| `doing` \| `done` |
| priority | enum | `low` \| `medium` \| `high` |
| module | enum | `leetcode` \| `backend` \| `ai` \| `azure` \| `projects` \| `articles` \| `notes` \| `interview` \| `general` |
| topic | string? | e.g. Arrays, Redis, Career OS (project name) |
| dueDate | date? | date-only; null = no due |
| scheduledFor | date? | which daily plan day; “Today” is a **view**, not a module |
| estimateMinutes | int? | for “expected time” |
| completedAt | datetime? | set when status → done |
| tags | string[] | optional |
| order | int | manual sort within list |
| createdAt / updatedAt | datetime | |

### 4.2 RoadmapTopic

Seeded structure per module for progress bars.

| Field | Type |
|--------|------|
| id | cuid |
| module | same module enum (subset: leetcode, backend, ai, azure) |
| name | string |
| description | string? |
| order | int |

Topic completion % = done tasks with that `module`+`topic` / total such tasks (seed creates default checklist items).

### 4.3 DailyLog

| Field | Type |
|--------|------|
| date | date (unique) |
| studyMinutes | int |
| tasksCompleted | int |

Updated when tasks complete: `tasksCompleted += 1`; `studyMinutes += estimateMinutes ?? 0` (no elapsed-time tracking in v1).

### 4.4 Project

| Field | Type |
|--------|------|
| id, name, description? | |
| order | int |

Project progress % = done tasks where `module=projects` and `topic=project.name` / total such tasks. Creating a project seeds no tasks; user adds checklist items manually (or via quick add with module Projects).

### 4.5 Article

Standalone CRUD (not required to mirror a Task).

| Field | Type |
|--------|------|
| id, title, source, url | |
| mustRead | bool |
| readAt | datetime? |
| revisionDate | date? |
| notes | string? |

### 4.6 Note

| Field | Type |
|--------|------|
| id, title | |
| markdown | text |
| revisionDate | date? |
| module | optional Module enum |

### 4.7 Interview

| Field | Type |
|--------|------|
| company | string |
| status | `researching` \| `preparing` \| `applied` \| `interviewing` \| `offer` \| `rejected` \| `withdrawn` |
| dsaPercent, systemDesignPercent, behavioralPercent | 0–100 |
| resumeDone | bool |
| etaDays | int? |
| notes | string? |

---

## 5. Reminder rules (source of truth)

Evaluated in `lib/reminders.ts` (pure, unit-tested).

Let `today` = local calendar date in the user’s configured timezone (default `Asia/Kolkata` via env `APP_TIMEZONE`).

Classification is mutually exclusive, evaluated in this order:

1. **Overdue** — not `done`, and `dueDate` is set and `dueDate < today`
2. **Today** — not overdue, not `done`, and (`scheduledFor = today` OR `dueDate = today`)
3. **Pending (older)** — not overdue, not today, not `done`, and `scheduledFor` is set and `scheduledFor < today`
4. **Later** — not in the above, not `done`, and (`scheduledFor > today` OR `dueDate > today`)
5. **Unscheduled** — not `done`, no `scheduledFor`, no `dueDate` (shown in All / module pages, not on Today by default)

UI section **Needs attention** = Overdue ∪ Pending (older), sorted: overdue first (oldest `dueDate`), then older `scheduledFor`.

6. **Carry-forward** — unfinished past-scheduled tasks stay in Pending until done, snoozed, or “Bring to today” (`scheduledFor = today`)
7. **Complete** — `status=done`, `completedAt=now`; upsert DailyLog for `today`; streak = consecutive calendar days ending today with `tasksCompleted > 0`
8. **Snooze** — add N days to both `dueDate` and `scheduledFor` when present; if only one is set, bump that one; if neither set, set both to today+N. Presets: +1, +3, next Monday

Badges: `Overdue` | `Today` | `Tomorrow` | `Upcoming` | `No date`.

---

## 6. API surface (v1)

All routes require session except `POST /api/auth/login` and `GET /api/health`.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | password → session |
| POST | `/api/auth/logout` | clear session |
| GET | `/api/tasks` | list + filters (`module`, `status`, `view=today\|overdue\|pending\|all`) |
| POST | `/api/tasks` | create |
| PATCH | `/api/tasks/:id` | update fields / status |
| DELETE | `/api/tasks/:id` | delete |
| POST | `/api/tasks/:id/snooze` | `{ days }` or `{ until }` |
| POST | `/api/tasks/:id/bring-to-today` | set scheduledFor=today |
| GET | `/api/dashboard` | aggregates: today count, overdue, streak, module %, heatmap summary |
| GET/POST | `/api/topics` | roadmap topics |
| CRUD | `/api/projects`, `/api/articles`, `/api/notes`, `/api/interviews` | module resources |
| GET | `/api/calendar` | DailyLog range for heatmap |
| POST | `/api/seed` | idempotent seed of starter roadmaps (dev / first-run) |

Validation: zod on all inputs. Invalid dates → 400 with clear message.

---

## 7. UI / UX

### Visual system

- **Base:** warm paper (`#F7F1E8`), soft grain overlay
- **Accents:** matcha green, peach/coral (overdue), lavender + butter yellow chips
- **Type:** display `Fraunces` (soft serif), body `Nunito` (rounded friendly sans) — loaded via `next/font/google`
- **Shape:** large radii, sticker-like chips, soft shadows — Notion structure, stationery soul
- **Motion:** staggered page enter; checkbox pop + light confetti speck on complete; sidebar hover bloom

### Navigation (sidebar)

Dashboard · Today · Calendar · LeetCode · Backend · AI · Azure · Articles · Notes · Projects · Interviews · Settings

### Screens

1. **Dashboard** — goal ring / progress, streak, module % pills, overdue callout, today’s top tasks
2. **Today** — Overdue → Today → Later; focus mode (top 5, hide done); quick add; expected minutes total
3. **Calendar** — GitHub-style heatmap on cream paper; day click filters tasks
4. **LeetCode / Backend / AI / Azure** — topic bars + checklists (Backend/AI/Azure support Read/Watch/Practice/Build/Revise style subtasks via seeded tasks or tags)
5. **Articles** — must-read sources, read checkbox, notes, revision date
6. **Notes** — markdown title + body + revision date
7. **Projects** — Project list + per-project task checklist (`module=projects`, `topic=name`) + % complete
8. **Interviews** — company cards with readiness bars
9. **Settings** — timezone display (read-only from env in v1), logout; password is env-only

**Quick add:** floating `+`; shortcut `N` when focused in app.

---

## 8. Seed content (day-one usefulness)

On first run / `POST /api/seed`:

- LeetCode topics: Arrays, Strings, Trees, DP, Graphs (sample problems as tasks)
- Backend: Networking, Auth, Caching, Redis, Docker, Kafka, REST, SOLID (checklist tasks)
- AI: LLMs, Embeddings, Prompt Engineering, RAG, LangGraph, MCP, Evals
- Azure: Functions, Container Apps, Key Vault, Cosmos, AKS, Identity
- A few sample “today” tasks so Dashboard is never empty after seed

---

## 9. Error handling & empty states

- Wrong password → inline error, no stack traces
- Unauthenticated API → 401; middleware redirects UI to `/login`
- DB unavailable → friendly “Studio is napping” empty state + retry
- Empty module → cute empty illustration + “Seed starter roadmap” CTA
- Concurrent edit: last-write-wins via updatedAt (acceptable for single user)

---

## 10. Testing

- Unit: reminder classification, snooze, streak calculation, carry-forward visibility
- API smoke: login, create task, complete task, dashboard aggregates
- Manual: visual pass on mobile width + desktop sidebar

---

## 11. Environment

```
DATABASE_URL=
APP_PASSWORD=
SESSION_SECRET=
APP_TIMEZONE=Asia/Kolkata
```

---

## 12. Success criteria (v1 done when)

1. Password login works; app shell is protected
2. Can create/edit/complete/snooze/reschedule tasks daily
3. Overdue and older pending tasks are always visible until done or rescheduled
4. Roadmap modules show progress from real checklist data
5. Heatmap + streak update on completions
6. UI feels cohesive, cute, welcoming — not a default dashboard template
7. Seeded data lets a new clone feel usable in <2 minutes

---

## 13. Future (explicitly after v1)

Kanban, analytics charts, AI plan/recommendations, GitHub sync, Clerk/Auth.js multi-device accounts, mock interviewer, spaced repetition, resume analyzer.
