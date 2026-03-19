## Summary

The codebase has minimal explicit tech debt markers (only 1 TODO/FIXME/HACK found, which is a placeholder string rather than a deferred-work comment), but carries significant implicit debt in three areas: (1) a systemic React Compiler incompatibility across the template feature where refs are updated during render (12 violations), (2) pervasive `as any` type bypasses concentrated in the public auth pages, and (3) widespread unused imports/variables indicating incomplete refactoring. The lint report shows 29 errors and 28 warnings across 22 files, with the template feature accounting for roughly half of all errors.

## Findings

| Severity | File / Area | Description |
|----------|-------------|-------------|
| High | `src/features/template/components/` (6 files) | **Refs updated during render** (`react-hooks/refs`): `AboutSustainabilitySection`, `CertificationSection`, `CoverPageSection`, `IncreasingImpactSection`, `RichTextEditor`, `UspSection` all assign `ref.current` during render. This pattern is incompatible with React Compiler and may cause stale UI. 12 total violations. |
| High | `src/features/historical-reports/components/HistoricalReportsTable.tsx` | **Component created during render** (`react-hooks/static-components`): `SortableHeader` is declared inside the render body, causing state resets on every render. 3 error instances from 1 root cause. |
| High | `src/app/(public)/` (4 files) | **`catch (err: any)` pattern** in `login`, `forgot-password`, `reset-password`, `verify-code` pages. Error objects are untyped, masking potential issues with error-handling logic. 7 `as any` occurrences total in auth flow. |
| Medium | `src/features/template/components/TemplateContent.tsx`, `TranslationContent.tsx` | **setState in useEffect** (`react-hooks/set-state-in-effect`): synchronous `setActiveTab` inside effects causes cascading renders. Should derive tab from props instead. |
| Medium | `src/features/useful-resources/components/EditResourceDialog.tsx` | **setState in useEffect**: `setTitle`/`setDescription` called synchronously inside effect; should use controlled form or `key` prop reset pattern. |
| Medium | `src/app/(public)/verify-code/page.tsx` | **setState in useEffect**: `setCanResend(true)` called synchronously when timer hits 0. |
| Medium | `src/features/template/` (3 files) | **console.error statements** used as error handling in `VersionHistory.tsx` (4 occurrences), `TemplatePage.tsx` (2), `TranslatorTemplatePage.tsx` (1). Errors are logged but may not surface to users or monitoring. |
| Medium | `src/features/dashboard/components/ReportsByMarkets.tsx` | **`any` typed component prop**: `CustomTooltip({ active, payload }: any)` bypasses Recharts tooltip typing. |
| Medium | `src/store/services/exampleApi.ts` | **`any` in API service**: suggests a boilerplate/example file that should be removed or properly typed. |
| Low | `src/components/layout/AppHeader.tsx` | **9 unused imports/variables**: `User`, `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, `languages`, `language`, `setLanguage`. Indicates abandoned language-switcher feature code. |
| Low | `src/components/layout/` (3 files) | **`<img>` instead of `next/image`** (`@next/next/no-img-element`): `AppHeader.tsx`, `AppSideBar.tsx`, `PublicAppHeader.tsx` use raw `<img>` tags, missing Next.js image optimization. |
| Low | `src/components/ui/input.tsx` | **Empty interface** (`@typescript-eslint/no-empty-object-type`): `InputProps` extends `InputHTMLAttributes` without adding members. |
| Low | `src/features/conversion-logic/components/ConversionTranslationDialog.tsx` | **console.error** for failed translations + unstable useEffect dependency (`translationData` recalculated each render). |

## Metrics

- Total debt markers (TODO/FIXME/HACK): 0 (the 1 pattern match is a placeholder string, not a debt marker)
- Debug leaks in non-test files: 8 (all `console.error` calls across 4 files; 0 `console.log`)
- Type bypass count: 9 (`as any`: 8 occurrences across 5 files; `@ts-ignore`: 0; `@ts-nocheck`: 0)
- Lint error count: 29
- Lint warning count: 28

## Top Recommendations

1. **Fix ref-during-render pattern in template components (12 errors, 6 files).** The `onChangeRef.current = onChange` pattern used throughout the template feature is incompatible with React 19's Compiler. Wrap these assignments in `useEffect` or use `useEffectEvent` (React 19) to stabilize callbacks without refs. This is the single highest-density issue area.

2. **Extract `SortableHeader` out of `HistoricalReportsTable` render body (3 errors, 1 file).** Move the component definition to module scope or a separate file, passing sort state via props. The current pattern causes silent state resets on every parent re-render.

3. **Replace `catch (err: any)` with typed error handling in auth pages (7 type bypasses, 4 files).** Define an `ApiError` type matching the backend error shape and use a type guard or RTK Query's `FetchBaseQueryError`. This is the only area where the type system is bypassed and it sits in security-sensitive auth code.

4. **Replace `setState`-in-`useEffect` with derived state or controlled patterns (4 errors, 4 files).** `TemplateContent`, `TranslationContent`, `EditResourceDialog`, and `verify-code` all set state synchronously in effects. Use computed values, the `key` prop reset pattern, or `useSyncExternalStore` instead.

5. **Remove dead code in `AppHeader.tsx` and `exampleApi.ts`.** AppHeader has 9 unused imports from an abandoned language-switcher feature. `exampleApi.ts` appears to be scaffolding. Cleaning these reduces noise in lint output by ~11 warnings and 1 error.
