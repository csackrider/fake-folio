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

### 6. Playwright Setup
- [ ] Install Playwright:
  ```bash
  npm init playwright@latest
  ```
- [ ] Configure `playwright.config.ts` to point to `https://fakefolio.vercel.app`
- [ ] Create test directory structure (see testing section below)
- [ ] Write and run initial smoke test to confirm app is reachable

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

The goal is to demonstrate real-world Playwright testing patterns against a live deployed app.

### Test Directory Structure
```
tests/
├── auth/
│   ├── login.spec.ts
│   ├── signup.spec.ts
│   └── logout.spec.ts
├── transactions/
│   ├── add-transaction.spec.ts
│   ├── edit-transaction.spec.ts
│   └── delete-transaction.spec.ts
├── budgets/
│   └── budget-management.spec.ts
├── goals/
│   └── goals-tracking.spec.ts
├── dashboard/
│   └── dashboard-summary.spec.ts
└── fixtures/
    └── test-data.ts
```

### Key Test Scenarios
- [ ] **Auth flow** — sign up, log in, log out
- [ ] **Add a transaction** — fill form, submit, verify it appears in the list
- [ ] **Edit a transaction** — modify amount/category, verify update
- [ ] **Delete a transaction** — confirm deletion dialog, verify removal
- [ ] **Budget progress** — add budget, add spending, verify progress bar updates
- [ ] **Goals** — create a savings goal, log a contribution, verify progress
- [ ] **Dashboard summary** — verify income/expense totals reflect added data
- [ ] **CSV import** — upload a test CSV, verify transactions are created
- [ ] **Dark/light mode toggle** — verify theme switching

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
- [ ] Determine if seed data / test fixtures should be loaded via Playwright `beforeAll` hooks or managed separately in Supabase.
- [ ] Decide on test user credentials strategy (env vars vs. Playwright fixtures).
- [ ] Consider adding GitHub Actions CI workflow to run Playwright tests on push.

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
