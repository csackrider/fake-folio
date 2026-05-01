# Tallyr - Marketing Content

A collection of marketing deliverables for promoting the Tallyr template on v0.

---

## Template Links (Update After Publishing)

- **v0 Template URL:** `[INSERT_V0_TEMPLATE_URL]`
- **Live Demo:** `[INSERT_DEMO_URL]`
- **GitHub Repository:** `[INSERT_GITHUB_URL]`

---

## v0 Template Description

**Title:** Tallyr - Personal Finance Tracker for Couples

**Short Description (under 160 characters):**
A minimal, calm personal finance tracker for households. Track recurring charges, budgets, and spending with multi-person support and dark mode.

**Full Description:**

Tallyr is a beautifully minimal personal finance dashboard designed for couples, housemates, or families who share expenses. Built with Next.js 16, Tailwind CSS, and shadcn/ui components.

**Features:**
- Dashboard with income, recurring charges, and upcoming payments
- Recurring charges management with monthly/yearly tracking
- Budget tracking by category with progress visualization
- Activity log with search, bulk actions, and CSV import
- Insights with charts (spending by category, trends over time)
- Dynamic household members - add unlimited people to your household
- Assign expenses to any member or mark as shared (splits equally)
- Filter views: Combined or by individual member
- Dark mode support
- Currency selection (29 currencies including Nordic)
- Full backup/restore via JSON export
- Consolidated "Data and Files" section for all import/export needs
- Optional cloud sync with Supabase (or use localStorage by default)
- Authentication support for private cloud deployments

**Tech Stack:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Recharts for data visualization
- localStorage for persistence (default)
- Supabase for optional cloud sync and authentication

---

## X (Twitter) Posts

### Launch Post
```
Just shipped Tallyr - a minimal personal finance tracker built for households.

Built entirely with @v0:
- Add unlimited household members
- Shared expense tracking (splits equally)
- Budget progress by category  
- Dark mode
- Full backup/restore

Try the template: [INSERT_V0_TEMPLATE_URL]
```

### Feature Highlight - Household Members
```
The hardest part of budgeting with others? Knowing who pays what.

Tallyr lets you add unlimited household members and assign expenses to anyone - or mark them as shared (splits equally).

One click to see individual or combined views.

Built with @v0: [INSERT_V0_TEMPLATE_URL]
```

### Feature Highlight - Dark Mode
```
Light mode for daytime budgeting.
Dark mode for late-night "where did my money go" sessions.

Tallyr - personal finance tracking that respects your eyes.

Template: [INSERT_V0_TEMPLATE_URL]
```

### Developer-Focused Post
```
What I built with @v0 today:

- Next.js 16 + App Router
- shadcn/ui components
- Recharts visualizations
- localStorage persistence
- JSON backup/restore
- Full dark mode
- Household expense splitting

Zero backend. Deploys anywhere.

[INSERT_V0_TEMPLATE_URL]
```

### Thread Starter
```
I built a complete personal finance app with @v0 - here's how it went 🧵

1/ The prompt: "Build a calm, minimal budget tracker for two people living together"

v0 understood the vibe immediately. Muted colors, generous whitespace, no visual clutter.
```

```
2/ The killer feature: dynamic household members.

Add unlimited people to your household. Each expense can be assigned to any member or marked as Shared (splits equally).

Switch between "Combined" and individual views with one click.
```

```
3/ Everything persists to localStorage - no backend needed.

But what about data loss? Added a full backup/restore system. Export to JSON, import anytime.

Your budget survives browser clears.
```

```
4/ The whole thing took one session. v0 handled:
- Component architecture
- State management
- Dark mode theming
- Responsive design
- Accessibility

Try it yourself: [INSERT_V0_TEMPLATE_URL]
```

---

## LinkedIn Post

### Main Post
```
I've been exploring what's possible with AI-assisted development, and I'm impressed.

Built "Tallyr" - a personal finance tracker designed for couples who share expenses.

The interesting part: the entire application was built conversationally with v0 by Vercel. No boilerplate. No fighting with configurations. Just describing what I wanted and iterating.

Key features:
→ Dynamic household members (add unlimited people)
→ Assign expenses to anyone or mark as shared
→ Budget tracking by category
→ Combined vs. individual spending views
→ Full data backup/restore
→ Dark mode
→ 29 currency options

The tech: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Recharts. All client-side, no backend required.

What strikes me most is how v0 understood the *design intent* - not just the features, but the calm, minimal aesthetic. It made sensible UX decisions throughout.

This is a template anyone can use and customize. Link in comments.

#webdevelopment #nextjs #ai #vercel #react #typescript
```

### Comment with Link
```
Try the template: [INSERT_V0_TEMPLATE_URL]

Full source on GitHub: [INSERT_GITHUB_URL]
```

---

## GitHub README

```markdown
# Tallyr

A minimal, calm personal finance tracker designed for couples or housemates who share expenses.

![Tallyr Screenshot](screenshot.png)

## Features

- **Dashboard** - Overview of income, recurring charges, and upcoming payments
- **Recurring Charges** - Track monthly and yearly subscriptions
- **Budget Tracking** - Set budgets by category with visual progress bars
- **Activity Log** - Full transaction history with search and bulk actions
- **Insights** - Charts showing spending by category and trends over time
- **Dynamic Household** - Add unlimited members to your household
- **Expense Assignment** - Assign to any member or mark as shared (splits equally)
- **Filtered Views** - Switch between Combined or any individual member's view
- **Dark Mode** - Full dark theme support
- **Multi-Currency** - 29 currencies including USD, EUR, GBP, and Nordic currencies
- **Backup/Restore** - Export and import all data via JSON
- **CSV Import** - Import transactions from your bank

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS v4](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Recharts](https://recharts.org/) - Charts and data visualization
- [date-fns](https://date-fns.org/) - Date utilities

## Getting Started

### Use the v0 Template

The easiest way to get started is to use the v0 template:

[Open in v0]([INSERT_V0_TEMPLATE_URL])

### Manual Installation

1. Clone the repository:
   ```bash
   git clone [INSERT_GITHUB_URL]
   cd tallyr
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Data Storage

By default, all data is stored locally in your browser's localStorage. This means:

- **Privacy**: Your financial data never leaves your device
- **No account required**: Start using immediately
- **Backup recommended**: Use the Export Backup feature in Settings to save your data

### Optional Cloud Sync

For users who want cross-device sync and data persistence, Tallyr supports optional Supabase integration:

1. Create a [Supabase](https://supabase.com) project
2. Run the provided SQL schema (`scripts/004_simple_user_tables.sql`)
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your environment
4. Your data will sync to the cloud with full authentication support

## Customization

### Adding Categories

Edit `lib/constants.ts` to add or modify budget categories.

### Changing Default Currency

Edit `lib/storage.ts` to change the default currency from USD.

### Styling

The app uses Tailwind CSS with CSS variables for theming. Edit `app/globals.css` to customize colors.

## Built With v0

This project was built using [v0 by Vercel](https://v0.dev), an AI-powered tool for building web applications through natural language conversation.

## License

MIT License - feel free to use this for personal or commercial projects.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
```

---

## Vercel Community Forum Blog Post

### Title
Building a Personal Finance App for Couples with v0 - A Template Walkthrough

### Overview/Introduction
```
Managing shared finances as a couple is tricky. Most budgeting apps are designed for individuals, making it hard to track "yours, mine, and ours" expenses.

I built Tallyr to solve this - a minimal, calm personal finance tracker with first-class support for household expense splitting. The entire app was built conversationally with v0, and I'm sharing it as a template for the community.

In this post, I'll walk through the key features, the technical decisions, and how v0 handled the implementation.
```

### Key Sections to Cover

**1. The Problem**
```
When my household started tracking our shared budget, we ran into the same issue everyone does: existing apps don't handle "shared" expenses well. 

We needed:
- A way to mark expenses as belonging to specific people or shared
- Support for more than just 2 people
- Views to see individual vs. combined spending
- Something that actually looks good and doesn't stress us out
```

**2. The Solution**
```
Tallyr addresses all of these with a simple model:
- Add unlimited household members in Settings
- Every expense has an "Assigned To" field: any member or Shared
- Shared expenses split equally among all members
- A global filter in the sidebar switches between Combined and individual views
- When viewing an individual, their portion of shared expenses is calculated automatically
```

**3. Building with v0**
```
The most interesting part of this project was how naturally v0 handled the complexity. I described the household splitting feature in plain English, and v0:

- Added the correct types to the data model
- Updated the entry forms with split ratio sliders
- Modified the DataProvider to compute filtered entries with proper split calculations
- Added visual badges showing who each expense belongs to
- Wired up the sidebar filter toggle

This would typically take a day of careful state management work. With v0, it was a conversation.
```

**4. Technical Highlights**
```
- Next.js 16 with App Router and React 19
- Tailwind CSS v4 with CSS variables for light/dark theming
- shadcn/ui components (Dialog, Sheet, Select, Card, etc.)
- Recharts for spending visualizations
- localStorage for persistence with full backup/restore
- TypeScript throughout with proper type safety
```

**5. Try It Yourself**
```
The template is available on v0: [INSERT_V0_TEMPLATE_URL]

You can:
- Fork it and customize for your own use
- Use it as a starting point for a more complex finance app
- Enable the built-in Supabase integration for cross-device sync
- Study the patterns for household/multi-user data filtering

I'd love to see what you build with it. Share your customizations in the comments!
```

---

## Product Hunt Description (If Applicable)

**Tagline:**
A calm personal finance tracker for households who share expenses

**Description:**
```
Tallyr is a minimal budget tracking app designed for households - couples, families, or housemates.

Unlike traditional finance apps built for individuals, Tallyr understands that households have "yours, mine, and ours" expenses.

Key features:
- Add unlimited household members
- Assign expenses to any member or mark as shared
- Shared expenses split equally
- One-click filtering between combined and individual views
- Beautiful dark mode
- 29 currency options
- Full backup/restore

Built with Next.js and shadcn/ui. 100% client-side - your data stays on your device.

Free and open source.
```

---

## Newsletter/Email Announcement

**Subject:** New v0 Template: Personal Finance Tracker for Households

**Body:**
```
Hey there,

I just published a new v0 template I've been working on: Tallyr.

It's a personal finance tracker specifically designed for households - couples, families, or housemates who share expenses.

The standout feature is dynamic household members - add as many people as you need, assign expenses to anyone or mark them as shared (splits equally). Then filter to see just your expenses, anyone else's, or everything combined.

Other features:
- Dashboard with income and spending overview
- Budget tracking by category
- Recurring charge management
- Full dark mode support
- Backup/restore via JSON export

The whole thing runs client-side (no backend, no account needed) and was built entirely with v0.

Check out the template: [INSERT_V0_TEMPLATE_URL]

Let me know if you end up using it or have any feedback!

[Your name]
```

---

## Hashtags Reference

**X/Twitter:**
- #v0 #vercel #nextjs #react #typescript #webdev #buildinpublic #opensource #fintech #personalfinance

**LinkedIn:**
- #webdevelopment #nextjs #react #typescript #ai #vercel #opensource #fintech #programming #softwaredevelopment

---

## Screenshot Suggestions

1. **Hero shot** - Dashboard in light mode showing all stat cards and CSV import button
2. **Dark mode** - Same dashboard view in dark mode
3. **Household filter** - Sidebar showing the Combined/Member toggle buttons
4. **Add member** - Settings Household card showing multiple members with add/remove
5. **Insights charts** - The insights page with spending breakdown charts
6. **Data and Files** - Settings page showing the consolidated import/export section
7. **Entry form** - Add Entry dialog showing member assignment dropdown
8. **Mobile responsive** - Dashboard on mobile viewport (if applicable)

---

## Content Calendar Suggestion

| Day | Platform | Content |
|-----|----------|---------|
| Day 1 | X | Launch post with template link |
| Day 1 | LinkedIn | Main post with detailed description |
| Day 2 | X | Feature highlight - Household splitting |
| Day 3 | Vercel Forum | Full blog post |
| Day 4 | X | Developer-focused post (tech stack) |
| Day 5 | X | Dark mode feature post |
| Week 2 | X | Thread walkthrough |

---

*Last updated: April 2026*
