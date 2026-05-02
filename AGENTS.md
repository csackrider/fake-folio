# AGENTS.md — FakeFolio

## What this repo is

Demo Next.js personal finance app (FakeFolio) for UI and Playwright-style test automation practice. Not for real financial use. Optional Supabase; defaults to browser `localStorage` when env vars are absent.

## Stack

- **Framework:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Data:** `localStorage` by default; optional Supabase (`lib/supabase/`)
- **Issue tracker:** GitHub Issues in this repo, coordinated with your GitHub Project board

## Feature specs (AI-DLC)

Convention: `feature/<kebab-slug>/`

- `product-spec.md` — Plan phase output / product intent
- `tech-spec.md` — Design phase output / implementation spec
- `review-report.md` — Review phase output (when used)

## Key commands

- **Install:** `git submodule update --init --recursive && npm ci`
- **Dev server:** `npm run dev`
- **Production build:** `npm run build`
- **E2E (BDD):** `npx playwright install` (first time), then `npm run test:bdd` — runs `bddgen` then Playwright; uses `playwright.config.ts` `webServer` to start `npm run dev` unless `CI` is set (GitHub Actions uses the same script).

## E2E / Playwright

- **Stack:** `@playwright/test` + `playwright-bdd` — Gherkin in `features/**/*.feature`, steps in `features/steps/**/*.ts`, generated tests in `.features-gen/` (ignored by git).
- **Agent skills:** Use **`playwright-testing`** and **`agent-testing`** from AI-DLC when authoring or refactoring suites from GitHub issues (paste Gherkin into the issue or use the **E2E scenario** issue template).
- **Selectors:** Prefer `getByRole` / `getByLabel`; add **`data-testid`** on stable anchors for flows you automate (see dashboard: `dashboard-root`, `dashboard-heading`; Activity search: `activity-search`; Add Entry submit: `add-entry-submit`; Settings save: `settings-save`).
- **BDD harness:** [`features/steps/fixtures.ts`](features/steps/fixtures.ts) extends the Playwright `context` fixture with `addInitScript` that sets `fakefolio-last-seen-version` to the current app version so the **What’s New** dialog ([`components/whats-new-dialog.tsx`](components/whats-new-dialog.tsx)) does not block E2E. Scenarios that need empty goals use `Given I have cleared saved goals from storage` to register an additional init script before the first navigation.
- **Auth / data:** With no `NEXT_PUBLIC_SUPABASE_*`, the app uses **`localStorage`** — smoke flows need no credentials. For Supabase-backed E2E later, use a dedicated test user and **GitHub Actions secrets** (or a local untracked env file); never commit passwords. See [`tests/.env.test.example`](tests/.env.test.example).

## Skills location

`.claude/skills/` is a **symlink** to `.claude/deps/ai-dlc/skills` (git submodule: [AI-DLC](https://github.com/csackrider/AI-DLC)). Phase skills live at `.claude/skills/<phase>/SKILL.md` (e.g. `plan`, `design`, `build`, `review`, `ship`).

## GitHub Actions + Project workflow

1. **AIDLC Agent Launch** (`.github/workflows/aidlc-agent-launch.yml`)
   - Runs when label `aidlc_work:unstarted` is added to an issue, or via **Actions → manual workflow_dispatch** (issue number + phase).
   - Uses **`AIDLC_PROJECT_PAT`** to read the issue’s **Project v2 Status** field and map the column to a phase (`plan`, `design`, `build`, `review`).
   - Uses **`CURSOR_API_KEY`** to start a Cursor Cloud Agent against this repository.
   - Swaps `aidlc_work:unstarted` → `aidlc_work:in_progress` while the agent runs.

2. **AIDLC PR Reviewer Ping** (`.github/workflows/aidlc-pr-reviewer-ping.yml`)
   - On PR open/reopen: assigns `csackrider` and posts a review ping comment.

**Repository secrets to configure:** `AIDLC_PROJECT_PAT`, `CURSOR_API_KEY` (and ensure GitHub Issues labels `aidlc_work:unstarted` / `aidlc_work:in_progress` exist).

**`AIDLC_PROJECT_PAT` scopes:** The GraphQL query reads **issue → projectItems** (Project v2). If the token lacks access, the API returns *resource not accessible by personal access token* and the workflow falls back to phase **`plan`**. To read the real board column, use a PAT that can read projects — e.g. **classic:** include **`read:project`** (often together with **`repo`**); **fine-grained:** grant **Projects → Read** for the account that owns the project (user or org), plus repository **Issues** / **Metadata** as needed.

## Notes for agents

- Run `npm run build` before opening a PR when the change touches app code.
- `fakefolio-plan.md` holds the product roadmap and Playwright test outline.
- Without `NEXT_PUBLIC_SUPABASE_*`, middleware allows anonymous access and data stays in `localStorage`.
