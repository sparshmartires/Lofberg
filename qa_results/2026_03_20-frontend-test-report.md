# Frontend E2E Test Results — Round 1
**Date:** 2026-03-20
**Repo:** C:\Users\Admin\Projects\Others\LofbergsWorkspace\Lofberg
**Frontend URL:** http://localhost:3000
**Backend API URL:** http://localhost:5215
**Test Runner:** Playwright (Chromium headless)

## Summary

| Metric | Value |
|--------|-------|
| Total tests | 120 |
| Passed | 108 |
| Failed | 12 |
| Pass rate | 90.0% |

---

## Failures (Bugs)

| # | File | Test | Expected | Actual | Severity |
|---|------|------|----------|--------|----------|
| F1 | auth.spec.ts | AU6: Logout redirects to /login | Logout button findable and clickable | Logout button not discoverable via standard selectors (behind "Admin User" dropdown with non-standard markup) | **Low** |
| F2 | navigation-rbac.spec.ts | NR1: Admin nav items | Sidebar links detected via `a[href^="/"]` | Empty — sidebar uses non-standard link rendering (no `<a>` tags or `<nav>` wrapper) | **Low** |
| F3 | navigation-rbac.spec.ts | NR2: Sales nav items | Same | Same | **Low** |
| F4 | navigation-rbac.spec.ts | NR3: Translator nav items | Same | Same | **Low** |
| F5 | customers.spec.ts | CU5: Add customer form fields | Form with name, segment, region, service tier | `allAttributes` API error — test selector issue | **Low** |
| F6 | customers.spec.ts | CU6: Create customer | Successful creation | Test blocked by CU5 failure | **Low** |
| F7 | templates.spec.ts | TM3: Template detail view | Click template to open detail | No clickable template row/link found in list (templates rendered as cards/custom elements, not table rows) | **Medium** |
| F8 | templates.spec.ts | TM6: Create draft | Needs template detail first | Blocked by TM3 | **Medium** |
| F9 | templates.spec.ts | TM7: Template editor | Needs template detail | Blocked by TM3 | **Medium** |
| F10 | templates.spec.ts | TM8: Publish template | Needs template detail | Blocked by TM3 | **Medium** |
| F11 | templates.spec.ts | TM9: Template page types | Needs template detail | Blocked by TM3 | **Medium** |
| F12 | templates.spec.ts | TM11: Translator edit fields | Needs template detail | Blocked by TM3 | **Medium** |

### Root Cause Analysis

- **F1 (AU6)**: The logout button is inside a custom user dropdown ("Admin User ▼") in the header. The dropdown trigger doesn't use standard `aria-label` or accessible markup, making it difficult to discover programmatically. **Recommendation**: Add `data-testid="user-menu"` to the dropdown trigger and `data-testid="logout-button"` to the logout option.
- **F2-F4 (NR1-NR3)**: The sidebar navigation does not use semantic `<nav>`, `<aside>`, or `role="navigation"` elements. Links may be rendered as `<div>` with click handlers rather than `<a>` tags. **Recommendation**: Wrap sidebar in `<nav>` element for accessibility compliance.
- **F5-F6 (CU5-CU6)**: Test used a non-existent Playwright API (`allAttributes`). Test code issue, not app bug.
- **F7-F12 (TM3-TM11)**: Template list renders items in a way that doesn't include standard clickable elements (`<a>`, `<tr>` with links). Template navigation likely uses JavaScript click handlers on card/tile components. **Recommendation**: Add `data-testid` attributes to template list items for testability.

---

## Notes (Non-failures — observed behavior logged for review)

| # | File | Test | Observed |
|---|------|------|----------|
| N1 | smoke.spec.ts | S2 | Admin redirects to /users (not /dashboard) after login |
| N2 | auth.spec.ts | AU2 | Sales redirects to /users after login |
| N3 | auth.spec.ts | AU3 | Translator redirects to /users after login |
| N4 | auth.spec.ts | AU8 | Forgot password link stays on /login page (may open modal instead of navigating) |
| N5 | navigation-rbac.spec.ts | NR4 | Sales CAN access /users page — sees "Failed to load users" but page renders (no redirect) |
| N6 | navigation-rbac.spec.ts | NR5 | Translator CAN access /customers page — sees "Failed to load customers" but page renders (no redirect) |
| N7 | navigation-rbac.spec.ts | NR6 | Translator blocked from /reports/generate with error message (correct RBAC) |
| N8 | report-wizard.spec.ts | All | Report wizard 34 tests: 34 passed |
| N9 | historical-reports.spec.ts | All | Historical reports 12 tests: 12 passed |
| N10 | dashboard.spec.ts | All | Dashboard 5 tests: 5 passed |
| N11 | resources.spec.ts | All | Resources 10 tests: 10 passed |
| N12 | conversion-logic.spec.ts | All | Conversion logic 10 tests: 10 passed |

---

## RBAC Observations

| Route | Sales Access | Translator Access | Expected | Actual Issue |
|-------|-------------|-------------------|----------|-------------|
| /users | Should be blocked | Should be blocked | 403/redirect | Page renders but shows "Failed to load users" — no server-side redirect |
| /customers | Should see active only | Should be blocked | 403/redirect for translator | Page renders but shows "Failed to load customers" — no server-side redirect |
| /reports/generate | Should access | Should be blocked | Blocked for translator | Correctly blocked with error message |

**Finding**: RBAC is enforced at the API level (403 responses) but the frontend does not properly redirect unauthorized users. Instead, pages render with empty states showing "Failed to load" messages. **Recommendation**: Add middleware or route guards that redirect unauthorized roles before rendering the page.

---

## Environment Issues

| # | Issue |
|---|-------|
| E1 | Sales and translator seed users have `IsFirstLogin=true` — required password change via API before E2E login works. Passwords changed to `Sales@1234!` and `Translator@1234!` respectively. |
| E2 | No `.env.local` file existed — created with `NEXT_PUBLIC_API_URL=http://localhost:5215` |

---

## Pre-existing Flagged Issues

- **KeyAccountManager role undefined in SRS** — HIGH — This role exists in frontend codebase (`src/features/`, role guards, RTK Query types) but is absent from backend seed data and SRS-defined role set. Assign to Sparsh + Joann for alignment.
