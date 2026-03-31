# Project Audit — Löfbergs Sustainability Platform

**Branch:** testing/round-1
**FE Commit:** d4a82e16 test suite report 2026-03-27
**BE Commit:** 180b9a39 test suite report 2026-03-27
**Date:** 2026-03-27 17:58 IST
**Stack:** Next.js 16 + React 19 (FE) | .NET 9 + EF Core 9 (BE)
**Working tree:** clean

---

## Changes Since Last Audit

No previous audit found — this run establishes the baseline.

---

## Findings Overview

| Domain                  | Critical | High | Medium | Low | Notes |
|-------------------------|----------|------|--------|-----|-------|
| Security (OWASP)        | 2        | 5    | 6      | 3   | CRIT: unauthenticated password change IDOR, PuppeteerSharp no-sandbox |
| Dependencies (CVE)      | 0        | 4    | 5      | 0   | All FE npm; 0 BE NuGet vulns |
| Error Handling          | 1        | 3    | 5      | 3   | CRIT: silent PDF generation failure |
| Logical Errors          | —        | 1    | 0      | 3   | HIGH: incorrect blob URI segment extraction |
| Tech Debt               | —        | 3    | 4      | 3   | HIGH: SortableHeader in render, ref mutations, impure render |
| Type Safety (TS)        | —        | —    | 2      | 0   | 12 type bypasses (as any, catch err: any) |
| Test Coverage           | —        | 4    | 0      | 0   | HIGH: 0% FE unit coverage, 57% E2E failure rate |
| JSDoc Compliance        | —        | 1    | 0      | 2   | 7.2% FE JSDoc compliance |
| XML Doc Compliance      | —        | —    | 5      | 1   | 59% BE XML doc coverage |

---

## Top 10 Action Items

1. **[SECURITY] Fix unauthenticated change-password IDOR** — `AuthEndpoints.cs` allows any caller to change any user's password without authentication. Add `.RequireAuthorization()` and validate the userId matches the authenticated user's claim. CRITICAL.

2. **[SECURITY] Sanitize template HTML before PuppeteerSharp rendering** — HTML from admin-editable templates passes unsanitized to `SetContentAsync`. Add server-side HTML sanitization (e.g., HtmlSanitizer NuGet) before rendering. CRITICAL + HIGH.

3. **[ERROR] Fix silent PDF generation failure** — `GenerateReportCommandHandler` catches PDF exceptions and returns "Created" for undownloadable reports. Must mark report as Failed and return an error response. CRITICAL.

4. **[SECURITY] Add production CORS policy** — Only dev CORS exists. Production will reject all cross-origin requests or, worse, allow all origins if a wildcard default is applied. HIGH.

5. **[SECURITY] Validate file content-type on `/files/upload`** — No content-type validation; any file type can be uploaded to Azure Blob. Add allow-list (image/jpeg, image/png, image/svg+xml, application/pdf, etc.). HIGH.

6. **[SECURITY] Add CSP and HSTS headers to FE** — `next.config.ts` is missing `Content-Security-Policy` and `Strict-Transport-Security` headers. HIGH.

7. **[ERROR] Add React ErrorBoundary** — No ErrorBoundary exists. Any unhandled render error crashes the entire app with a white screen. HIGH.

8. **[QUALITY] Fix SortableHeader render-time component creation** — 3 table files define `SortableHeader` inside render functions, causing 18 lint errors and state resets. Extract to module-level components. HIGH.

9. **[DEPS] Run `npm audit fix`** — Resolves 4 of 9 FE vulnerabilities immediately (flatted, picomatch, svgo). Remaining 5 need exceljs evaluation. HIGH.

10. **[TESTING] Add FE unit tests and fix E2E failures** — 0% unit coverage, 57% E2E failure rate. Add Vitest for component/utility testing; fix E2E selectors. HIGH.

---

## Baseline Metrics

| Metric                        | Value |
|-------------------------------|-------|
| Total source files (FE)       | 152 |
| Total source files (BE)       | 419 |
| Total lines of code (FE)      | ~15,000 |
| Total lines of code (BE)      | ~25,000 |
| Test file count (FE)          | 25 (E2E only) |
| Test file count (BE)          | 95 |
| Test coverage % (FE)          | N/A (E2E only) |
| Test coverage % (BE)          | N/A (no coverage collector) |
| Critical CVEs                 | 0 |
| High CVEs                     | 4 (all FE npm) |
| Total vulnerable packages     | 9 (all FE npm) |
| Suspected hardcoded secrets   | 0 |
| Silent error patterns         | 7 |
| Structural logical issues     | 5 |
| Tech debt markers             | 3 |
| Type bypasses (FE)            | 12 |
| Debug leaks (non-test)        | 13 |
| Lint errors (FE)              | 63 |
| Lint warnings (FE)            | 86 |
| JSDoc compliance % (FE)       | 7.2% |
| XML doc compliance % (BE)     | 59% |
| Security findings             | 18 (2 critical, 5 high, 6 medium, 3 low, 2 info) |
| Packages >1 major behind      | 14 |

---

## Sub-reports
- [A — Dependencies & Secrets](./A-deps-secrets.md)
- [B — Error Handling & Logical Errors](./B-error-logic.md)
- [C — Tech Debt & Code Quality](./C-tech-debt.md)
- [D — Test Coverage & Documentation](./D-test-docs.md)
- [Security Audit (OWASP)](./security-audit.md)
