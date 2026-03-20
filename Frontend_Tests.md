# Lofbergs Frontend E2E Test Suite — Claude Code Instructions

## Context

You are writing and running an end-to-end browser automation test suite for the Lofbergs Sustainability
Platform frontend (Next.js 16, React 19, App Router). Tests drive a real running browser via the Chrome
DevTools Protocol (CDP) MCP. No test framework exists — you will use Playwright to write and execute tests.

**Frontend URL:** `http://localhost:3000`
**Backend API URL:** `http://localhost:5215`
**Auth:** Cookie-based JWT (`auth_token` cookie), set on login, checked by Next.js middleware

---

## Seed credentials

| Role          | Email                    | Password          |
|---------------|--------------------------|-------------------|
| Administrator | admin@lofberg.com        | Admin@123!        |
| Salesperson   | sales@lofberg.com        | Sales@123!        |
| Translator    | translator@lofberg.com   | Translator@123!   |

---

## Step 1 — Preparation

1. Confirm both servers are running:
   ```bash
   curl -s http://localhost:3000 | head -5
   curl -s http://localhost:5215/health
   ```

2. Install Playwright if not present:
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install chromium
   ```

3. Create `playwright.config.ts` at the frontend repo root if it doesn't exist:
   ```typescript
   import { defineConfig } from '@playwright/test';
   export default defineConfig({
     testDir: './e2e',
     use: {
       baseURL: 'http://localhost:3000',
       headless: true,
       screenshot: 'only-on-failure',
       video: 'off',
     },
     timeout: 30000,
   });
   ```

4. Create the `e2e/` directory at the repo root.

5. Create `e2e/helpers/auth.ts` with reusable login helpers:
   ```typescript
   import { Page } from '@playwright/test';

   export async function loginAs(page: Page, email: string, password: string) {
     await page.goto('/login');
     await page.fill('input[type="email"], input[name="email"]', email);
     await page.fill('input[type="password"], input[name="password"]', password);
     await page.click('button[type="submit"]');
     await page.waitForURL(/\/(dashboard|home|\(app\))/, { timeout: 10000 });
   }

   export const ADMIN    = { email: 'admin@lofberg.com',      password: 'Admin@123!'      };
   export const SALES    = { email: 'sales@lofberg.com',      password: 'Sales@123!'      };
   export const TRANS    = { email: 'translator@lofberg.com', password: 'Translator@123!' };
   ```

6. Run a smoke test before writing anything else:
   ```bash
   npx playwright test e2e/smoke.spec.ts
   ```
   Write `e2e/smoke.spec.ts` first — just load `/login` and assert the page title or a heading is visible.
   If this fails, stop and report the error before proceeding.

---

## Step 2 — Important: inspect before asserting

Before writing selectors for any page, navigate to it manually in the test and dump visible text and
input attributes to understand the actual DOM. Use this pattern:

```typescript
const inputs = await page.$$eval('input', els => els.map(e => ({ name: e.name, type: e.type, placeholder: e.placeholder })));
console.log('Inputs:', JSON.stringify(inputs));
const buttons = await page.$$eval('button', els => els.map(e => e.textContent?.trim()));
console.log('Buttons:', JSON.stringify(buttons));
```

Do this for the login page, dashboard, and any page where the selector is not obvious. Do NOT guess
selectors — inspect first.

---

## Step 3 — Test files to create

```
e2e/
├── helpers/auth.ts
├── smoke.spec.ts
├── auth.spec.ts
├── navigation-rbac.spec.ts
├── customers.spec.ts
├── users.spec.ts
├── templates.spec.ts
├── report-wizard.spec.ts
├── historical-reports.spec.ts
├── conversion-logic.spec.ts
├── resources.spec.ts
└── dashboard.spec.ts
```

---

## Step 4 — Test cases

### smoke.spec.ts

| # | Test | Steps | Expected |
|---|------|-------|----------|
| S1 | `Login page loads` | goto /login | Page has email input, password input, submit button visible |
| S2 | `Admin can log in and reach dashboard` | loginAs(admin) | URL contains /dashboard or equivalent, no error visible |
| S3 | `Unauthenticated redirect` | goto /dashboard without login | Redirected to /login |

---

### auth.spec.ts

| # | Test | Steps | Expected |
|---|------|-------|----------|
| AU1 | `Valid admin login` | Fill admin creds, submit | Redirected away from /login, dashboard visible |
| AU2 | `Valid sales login` | Fill sales creds, submit | Redirected away from /login |
| AU3 | `Valid translator login` | Fill translator creds, submit | Redirected away from /login |
| AU4 | `Wrong password shows error` | Fill admin email + wrong password, submit | Error message visible on page (do not assert exact text — assert any visible alert/error element) |
| AU5 | `Empty form shows validation` | Click submit with empty fields | Validation indicators visible (red border, error text, or disabled state) |
| AU6 | `Logout clears session` | Login as admin, find logout button/menu, click it | Redirected to /login, `auth_token` cookie absent |
| AU7 | `Forgot password link visible` | goto /login | Forgot password link present and clickable |
| AU8 | `Forgot password page loads` | Click forgot password link | Page loads with email input |

---

### navigation-rbac.spec.ts

For each role, log in and assert sidebar/nav items visible or absent. Do NOT fail if an item is in an
unexpected state — log the actual visible nav items and compare to the expected list below. Only fail
if navigation to a protected route succeeds for a role that should be blocked.

**Expected sidebar items by role:**

| Nav item | Admin | Salesperson | Translator |
|----------|-------|-------------|------------|
| Dashboard | ✓ | ✓ | ✗ |
| Customers | ✓ | ✓ | ✗ |
| Users / User Management | ✓ | ✗ | ✗ |
| Templates | ✓ | ✗ | ✓ |
| Report Generation | ✓ | ✓ | ✗ |
| Historical Reports | ✓ | ✓ | ✗ |
| Conversion Logic | ✓ | ✗ | ✓ |
| Resources | ✓ | ✓ | ✓ |
| Sales Representatives | ✓ | ✗ | ✗ |

| # | Test | Steps | Expected |
|---|------|-------|----------|
| NR1 | `Admin sees all nav items` | Login as admin, collect sidebar links | All items from admin column present |
| NR2 | `Sales sees limited nav` | Login as sales, collect sidebar links | No Users, no Templates, no Conversion Logic, no Sales Reps management |
| NR3 | `Translator sees limited nav` | Login as translator, collect sidebar links | No Dashboard, no Customers, no Report Gen, no Historical Reports |
| NR4 | `Sales cannot navigate to /users` | Login as sales, goto /users directly | Redirected away OR 403/blank page shown — log actual result |
| NR5 | `Translator cannot navigate to /customers` | Login as translator, goto /customers directly | Redirected away OR 403/blank page — log actual result |
| NR6 | `Translator cannot navigate to report generation` | Login as translator, goto report generation route | Redirected OR blocked — log actual result |

---

### customers.spec.ts

| # | Test | Steps | Expected |
|---|------|-------|----------|
| CU1 | `Customer list loads for admin` | Login as admin, navigate to Customers | Table visible with at least header row, pagination controls present |
| CU2 | `Customer list loads for sales` | Login as sales, navigate to Customers | Table visible |
| CU3 | `Search field present` | Admin on customers page | Search input visible |
| CU4 | `Create customer form opens` | Admin, click Add/Create customer button | Form/dialog opens with name, segment, region, service tier fields visible |
| CU5 | `Required field validation` | Open create form, submit empty | Validation errors on required fields (name, regionId, segmentId, serviceTier) |
| CU6 | `Create customer successfully` | Fill all required fields with unique name, submit | Success toast/notification, customer appears in list |
| CU7 | `Subcustomer toggle shows parent dropdown` | Open create form, check subcustomer checkbox | Parent customer dropdown appears |
| CU8 | `Edit customer opens with existing data` | Click edit on a customer | Form prefilled with customer data |
| CU9 | `Soft delete (deactivate) customer` | Admin, deactivate a customer | Customer removed from active list or status changes |
| CU10 | `Sales cannot see inactive customers` | Login as sales, check list | Only active customers visible (compare to admin count) — log both counts |
| CU11 | `Pagination works` | Customers list, change rows per page to 25 | Table updates, pagination reflects new page size |
| CU12 | `Filter by segment` | Apply segment filter | List filters, or "no results" if no match — no crash |

---

### users.spec.ts

| # | Test | Steps | Expected |
|---|------|-------|----------|
| US1 | `User list loads for admin` | Login as admin, navigate to Users | Table visible |
| US2 | `Sales cannot access users page` | Login as sales, navigate to /users | Redirected or access denied — log result |
| US3 | `Create user form opens` | Admin, click Add User | Dialog/form with firstName, email, role fields |
| US4 | `Required field validation on user create` | Submit empty form | Validation errors visible |
| US5 | `Create user with unique email` | Fill valid data with unique email, submit | Success feedback, user appears in list |
| US6 | `Duplicate email rejected` | Create user with same email again | Error message visible |
| US7 | `Edit user opens with data` | Click edit on existing user | Form prefilled |
| US8 | `Deactivate user` | Admin, deactivate a user | Status changes or user removed from active list |

---

### templates.spec.ts

Admin-only create/publish tests. Translator tests for translation workflow.

| # | Test | Steps | Expected |
|---|------|-------|----------|
| TM1 | `Template list loads for admin` | Login as admin, navigate to Templates | List of templates visible |
| TM2 | `Template list loads for translator` | Login as translator, navigate to Templates | List visible (translators need access) |
| TM3 | `Open a template` | Admin, click on a template | Template detail / tabs visible |
| TM4 | `Template has version indicator` | On template detail | Version number or status (Draft/Active/Archived) visible |
| TM5 | `Active version tab/pages visible` | Navigate to active version | Page list visible (Cover, Introduction, etc.) |
| TM6 | `Create draft button visible for admin` | Admin on template with active version | "Create Draft" or equivalent button present |
| TM7 | `Create draft not visible for translator` | Translator on same template | No "Create Draft" button or it is disabled |
| TM8 | `Publish draft button requires draft to exist` | Admin, after creating a draft | Publish button visible |
| TM9 | `TipTap editor loads in a page` | Admin, open a template page for editing | Rich text editor area visible (contenteditable div or tiptap class) |
| TM10 | `Language dropdown visible on translations tab` | Admin or translator on translations view | Language selector present with multiple options |
| TM11 | `Translator can open translations` | Translator, navigate to template, open translations tab | Translation fields visible and editable |
| TM12 | `Sales cannot access templates` | Login as sales, goto /template or equivalent | Redirected or access denied — log result |

---

### report-wizard.spec.ts

This is the most complex flow. Test each step independently where possible.

| # | Test | Steps | Expected |
|---|------|-------|----------|
| RW1 | `Report wizard accessible for admin` | Login as admin, click Generate Report or equivalent | Step 1 of wizard visible |
| RW2 | `Report wizard accessible for sales` | Login as sales, navigate to report generation | Step 1 visible |
| RW3 | `Translator cannot access report wizard` | Login as translator, navigate to report generation | Blocked or redirected — log result |
| RW4 | `Step 1 — Customer search field present` | Admin, open wizard | Search/dropdown for customer visible |
| RW5 | `Step 1 — Manual customer entry` | Click manual entry option | Name input, logo upload, segment dropdown appear |
| RW6 | `Step 1 — Salesperson dropdown hidden for sales role` | Login as sales, open wizard step 1 | Salesperson selector not visible |
| RW7 | `Step 1 — Salesperson dropdown visible for admin` | Login as admin, open wizard step 1 | Salesperson selector visible |
| RW8 | `Step 1 — Language defaults to English when no customer preference` | Manual customer entry, no language set | Language selector shows English as default |
| RW9 | `Step 1 — Next button disabled without required fields` | Open step 1, click Next with nothing filled | Stays on step 1 or shows validation |
| RW10 | `Step 1 → Step 2 navigation` | Fill step 1 (manual customer name + segment + report date), click Next | Step 2 (data source) visible |
| RW11 | `Step 2 — CSV upload control present` | On step 2 | File input or drop zone visible |
| RW12 | `Step 2 — Upload valid CSV populates table` | Upload a test CSV with valid columns | Editable table appears with data rows |
| RW13 | `Step 2 — Upload CSV with wrong column type shows error` | Upload CSV with a text value in a numeric column | Error or warning visible, table not populated |
| RW14 | `Step 2 → Step 3 navigation` | Click Next on step 2 | Step 3 (report type) visible |
| RW15 | `Step 3 — Report+Receipt and Receipt-only radio buttons present` | On step 3 | Two radio options visible |
| RW16 | `Step 3 — Compiled receipt checkbox present` | On step 3 | Compiled receipt checkbox visible |
| RW17 | `Step 3 — Media screens checkbox present` | On step 3 | Media screens checkbox visible |
| RW18 | `Step 3 — Selecting media screens shows size options` | Check media screens checkbox | Size selection appears (800x480, 800x600) |
| RW19 | `Step 3 → Step 4 navigation` | Click Next | Step 4 (content) visible |
| RW20 | `Step 4 — ToC toggle present` | On step 4 | Table of contents toggle visible |
| RW21 | `Step 4 — Third party logo toggle present` | On step 4 | Logo toggle visible with helper text about cover + receipt pages |
| RW22 | `Step 4 — Increase impact shows 10 checkboxes` | On step 4 | Exactly 10 checkboxes in increase impact section |
| RW23 | `Step 4 — Cannot select more than 3 impact sections` | Check 3 sections, try to check a 4th | 4th checkbox disabled or unchecking required |
| RW24 | `Step 4 — Quantity unit dropdown present` | On step 4 | Dropdown with Cups of coffee / Kilograms options |
| RW25 | `Step 4 → Step 5 navigation` | Click Next | Step 5 (output) visible |
| RW26 | `Step 5 — Receipt JPEG checkbox present` | On step 5 | JPEG checkbox visible |
| RW27 | `Step 5 — JPEG checkbox shows A4/A3 size options when checked` | Check JPEG | Size radio buttons appear |
| RW28 | `Step 5 — Preview button present` | On step 5 | Preview button visible |
| RW29 | `Step 5 — Generate button present` | On step 5 | Generate button visible |
| RW30 | `Save as Draft disabled until step 1 filled` | Open fresh wizard | Save as Draft button disabled |
| RW31 | `Save as Draft enabled after step 1 filled` | Fill step 1 customer name | Save as Draft button enabled |
| RW32 | `Progress indicator visible and updates` | Navigate through steps | Step indicator (breadcrumb/stepper) updates with each Next click |
| RW33 | `Right summary panel updates` | Fill step 1 and advance | Right-side summary panel shows selected customer name or report date |
| RW34 | `Can navigate back to previous step` | On step 3, click Back | Step 2 shown with previously entered data still present |

**Test CSV for RW12/RW13:** Create a minimal CSV helper file at `e2e/fixtures/valid-report-data.csv`:
```
certificationType,quantityKg,footballFields,cupsOfCoffee,currencyAmount
1,1000,0.5,2000000,5000
```
And `e2e/fixtures/invalid-report-data.csv`:
```
certificationType,quantityKg,footballFields,cupsOfCoffee,currencyAmount
1,not-a-number,0.5,2000000,5000
```

---

### historical-reports.spec.ts

| # | Test | Steps | Expected |
|---|------|-------|----------|
| HR1 | `Historical reports list loads for admin` | Login as admin, navigate to Historical Reports | Table with columns: Report Name, Customer, Salesperson, Report Date, Status, Actions |
| HR2 | `Historical reports loads for sales` | Login as sales | Table visible, only own reports shown (assert no other salesperson name in Salesperson column) |
| HR3 | `Translator cannot access historical reports` | Login as translator, goto historical reports route | Blocked — log result |
| HR4 | `Status filter present` | Admin on historical reports | Status filter dropdown visible |
| HR5 | `Search by report name works` | Type in search box | List filters or shows no results — no crash |
| HR6 | `Draft reports appear in list` | After saving a draft in wizard | Entry with Draft status visible |
| HR7 | `Edit (reopen) draft available` | On a draft entry, find edit/reopen action | Edit action visible and clickable |
| HR8 | `Download action absent on drafts` | On a draft row | No download button/link |
| HR9 | `Admin archive action visible on latest/past reports` | Admin on non-draft reports | Archive action present |
| HR10 | `Sales can only archive their own drafts` | Sales on their draft | Archive/delete visible; for another user's report, action absent |
| HR11 | `Restore action visible for admin on archived report` | Admin, filter for archived | Restore action present |
| HR12 | `Columns: salesperson hidden for sales role` | Login as sales, check table columns | Salesperson column not visible |

---

### conversion-logic.spec.ts

| # | Test | Steps | Expected |
|---|------|-------|----------|
| CL1 | `Conversion logic page loads for admin` | Login as admin, navigate to Conversion Logic | CO2 conversions and segment conversions sections visible |
| CL2 | `Conversion logic page loads for translator` | Login as translator | Page loads (translators can view) |
| CL3 | `Sales cannot access conversion logic` | Login as sales, goto conversion logic route | Blocked or redirected — log result |
| CL4 | `Add CO2 conversion form opens` | Admin, click Add CO2 conversion | Form with name and conversion value fields visible |
| CL5 | `Add CO2 conversion saves successfully` | Fill name + value, submit | New entry appears in list |
| CL6 | `Translator cannot see add/edit buttons` | Translator on conversion logic | No Add or Edit buttons for CO2 or segment conversions |
| CL7 | `Add segment conversion form opens` | Admin, click Add segment conversion | Form with segment, metric label, conversion value visible |
| CL8 | `Metric name change warning displayed` | Admin edits metric label of existing conversion | Warning about translations being deleted visible (if implemented in UI) — log if absent |
| CL9 | `Translation action visible` | On a conversion item | "Translations" or language icon action visible |
| CL10 | `Translation dialog shows 9 language rows` | Open translations for a conversion | 9 language inputs visible |

---

### resources.spec.ts

| # | Test | Steps | Expected |
|---|------|-------|----------|
| RS1 | `Resources page loads for admin` | Login as admin, navigate to Resources | List visible |
| RS2 | `Resources page loads for sales` | Login as sales | List visible |
| RS3 | `Resources page loads for translator` | Login as translator | List visible |
| RS4 | `Add resource form opens for admin` | Admin, click Add resource | Form with title, type (File/Link radio), description visible |
| RS5 | `Link type shows URL field` | Select Link radio | URL input appears |
| RS6 | `File type shows upload field` | Select File radio | File upload input appears |
| RS7 | `Create link resource successfully` | Fill title + URL, submit | New resource appears in list |
| RS8 | `Translator cannot see add resource button` | Translator on resources page | No Add/Create button visible |
| RS9 | `Sales cannot see add resource button` | Sales on resources page | No Add/Create button visible |
| RS10 | `Download/open action available to all roles` | Each role on resources list | Download or link action present on a resource row |

---

### dashboard.spec.ts

Keep these lightweight — assert presence of widgets, not data accuracy.

| # | Test | Steps | Expected |
|---|------|-------|----------|
| DB1 | `Dashboard loads for admin` | Login as admin | Dashboard page renders, at least one chart or metric widget visible |
| DB2 | `Dashboard loads for sales` | Login as sales | Dashboard renders |
| DB3 | `Translator redirected from dashboard` | Login as translator, goto /dashboard | Redirected — log actual destination |
| DB4 | `No JS errors on dashboard load` | Admin, open dashboard, check console errors | No unhandled errors (use page.on('pageerror')) |
| DB5 | `Dashboard has report count metric` | Admin | A widget/card showing a report count number visible |

---

## Step 5 — Run order and output

Run all tests in this order:
```bash
npx playwright test e2e/smoke.spec.ts
npx playwright test e2e/auth.spec.ts
npx playwright test e2e/navigation-rbac.spec.ts
npx playwright test                          # all remaining
```

Stop after `smoke.spec.ts` if any test fails — fix the environment before proceeding.

---

## Step 6 — After all tests complete

Produce a markdown bug report. Structure:

```markdown
## Frontend E2E Test Results — Round 1
Date: [today]
Total: X passed / Y failed / Z noted

### Failures (Bugs)
| # | File | Test | Expected | Actual | Severity |
|---|------|------|----------|--------|----------|

### Notes (Non-failures — actual behaviour logged for review)
| # | File | Test | Observed |
|---|------|------|----------|

### Environment issues (not code bugs)
| # | Issue |
|---|-------|
```

Severity guide:
- **Critical** — auth bypass, unauthenticated access to protected route succeeds
- **High** — wrong role can access a blocked feature, or a core user action crashes
- **Medium** — validation missing, wrong default, UI element absent
- **Low** — cosmetic, minor UX deviation

---

## Known gaps / do not test in this round

- PDF/JPEG output visual correctness — assert Generate button click completes without JS error only
- TipTap rich text content accuracy — assert editor mounts, do not test formatting toolbar
- Translation accuracy across 9 languages — out of scope for Round 1
- Azure Blob Storage image persistence — assert upload accepts file, do not verify blob URL resolves
- Dashboard chart data accuracy — assert chart component renders, do not validate data values
- `KeyAccountManager` role — **BUG [High]:** This role exists in the frontend codebase (`src/features/`, role guards, RTK Query service types) but is absent from the backend seed data (`DevUserSeeds.cs`), the backend `DevUserSeeds` role list, and the SRS-defined role set (Administrator, Salesperson, Translator). It is not defined in the SRS at all. Any frontend code path that checks for or renders UI conditionally based on `KeyAccountManager` is untestable and potentially dead code. **Action required before UAT:** Joann and Sparsh to align — either remove all `KeyAccountManager` references from the frontend, or raise a formal change request if this role is genuinely required by the client. Do not add a seed user for this role without SRS/client sign-off. Log as Jira bug: severity High, assign to Sparsh (frontend audit) and Joann (backend confirmation).

---

## Notes

- Base URL for all navigation: `http://localhost:3000`
- API calls go to `http://localhost:5215` — if RTK Query errors appear in console, the backend may be down
- Cookie name for auth token: `auth_token` — you can use `page.context().cookies()` to assert presence/absence
- The App Router uses route groups: authenticated routes are under `(app)/`, public routes under `(public)/`
  — actual URL paths may not include the group name (e.g. `/login` not `/(public)/login`)
- All tables are server-side paginated — do not assert total counts, assert page renders with rows
- European date format in use — date assertions should be flexible (`dd/MM/yyyy` or `dd.MM.yyyy`)
- BrownStd is a custom font — if font files are missing the app may still render with fallback; do not fail on this
