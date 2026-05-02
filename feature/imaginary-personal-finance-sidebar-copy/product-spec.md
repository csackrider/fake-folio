# Product Spec - Update tagline to "Imaginary Personal finance, simplified"

**AIDLC phase:** Plan  
**Audience:** Product, engineering leads, stakeholders - product language only (no implementation or stack). Unresolved product questions should be asked in chat first; this file records decisions after they are made.

---

## Overview

| Field | Value |
|-------|-------|
| **Feature** | Update all current "Personal finance, simplified" copy to "Imaginary Personal finance, simplified" |
| **Status** | Approved |
| **Author** | Cursor Cloud Agent |
| **Created** | 2026-05-01 |
| **Last updated** | 2026-05-01 |
| **Related Tech Spec** | To be created in `/design` after product approval |

## Problem & audience

### Problem statement

The product currently presents the tagline "Personal finance, simplified" across multiple user-facing surfaces, including the app shell sidebar and authentication pages. The approved product direction is to update every current use of that exact text to "Imaginary Personal finance, simplified" so the experience reflects the intended branding consistently.

### Who it's for

- Existing FakeFolio users who see the sidebar while using the app
- Prospective or newly authenticated users who see the authentication screens now or in a future auth-enabled deployment
- Product stakeholders who want the product's brand language to match the current direction

### Current experience (baseline)

Today the sidebar shows the tagline "Personal finance, simplified." The same text also appears on the sign-in, sign-up, and sign-up success screens. That reuse means a partial rename would leave visible brand inconsistency across the experience.

## Outcomes & business impact

### Desired outcomes

- The tagline "Personal finance, simplified" is replaced everywhere it currently appears with "Imaginary Personal finance, simplified"
- Users see a consistent product tagline across the sidebar, authentication screens, and browser/PWA branding surfaces already using the related phrase
- Product approval captures the full approved rename scope before implementation work begins

### Success criteria (for Validate)

These tie directly to the scorecard in `/ship`. Each should be testable or evidence-based without reading code.

| # | Criterion | How we'll verify |
|---|-----------|------------------|
| 1 | The final approved tagline text is recorded as exactly `Imaginary Personal finance, simplified`. | Review approved Product Spec decisions and linked issue context. |
| 2 | The sidebar shows `Imaginary Personal finance, simplified` instead of `Personal finance, simplified`. | Manual UI review of the app shell. |
| 3 | The sign-in, sign-up, and sign-up success screens show `Imaginary Personal finance, simplified` instead of `Personal finance, simplified`. | Manual UI review of those screens, including auth-ready environments. |
| 4 | Browser tab metadata and installed-app/PWA naming are updated to align with the approved rename scope. | Manual verification of browser title behavior and manifest naming against the approved copy list. |

### Business impact

This is a small but visible brand-consistency improvement. It reduces mismatch between the product wording stakeholders want and the wording users currently see in the app and auth entry points.

## User experience & scenarios

### Key scenarios

1. **Returning app user** - A user opens the product and sees "Imaginary Personal finance, simplified" in the sidebar instead of the old wording.
2. **Auth-ready user journey** - A user visiting sign-in, sign-up, or sign-up success sees the same approved tagline as the rest of the product, even if auth is being prepared ahead of Supabase rollout.
3. **Browser or installed-app user** - A user sees aligned branding in the browser tab and installed web app naming instead of the previous related phrase.
4. **Stakeholder review** - A reviewer checks the approved surfaces and confirms the copy is consistent and matches the requested wording.

### Experience principles

- Keep the change copy-focused and low-friction for users
- Preserve clear, concise branding in small UI spaces like the sidebar header
- Avoid mixed wording across screens that appear part of the same branded experience

## Scope

### In scope

- Updating every current instance of the exact text "Personal finance, simplified" in user-facing product UI
- The sidebar tagline
- The sign-in, sign-up, and sign-up success page taglines
- Related browser/PWA branding surfaces that currently use the corresponding phrase in page metadata or manifest naming
- Updating the product spec so the implementation phase has clear, testable acceptance criteria

### Out of scope

- Renaming the product itself from "FakeFolio"
- Redesigning the sidebar layout or navigation
- Broader messaging or marketing copy refreshes unrelated to this tagline
- Renaming unrelated brand copy beyond the approved UI and browser/PWA surfaces identified in this spec
- Technical implementation details, architecture, or testing design

### Dependencies on other teams or features

- None beyond product approval of this spec

## Constraints (non-technical where possible)

- The final copy must fit naturally in compact header areas such as the sidebar
- The approved wording should align exactly with the stakeholder request captured in issue #2
- Auth surfaces should be updated now even though Supabase is not currently in use, so they are ready for a future auth rollout
- Browser and installed-app naming should stay consistent with the approved rename on visible in-app surfaces

## Decisions (optional)

| Date | Decision |
|------|----------|
| 2026-05-01 | Working feature slug set to `imaginary-personal-finance-sidebar-copy` to align the Plan artifact with issue #2. |
| 2026-05-01 | Replace the exact text `Personal finance, simplified` with `Imaginary Personal finance, simplified` everywhere it currently appears in user-facing UI. |
| 2026-05-01 | Approved UI scope includes the sidebar plus the sign-in, sign-up, and sign-up success pages. |
| 2026-05-01 | Auth pages remain in scope even before Supabase is enabled so they are ready for future auth rollout. |
| 2026-05-01 | Related browser tab metadata and installed-app/PWA naming are included in scope for this rename. |
| 2026-05-01 | Product Spec approved in chat; `/plan` is complete and ready for later handoff to `/design`. |

## Related documents

- Tech Spec: `feature/imaginary-personal-finance-sidebar-copy/tech-spec.md` (to be created after approval)
- Issues: https://github.com/csackrider/fake-folio/issues/2
- ADRs (for awareness only - do not restate architecture here): None
