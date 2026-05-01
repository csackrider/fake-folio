# Product Spec - Update sidebar tagline to "Imaginary Personal finance, simplified"

**AIDLC phase:** Plan  
**Audience:** Product, engineering leads, stakeholders - product language only (no implementation or stack). Unresolved product questions should be asked in chat first; this file records decisions after they are made.

---

## Overview

| Field | Value |
|-------|-------|
| **Feature** | Update Personal finance, simplified on the sidebar to Imaginary Personal finance, simplified |
| **Status** | Draft / Awaiting approval |
| **Author** | Cursor Cloud Agent |
| **Created** | 2026-05-01 |
| **Last updated** | 2026-05-01 |
| **Related Tech Spec** | To be created in `/design` after product approval |

## Problem & audience

### Problem statement

The product currently presents the tagline "Personal finance, simplified" in the app shell sidebar. Issue #2 requests changing that wording to "Imaginary Personal finance, simplified." Without a clear product decision on the exact surfaces and final capitalization, the product risks inconsistent branding across the experience.

### Who it's for

- Existing FakeFolio users who see the sidebar while using the app
- Prospective or newly authenticated users if the approved scope includes additional brand surfaces that already reuse the same tagline
- Product stakeholders who want the product's brand language to match the current direction

### Current experience (baseline)

Today the sidebar shows the tagline "Personal finance, simplified." Matching copy also appears on authentication screens, which creates a scope question: the issue names the sidebar specifically, but the same tagline is reused elsewhere in the product.

## Outcomes & business impact

### Desired outcomes

- The approved tagline is updated from the old wording to the new wording requested in issue #2
- Users see a consistent product tagline everywhere included in the approved scope
- Product approval of exact wording and scope happens before implementation work begins

### Success criteria (for Validate)

These tie directly to the scorecard in `/ship`. Each should be testable or evidence-based without reading code.

| # | Criterion | How we'll verify |
|---|-----------|------------------|
| 1 | The final approved tagline text is recorded in the Product Spec decisions and matches the issue outcome the stakeholder wants. | Review approved Product Spec and linked issue context. |
| 2 | Every user-facing surface included in the approved scope shows the final approved tagline, and no approved-scope surface keeps the old wording. | Manual UI review of the approved surfaces plus repository copy search during implementation/review. |
| 3 | Surfaces outside the approved scope remain unchanged. | Manual UI review against the approved scope list. |

### Business impact

This is a small but visible brand-consistency improvement. It reduces mismatch between the product wording stakeholders want and the wording users currently see in the app.

## User experience & scenarios

### Key scenarios

1. **Returning app user** - A signed-in user opens the product and sees the updated tagline in the sidebar instead of the old wording.
2. **New or returning auth user (if included in scope)** - A user visiting sign-in, sign-up, or sign-up success sees the same approved tagline as the rest of the product.
3. **Stakeholder review** - A reviewer checks the approved surfaces and confirms the copy is consistent and matches the requested wording.

### Experience principles

- Keep the change copy-focused and low-friction for users
- Preserve clear, concise branding in small UI spaces like the sidebar header
- Avoid mixed wording across screens that appear part of the same branded experience

## Scope

### In scope

- Confirming the final approved replacement copy for the tagline
- Confirming whether the change applies only to the sidebar or to every user-facing surface that currently uses the same tagline
- Updating the product spec so the implementation phase has clear, testable acceptance criteria

### Out of scope

- Renaming the product itself from "FakeFolio"
- Redesigning the sidebar layout or navigation
- Broader messaging or marketing copy refreshes unrelated to this tagline
- Technical implementation details, architecture, or testing design

### Dependencies on other teams or features

- Product-owner confirmation of final scope and exact wording

## Constraints (non-technical where possible)

- The final copy must fit naturally in compact header areas such as the sidebar
- The approved wording should align with the stakeholder request captured in issue #2
- The scope must be explicit enough that implementation does not accidentally miss or overreach beyond intended surfaces

## Decisions (optional)

| Date | Decision |
|------|----------|
| 2026-05-01 | Working feature slug set to `imaginary-personal-finance-sidebar-copy` to align the Plan artifact with issue #2. |

## Related documents

- Tech Spec: `feature/imaginary-personal-finance-sidebar-copy/tech-spec.md` (to be created after approval)
- Issues: https://github.com/csackrider/fake-folio/issues/2
- ADRs (for awareness only - do not restate architecture here): None
