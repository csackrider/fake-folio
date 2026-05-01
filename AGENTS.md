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
