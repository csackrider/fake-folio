# fake-folio
Totally fake app just for demo purposes

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_YK8gwb4a3w72AMnkhdhW96oAsvyp)

## Getting Started:

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## E2E tests (Playwright BDD)

Gherkin lives under `features/`; step definitions under `features/steps/`; page objects under `tests/pages/`. Generated specs go to `.features-gen/` (gitignored).

```bash
npx playwright install   # once per machine; CI installs browsers automatically
npm run test:bdd         # bddgen && playwright test (starts dev server via playwright.config.ts)
npm run test:bdd:ui      # optional Playwright UI mode
```

The full runnable suite is all `features/*.feature` files (navigation, dashboard, Activity, Settings, Budget, Goals, Recurring, Insights/Splits/Net Worth/Month Review). Run `npm run test:bdd` to execute every scenario after `bddgen`.

Optional env vars are documented in [`tests/.env.test.example`](tests/.env.test.example). See [`AGENTS.md`](AGENTS.md) for selector conventions, the What’s New harness, and auth notes.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/Hey-Stu/calm-ledger-app" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
