# C - Tech Debt, Code Quality, Type Safety

## Summary

The codebase carries a moderate tech-debt and quality burden. The frontend has 149 lint problems (63 errors, 86 warnings), dominated by unused variables (76), explicit `any` types (25), and components created during render (18). Type safety bypasses total 12 instances across auth pages and customer/user CRUD. The backend is cleaner with only 3 TODO markers (all in one repository file) and 4 `Console.WriteLine` debug statements in `Program.cs`, but the build is currently broken due to DLL file-lock errors (43 MSBuild errors). There are 9 `console.error` calls in frontend production code outside test files that leak internal error context to the browser console.

## Findings

| Severity | File / Area | Description |
|----------|-------------|-------------|
| HIGH | FE: `CustomerTable.tsx`, `HistoricalReportsTable.tsx`, `UsefulResourcesTable.tsx` | `SortableHeader` component defined inside render function causes state resets on every render (18 `react-hooks/static-components` errors). Extract to module-level component. |
| HIGH | FE: `providers.tsx` | `Date.now()` called during render via `useRef(Date.now())` -- impure function call flagged by `react-hooks/purity`. Will produce non-deterministic renders. |
| HIGH | FE: 5 template section components (`AboutSustainability`, `Certification`, `CoverPage`, `IncreasingImpact`, `Usp`, `RichTextEditor`) | Ref `.current` updated during render (11 `react-hooks/refs` errors). Must move ref assignments into `useEffect` or `useLayoutEffect`. |
| MEDIUM | FE: `(public)/*.tsx` (auth pages) | 6 `catch (err: any)` blocks across login, forgot-password, reset-password, change-password, verify-code. Untyped error handling loses type safety. |
| MEDIUM | FE: `customers/`, `users/`, `dashboard/` | 6 additional `as any` casts: 3 in customer update/create bodies, 1 in `UsersTable`, 1 in `AddCustomerPage`, 1 in `ReportsByMarkets` tooltip prop. Indicates DTO/API type mismatches. |
| MEDIUM | FE: `verify-code/page.tsx`, `TemplateContent.tsx`, `TranslationContent.tsx`, `EditResourceDialog.tsx` | 5 `react-hooks/set-state-in-effect` errors -- `setState` called synchronously inside `useEffect`, causing cascading renders. |
| MEDIUM | FE: `AppHeader.tsx`, `CoverPageSection.tsx` and 10+ other files | 76 unused variable/import warnings (`@typescript-eslint/no-unused-vars`). `AppHeader.tsx` alone has 9 dead imports (Select components, languages array). Indicates incomplete refactoring. |
| MEDIUM | FE: `ConversionTranslationDialog.tsx`, `Step2DataSource.tsx`, `VersionHistory.tsx`, `TemplatePage.tsx`, `TranslatorTemplatePage.tsx` | 9 `console.error()` calls in production source (non-test). Error details leak to browser console; should use structured error reporting. |
| LOW | FE: `AppHeader.tsx`, `AppSideBar.tsx`, `PublicAppHeader.tsx`, `SalesRepPerformance.tsx`, `TopCustomers.tsx` | 5 `@next/next/no-img-element` warnings -- using raw `<img>` instead of Next.js `<Image />`, impacting LCP and bandwidth. |
| LOW | FE: `input.tsx` | 1 `@typescript-eslint/no-empty-object-type` -- empty interface extends supertype with no additions. |
| LOW | FE: `not-found.tsx` | 1 `react/no-unescaped-entities` -- unescaped apostrophe in JSX. |
| MEDIUM | BE: `SalesRepresentativeRepository.cs` (lines 140, 196, 270) | 3 TODO comments: "Get actual reports generated count from reports history table when implemented". Deferred feature work blocking accurate salesperson metrics. |
| LOW | BE: `Program.cs` (lines 45, 49, 355, 360) | 4 `Console.WriteLine` calls for Key Vault and SendGrid config status. Should use `ILogger` for structured logging. |
| HIGH | BE: Build (lint proxy) | 43 MSBuild `MSB3026`/`MSB3027` errors -- DLL copy failures due to running `Lofberg.Services.Api` process locking binaries. Build cannot complete while API is running. Not a code defect but blocks CI/CD and `--warnaserror` lint checks. |

## Metrics

- Total debt markers (TODO/FIXME/HACK): 3 (all BE)
- Debug leaks in non-test files: 13 (9 FE `console.error`, 4 BE `Console.WriteLine`)
- Type bypass count (FE): 12 (`as any`: 4, `catch err: any`: 6, param `: any`: 2)
- Lint error count (FE): 63
- Lint warning count (FE): 86
- Lint warning count (BE): 0 (build failed before warnings could be emitted; 43 MSBuild errors from file locks)

## Top Recommendations

1. **Extract SortableHeader to a shared module-level component.** Three table components (`CustomerTable`, `HistoricalReportsTable`, `UsefulResourcesTable`) all define `SortableHeader` inside the render function. This triggers 18 `react-hooks/static-components` errors and causes silent state resets. Move to `src/components/ui/SortableHeader.tsx` and reuse.

2. **Move ref assignments out of render into effects.** Six template section components assign `ref.current` during render, producing 11 errors. Wrap each `onChangeRef.current = onChange` in a `useEffect` to comply with React's rules of hooks and prevent stale-ref bugs.

3. **Replace `as any` and `catch (err: any)` with proper types.** Define typed error shapes for API error responses and use them in catch blocks. Fix customer/user update DTOs so the `as any` casts on request bodies are no longer needed -- these casts hide potential runtime mismatches between frontend and backend contracts.

4. **Replace `console.error` calls with a centralized error reporting utility.** The 9 production `console.error` calls in template and report-generation features should route through a logging service (e.g., Sentry, or a custom `reportError()` wrapper) to avoid leaking internal error details in the browser console and to enable production error tracking.

5. **Migrate `Console.WriteLine` to `ILogger` in backend `Program.cs`.** The 4 `Console.WriteLine` calls for configuration status bypass structured logging. Use `ILogger<Program>` so messages are captured by the configured log pipeline and respect log-level filtering.
