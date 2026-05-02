# FakeFolio — Project Plan & Decisions Log

> ⚠️ **Demo/Testing App Only** — Not for real financial use.  
> Built to demonstrate Playwright test automation on a realistic web application.

---

## Project Overview

| Item | Decision |
|------|----------|
| **App Name** | FakeFolio |
| **Purpose** | Demo app for showcasing Playwright test automation |
| **Live URL** | `https://fakefolio.vercel.app` |
| **Status** | Planning |

---

## Tech Stack

| Layer | Decision | Notes |
|-------|----------|-------|
| **Framework** | Next.js | Confirmed — downloaded from v0.app |
| **Template** | [FakeFolio Personal Finance Tracker](https://v0.app/templates/tallyr-personal-finance-tracker-wdqexTCLiHk) | v0.app community template by @heystu |
| **Database** | [Supabase](https://supabase.com) | Existing account. Used for cloud sync/auth. Template has built-in Supabase support. Falls back to localStorage if not configured. |
| **Hosting** | [Vercel](https://vercel.com) | Via v0.app deployment. Free `.vercel.app` subdomain — no domain purchase needed. |
| **Source Control** | [GitHub](https://github.com/csackrider/fake-folio) | Repo: `csackrider/fake-folio` |
| **AI Dev Tooling** | [AI-DLC](https://github.com/csackrider/AI-DLC) | Skills + agents library for AI Development Lifecycle. Provides `/plan`, `/design`, `/build`, `/review`, `/ship` orchestrators. Install via Claude Code or Cursor plugin. |
| **IDE** | Cursor | Primary development environment |
| **Testing Framework** | Playwright | Microsoft browser automation/E2E testing framework |

---

## Setup Checklist

### 1. AI-DLC Setup
- [ ] Install AI-DLC so Cursor can use the phase orchestrators throughout development:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/csackrider/AI-DLC/main/install.sh | bash
  ```
- [ ] Confirm `/plan`, `/design`, `/build`, `/review`, `/ship` commands are available in Cursor

### 2. Repository Setup
- [ ] Open the downloaded Next.js project in Cursor
- [ ] Initialize git and push to `https://github.com/csackrider/fake-folio`
- [ ] Add `.env.local` to `.gitignore` (never commit secrets)

### 3. Supabase Setup
- [ ] Create a new Supabase project named `fakefolio`
- [ ] Run the database schema migrations (see schema section below)
- [ ] Copy the Supabase project URL and anon key for use in next step

### 4. Environment Variables
Create a `.env.local` file (never commit this):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
- [ ] Verify the app runs locally with `npm run dev` and Supabase auth/sync works

### 5. Vercel Deployment
- [ ] Connect the GitHub repo (`csackrider/fake-folio`) to Vercel
- [ ] Set project name to `fakefolio` to get `fakefolio.vercel.app`
- [ ] Add the Supabase environment variables in Vercel project settings
- [ ] Deploy and verify `https://fakefolio.vercel.app` is live

### 6. Playwright BDD setup
- [x] Install `@playwright/test` and `playwright-bdd`; add `npm run test:bdd` / `test:bdd:ui` (see `package.json`).
- [x] Configure `playwright.config.ts` with `defineBddConfig`, local `webServer` (`npm run dev`), and optional `BASE_URL` override (e.g. `https://fakefolio.vercel.app`) via [`tests/.env.test.example`](tests/.env.test.example).
- [x] Create `features/`, `features/steps/`, `tests/pages/`, and initial smoke feature (`features/dashboard-smoke-gh-0.feature`).
- [x] GitHub Actions: `.github/workflows/playwright.yml` runs `npm run test:bdd` on pushes and PRs to `main`.

---

## Supabase Schema

The FakeFolio template supports optional Supabase cloud sync. Tables needed:

```sql
-- Users handled by Supabase Auth

-- Transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  description text,
  amount numeric(10,2) not null,
  type text check (type in ('income', 'expense')),
  category text,
  paid_by text,
  notes text,
  is_recurring boolean default false,
  recurrence_period text check (recurrence_period in ('monthly', 'yearly')),
  created_at timestamptz default now()
);

-- Budgets
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  amount numeric(10,2) not null,
  month text not null, -- format: YYYY-MM
  is_essential boolean default false,
  created_at timestamptz default now()
);

-- Goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text check (type in ('savings', 'debt', 'sinking')),
  target_amount numeric(10,2),
  current_amount numeric(10,2) default 0,
  deadline date,
  interest_rate numeric(5,2),
  minimum_payment numeric(10,2),
  monthly_contribution numeric(10,2),
  created_at timestamptz default now()
);

-- Net Worth Snapshots
create table net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  snapshot_date date not null,
  assets jsonb,
  liabilities jsonb,
  total_assets numeric(10,2),
  total_liabilities numeric(10,2),
  net_worth numeric(10,2),
  created_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table goals enable row level security;
alter table net_worth_snapshots enable row level security;

-- RLS Policies (users can only see their own data)
create policy "Users can manage their own transactions"
  on transactions for all using (auth.uid() = user_id);

create policy "Users can manage their own budgets"
  on budgets for all using (auth.uid() = user_id);

create policy "Users can manage their own goals"
  on goals for all using (auth.uid() = user_id);

create policy "Users can manage their own snapshots"
  on net_worth_snapshots for all using (auth.uid() = user_id);
```

---

## Playwright Test Plan

The goal is to demonstrate real-world Playwright testing patterns (BDD in Gherkin, executed via Playwright). CI runs against a **local dev server** started by Playwright; you can override `BASE_URL` for a deployed app when needed.

### Directory structure (BDD + page objects)

```text
features/
  *.feature                    # Gherkin — name new files e.g. features/<area>-gh-<issue>.feature
  steps/
    fixtures.ts                # createBdd(test) — Given / When / Then
    *.steps.ts                 # step definitions → call page objects
tests/
  pages/                       # Page Object classes
.features-gen/                 # generated specs (gitignored; bddgen)
```

Plain `*.spec.ts` files (no Gherkin) can be added later in a separate folder or Playwright `project` if you want both styles; avoid mixing generators into the same output directory.

### Key Test Scenarios (BDD in `features/`)

- [x] **Dashboard smoke** — [`features/dashboard-smoke-gh-0.feature`](features/dashboard-smoke-gh-0.feature) (`@smoke`)
- [x] **Sidebar navigation** — [`features/navigation.feature`](features/navigation.feature); all main nav targets and main `h1` titles (`@smoke` outline)
- [x] **Add a transaction** — [`features/dashboard-add-entry.feature`](features/dashboard-add-entry.feature); add expense from dashboard, assert on Activity
- [x] **Activity search** — [`features/activity-search.feature`](features/activity-search.feature); seeded merchant filter
- [x] **Budget overview** — [`features/budget-overview.feature`](features/budget-overview.feature); default categories visible
- [x] **Goals empty state** — [`features/goals-empty.feature`](features/goals-empty.feature); cleared `fakefolio-goals` + empty UI
- [x] **Recurring overview** — [`features/recurring-overview.feature`](features/recurring-overview.feature); seeded recurring merchant
- [x] **Insights / Splits / Net Worth / Month Review smoke** — [`features/insights-splits-networth-monthreview.feature`](features/insights-splits-networth-monthreview.feature)
- [x] **Settings theme (dark)** — [`features/settings-theme.feature`](features/settings-theme.feature); draft theme + Save + `html.dark`
- [ ] **Auth flow** — skipped for localStorage-only demo (no Supabase E2E)
- [ ] **Edit a transaction** — not yet covered in Gherkin
- [ ] **Delete a transaction** — not yet covered in Gherkin
- [ ] **Budget progress** — add budget + spending + bar (not yet covered)
- [ ] **Goals create / contribute** — wizard not yet automated
- [ ] **CSV import** — upload fixture CSV (not yet covered)

---

## AI-DLC Integration

Use the AI-DLC phase orchestrators in Cursor to guide development:

| Phase | Command | Use For |
|-------|---------|---------|
| Plan | `/plan` | Breaking down features into tasks |
| Design | `/design` | Component and schema design |
| Build | `/build` | Implementation |
| Review | `/review` | Code review and quality checks |
| Ship | `/ship` | Pre-deployment checklist |

---

## Open Questions / TBD

- [x] ~~Does the FakeFolio template export as a Next.js app or is it a single-file component?~~ **Confirmed: Next.js app.**
- [ ] **Seed data:** Prefer isolated `localStorage` per test context for localStorage mode; use `beforeAll` / fixtures to seed via UI or `page.addInitScript` when needed. For Supabase mode later, consider a dedicated test project and API or SQL seed, not production data.
- [x] **Test user credentials:** Default CI paths need **no secrets** (anonymous + localStorage). For Supabase auth E2E, use **env vars + GitHub Actions secrets** and document names in `tests/.env.test.example`.
- [x] **CI:** `.github/workflows/playwright.yml` runs Playwright BDD on `push` / `pull_request` to `main`.

---

## Resources

- [FakeFolio Template](https://v0.app/templates/tallyr-personal-finance-tracker-wdqexTCLiHk)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Playwright Docs](https://playwright.dev)
- [AI-DLC Repo](https://github.com/csackrider/AI-DLC)
- [FakeFolio GitHub Repo](https://github.com/csackrider/fake-folio)

---

*Last updated: May 2026*
