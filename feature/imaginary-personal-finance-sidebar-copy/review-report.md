# Review Report — Brand copy rename for sidebar, auth, and app metadata

**AIDLC phase:** Review  
**Issue:** [#2](https://github.com/csackrider/fake-folio/issues/2)  
**Feature:** `feature/imaginary-personal-finance-sidebar-copy/`  
**Reviewed on:** 2026-05-02  
**Reviewer:** Cursor Cloud Agent

## Review context

- The `/review` skill prefers posting one top-level comment per review dimension on the open implementation PR.
- There is no open PR for the current branch `cursor/issue-2-review-b441`, and the implementation PR for this work is already merged as [PR #5](https://github.com/csackrider/fake-folio/pull/5) (`feat: implement issue #2 branding copy update`).
- Because PR comment automation is not available in this environment for write operations, this file is the durable mirror of the review output that would otherwise be posted to GitHub.

## Overall outcome

- **Blocking findings:** 1
- **Advisory findings:** 3
- **Review disposition:** Implementation looks correct for the requested copy change, but the AIDLC review loop is **process-blocked** because there is no open implementation PR for `/build` to triage review feedback in-thread.

### Blocking

1. **No open implementation PR is available for the review/build feedback loop.**  
   The review skill expects review comments to land on an open PR so `/build` can respond in-thread. `gh pr view` for the current branch returned no PR, and the relevant implementation PR is already merged as PR #5. That means this review can be documented, but it cannot be executed against an open implementation PR exactly as designed.

### Advisory

1. **Acceptance criterion 4 is ambiguous as written.**  
   `feature/imaginary-personal-finance-sidebar-copy/tech-spec.md:135` says no runtime occurrences of `Personal finance, simplified` should remain, but the approved replacement string intentionally contains that phrase as a suffix. Review should interpret this criterion as "no standalone old copy remains" rather than using a raw substring search.
2. **Frontend/browser validation is still pending manual confirmation.**  
   The spec requires visual validation of sidebar/auth layout and browser/PWA naming. Browser MCP is not available here, and the Vercel preview URL for PR #5 returned `401 Unauthorized` from this environment, so this review cannot independently confirm the rendered UI.
3. **`AIDLC PR Reviewer Ping` uses a GitHub Action version with a deprecation warning.**  
   `.github/workflows/aidlc-pr-reviewer-ping.yml:15` and `.github/workflows/aidlc-pr-reviewer-ping.yml:30` use `actions/github-script@v7`. The latest workflow log for run `25250482801` warns that Node.js 20 actions are deprecated and will be forced to Node.js 24 by default in June 2026.

## AIDLC Review — Tech Spec

**Blocking:** None.

**Advisory:**

- **Literal search acceptance is misleading** — `feature/imaginary-personal-finance-sidebar-copy/tech-spec.md:135` cannot be satisfied by a naive string search because the approved replacement includes the prior phrase.

**Traceability against the Tech Spec**

- **Shared branding source of truth implemented** — `lib/branding.ts:1-3` exports `APP_NAME`, `APP_TAGLINE`, and `APP_TITLE` exactly as the Tech Spec proposes.
- **Sidebar updated to shared constants** — `components/sidebar.tsx:22` imports branding constants, and `components/sidebar.tsx:52-55` renders `APP_NAME` and `APP_TAGLINE`.
- **Auth login updated** — `app/auth/login/page.tsx:4` imports the branding constants, and `app/auth/login/page.tsx:63-64` renders the approved copy.
- **Auth sign-up updated** — `app/auth/sign-up/page.tsx:4` imports the branding constants, and `app/auth/sign-up/page.tsx:75-76` renders the approved copy.
- **Auth sign-up success updated** — `app/auth/sign-up-success/page.tsx:2` imports the branding constants, and `app/auth/sign-up-success/page.tsx:12-13` renders the approved copy.
- **Browser title updated via shared title constant** — `app/layout.tsx:8` imports `APP_TITLE`, and `app/layout.tsx:14-17` assigns it to Next metadata while leaving description and Apple web app title unchanged, matching the spec.
- **Manifest name aligned while preserving short name** — `public/manifest.json:2-3` sets `name` to `FakeFolio — Imaginary Personal finance, simplified` and keeps `short_name` as `FakeFolio`.
- **Out-of-scope boundaries respected** — PR #5 touched only `app/auth/login/page.tsx`, `app/auth/sign-up/page.tsx`, `app/auth/sign-up-success/page.tsx`, `app/layout.tsx`, `components/sidebar.tsx`, `lib/branding.ts`, and `public/manifest.json`. No routes, data models, auth flows, or navigation structure changed.

**Conclusion:** The implementation matches the intended build scope and stays within the Tech Spec boundaries.

## AIDLC Review — Testing

**Blocking:** None beyond the overall process blocker noted above.

**Advisory:**

- **Manual UI/browser evidence still needs a human pass** — the Tech Spec explicitly calls for visible checks on `/`, `/auth/login`, `/auth/sign-up`, `/auth/sign-up-success`, the browser title, and the served manifest. This environment could not complete that browser validation.

**Evidence reviewed**

- **Build/deploy signal present on the implementation PR** — PR #5 shows successful Vercel deployment status in `statusCheckRollup`, which is a meaningful machine-verifiable signal for a Next.js copy-only change.
- **Reviewer ping workflow passed** — the PR reviewer ping check succeeded and the PR was auto-assigned/commented as expected.
- **No extra automated tests were added** — this is acceptable for this Unit because `feature/imaginary-personal-finance-sidebar-copy/tech-spec.md:139-149` explicitly prefers build verification plus targeted manual checks rather than introducing new test infrastructure for a copy-only change.
- **Code-level search confirms centralization** — the in-scope TS/TSX surfaces now read from `APP_NAME`, `APP_TAGLINE`, or `APP_TITLE`, reducing the risk of copy drift across pages.

**Manual browser test script (pending)**

1. Open the PR #5 Vercel preview URL from the PR comments.
2. Visit `/` and confirm the sidebar shows:
   - heading: `FakeFolio`
   - tagline: `Imaginary Personal finance, simplified`
   - no clipping or overlap in the sidebar header
3. Visit `/auth/login`, `/auth/sign-up`, and `/auth/sign-up-success` and confirm each page shows:
   - heading: `FakeFolio`
   - tagline: `Imaginary Personal finance, simplified`
   - clean wrapping on narrow widths
4. Confirm the browser tab title reads `FakeFolio — Imaginary Personal finance, simplified`.
5. Load `/manifest.json` in the deployed app and confirm:
   - `name` is `FakeFolio — Imaginary Personal finance, simplified`
   - `short_name` remains `FakeFolio`

**Conclusion:** Testing is proportionate to the scope, but the human/manual checks from the Tech Spec still need to be completed in a browser-enabled environment.

## AIDLC Review — DevOps

**Blocking:** None for the scope of this change.

**Advisory:**

- **Upgrade `actions/github-script` before the Node 24 cutoff** — `.github/workflows/aidlc-pr-reviewer-ping.yml:15` and `.github/workflows/aidlc-pr-reviewer-ping.yml:30` should move off `actions/github-script@v7` or explicitly opt into Node 24 compatibility.

**Findings**

- **Rollout plan is appropriate for the Unit** — the change is static copy/config only, matching `feature/imaginary-personal-finance-sidebar-copy/tech-spec.md:151-167`, which calls for a standard deploy with simple revert-based rollback.
- **No infra surface changed in the implementation PR** — the touched files are limited to UI and metadata files plus one shared branding module.
- **Deployment evidence exists** — PR #5 has a successful Vercel preview deployment, which is the relevant runtime delivery signal for this Next.js app.
- **No container or secret handling delta** — no Docker, workflow secret, or environment configuration changes were introduced by the build PR.

**Conclusion:** DevOps risk is low and aligned with the Tech Spec; only the unrelated workflow runtime deprecation needs follow-up.

## AIDLC Review — Frontend/UX

**Blocking:** None.

**Advisory:**

- **Visual confirmation remains pending** — the spec requires confirming readability of the longer tagline in the sidebar and auth headers, but this environment could not access the protected preview or run a browser MCP session.

**Frontend findings**

- **Good reuse pattern** — `lib/branding.ts:1-3` centralizes copy and reduces future drift, which is the right minimal abstraction for this copy-only feature.
- **Existing layouts were preserved** — in all touched pages/components, the change is limited to text source replacement rather than structural UI edits.
- **Wrapping behavior looks reasonable from the code**:
  - `components/sidebar.tsx:55` renders the tagline in a plain `<p>` without `truncate`, so the copy can wrap in the fixed-width sidebar.
  - `app/auth/login/page.tsx:64`, `app/auth/sign-up/page.tsx:76`, and `app/auth/sign-up-success/page.tsx:13` render the tagline in centered text blocks within `max-w-sm` containers, which should allow normal line wrapping.
- **Accessibility risk appears neutral** — the change does not alter semantics, interactions, focus management, or ARIA usage.

**Conclusion:** No code-level frontend regression is apparent, but a human browser pass is still needed to satisfy the spec's visual acceptance criteria.

## AIDLC Review — Security

**Blocking:** None.

**Advisory:** None.

**Findings**

- **No secrets or credentials introduced** — the PR touches only presentation/configuration files and one constant module.
- **No auth or authorization behavior changed** — login and sign-up files only changed the displayed branding copy.
- **No dependency changes** — `package.json` and lockfile were not modified by the implementation PR.
- **No new network or data surfaces** — no API, storage, database, or middleware behavior changed.

**Conclusion:** This Unit has no material security delta; the implementation remains within the static copy-only boundary described by the Tech Spec.

## Human sign-off notes

- The implementation PR already has `csackrider` assigned and already contains the reviewer-ping comment from the existing workflow.
- Because the implementation PR is merged, this review should be treated as a recorded review artifact rather than an in-thread feedback loop for `/build`.
- Per the user request, this review phase stops here and does **not** proceed to `/build` or `/ship`.
