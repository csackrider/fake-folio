# Feature workspace (AI-DLC)

Each feature has its own directory:

```text
feature/<kebab-slug>/
  product-spec.md   # /plan
  tech-spec.md      # /design
  review-report.md  # /review (optional)
```

Create the folder when you open a GitHub Issue for the feature; link the issue in the specs. The orchestration workflows in `.github/workflows/` expect issues labeled for the AI-DLC process (see `AGENTS.md`).
