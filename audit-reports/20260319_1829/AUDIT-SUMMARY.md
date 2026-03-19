# Project Audit — Löfbergs Sustainability Platform

**Branch:** feat/templates
**Commit:** 8744df5e metrics translations
**Date:** 2026-03-19 18:29
**Stack:** Next.js 16 / React 19 / TypeScript 5 / Redux Toolkit + RTK Query / Tailwind 4
**Working tree:** clean

---

## Changes Since Last Audit

No previous audit found — this run establishes the baseline.

---

## Findings Overview

| Domain                  | Critical | High | Medium | Low | Notes |
|-------------------------|----------|------|--------|-----|-------|
| Security (OWASP)        | 1        | 3    | 4      | 3   | JWT in localStorage, XSS, missing headers |
| Dependencies (CVE)      | 0        | 4    | 2      | 0   | xlsx unmaintained (2 high, no fix), next needs upgrade |
| Error Handling          | —        | 5    | 6      | 3   | Empty catches in auth, unhandled mutations |
| Logical Errors          | —        | —    | 2      | 2   | Memory leaks (createObjectURL), isNaN inconsistency |
| Tech Debt               | —        | 2    | 4      | 3   | React Compiler ref violations, setState in useEffect |
| Type Safety (TS)        | —        | —    | 1      | —   | 9 `as any` occurrences in auth pages |
| Test Coverage           | —        | —    | —      | —   | 0% — no tests exist |
| JSDoc Compliance        | —        | —    | —      | —   | 0% — 0 of 242 exports documented |
| Docstring Compliance    | —        | —    | —      | —   | N/A (not a Python project) |

---

## Top 10 Action Items

Prioritised across all domains. Format: [DOMAIN] Description — file or area

1. **[SECURITY]** Move JWT from localStorage to HttpOnly/Secure cookies — `src/store/services/authApi.ts` + all API services
2. **[SECURITY]** Sanitize `dangerouslySetInnerHTML` with DOMPurify — `src/features/template/components/translation/TranslationFieldPair.tsx`
3. **[SECURITY]** Add security headers (CSP, X-Frame-Options, HSTS) — `next.config.ts`
4. **[DEPS]** Replace `xlsx` package (unmaintained, 2 high CVEs, no fix) — `package.json`
5. **[DEPS]** Upgrade `next` from 16.1.6 to 16.2.0 (5 CVEs including CSRF bypass) — `package.json`
6. **[ERROR]** Add error handling to VersionHistory destructive operations — `src/features/template/components/VersionHistory.tsx`
7. **[ERROR]** Add error handling to conversion logic mutations — `src/features/conversion-logic/components/`
8. **[TECH DEBT]** Fix ref-during-render pattern for React Compiler compatibility — `src/features/template/components/` (6 files, 12 violations)
9. **[TESTING]** Establish Vitest test framework and initial test suite for auth, wizard, middleware
10. **[DOCS]** Add JSDoc to store layer exports (hooks, slices, API services) — `src/store/`

---

## Baseline Metrics

| Metric                        | Value |
|-------------------------------|-------|
| Total source files            | 150 |
| Total lines of code           | 20,131 |
| Test file count               | 0 |
| Test coverage %               | 0 |
| Critical CVEs                 | 0 |
| High CVEs                     | 4 |
| Vulnerable packages           | 6 |
| Suspected hardcoded secrets   | 0 |
| Silent error patterns         | 12 |
| Structural logical issues     | 4 |
| Tech debt markers             | 0 |
| Type bypasses                 | 9 |
| Debug leaks (non-test)        | 8 |
| Lint errors                   | 29 |
| Lint warnings                 | 28 |
| JSDoc compliance %            | 0.0 |
| Python docstring compliance % | N/A |

---

## Sub-reports
- [A — Dependencies & Secrets](./A-deps-secrets.md)
- [B — Error Handling & Logical Errors](./B-error-logic.md)
- [C — Tech Debt & Code Quality](./C-tech-debt.md)
- [D — Test Coverage & Documentation](./D-test-docs.md)
- [Security Audit (OWASP)](./security-audit.md)
