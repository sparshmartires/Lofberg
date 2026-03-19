## Summary

The codebase has a recurring pattern of catch blocks that only log to console and continue, silently swallowing failures in critical template and version management operations. There is one fully empty catch block on the login page that hides all authentication errors from the user. Several async mutation calls (archive, restore, create, update, delete conversions) omit error handling entirely, with no try/catch or .catch(). Memory leaks exist from `URL.createObjectURL` calls that are never revoked. The `isNaN` global function is used in two components instead of the safer `Number.isNaN`, though in these specific cases the input is always a number from `parseFloat` so the behavior difference is unlikely to manifest. Overall the error-handling posture is weak: users frequently see generic "check console" messages rather than actionable feedback, and several operations can fail with zero visible indication.

## Findings

| Severity | File / Area | Description |
|----------|-------------|-------------|
| High | `src/app/(public)/login/page.tsx:38-40` | **Empty catch block**: `catch (err: any) { }` -- login errors are completely swallowed. The RTK Query `error` object is checked below via JSX but only for errors with a `data.error` shape; other error shapes (network failures, 500s) produce no user feedback at all. |
| High | `src/features/template/components/VersionHistory.tsx:69-71, 97-98, 110-111, 124-125` | **Console-only error handling** in all four version management operations (create, restore, publish, delete). User sees no error notification; operation silently fails while loading state is reset. |
| High | `src/features/historical-reports/components/HistoricalReportsTable.tsx:108-116` | **Unhandled async mutations**: `archiveReport` and `restoreReport` are awaited without try/catch. A network error or 4xx/5xx will produce an unhandled rejection. The modal closes regardless of success or failure. |
| High | `src/features/conversion-logic/components/CO2Conversions.tsx:33-39, 42-52, 54-57` | **Unhandled async mutations**: `createConversion`, `updateConversion`, and `deleteConversion` are all awaited without try/catch or `.unwrap()`. Failures are invisible to the user. |
| High | `src/features/conversion-logic/components/SegmentBasedConversions.tsx` (same pattern) | **Unhandled async mutations**: same issue as CO2Conversions -- create, update, and delete mutations lack error handling. |
| Medium | `src/store/services/authApi.ts:265-267, 323-325, 350-352, 379-381` | **Empty catch blocks** in `onQueryStarted` for login, logout, getMe, and updateMe. Comments say "Error handling is done in the component" but logout's catch means token/user data may persist in localStorage after a failed logout API call. |
| Medium | `src/features/template/pages/TemplatePage.tsx:225-227, 278-280` | **Console-only error handling with vague user message**: "Failed to save changes. Check console for details." is not actionable for end users. The actual API error detail is discarded. |
| Medium | `src/features/template/pages/TranslatorTemplatePage.tsx:163-165` | Same console-only pattern: "Failed to save. Check console for details." |
| Medium | `src/features/report-generation/components/steps/Step2DataSource.tsx:62-64` | **Silent catch on CSV parsing**: `catch { }` -- if the Excel/CSV file is malformed, the user gets no feedback; the form silently shows default empty rows as if no file was uploaded. |
| Medium | `src/features/report-generation/hooks/useWizardNavigation.ts:51-53` | **Silent failure on draft save**: `catch { return false }` -- returns `false` but the calling component (`ReportWizard.tsx`) never checks the return value, so a failed draft save produces no user feedback. |
| Medium | `src/features/report-generation/components/FileDropZone.tsx:66` | **Memory leak**: `URL.createObjectURL(file)` is called on every render when a file is present but `URL.revokeObjectURL` is never called. The blob URL persists in memory until the page is unloaded. |
| Medium | `src/features/report-generation/components/steps/Step1CustomerDetails.tsx:98` | **Memory leak**: `URL.createObjectURL(file)` is created for logo preview without cleanup. Each logo selection leaks a blob URL. |
| Low | `src/features/conversion-logic/components/CO2Conversions.tsx:36, 44` | **Global `isNaN` instead of `Number.isNaN`**: `isNaN(conversionValue)` after `parseFloat` is functionally equivalent here, but using the global `isNaN` is an inconsistency with the rest of the codebase (which uses `Number.isNaN`) and could mask bugs if input handling changes. |
| Low | `src/features/conversion-logic/components/SegmentBasedConversions.tsx:39, 51` | Same `isNaN` vs `Number.isNaN` inconsistency. |
| Low | `src/features/useful-resources/components/AddResourceDialog.tsx` | **Non-functional form**: the "Add resources" button has no `onClick` handler and the form inputs are uncontrolled with no submit logic. The dialog is a UI shell with no working behavior. |
| Low | `src/app/(public)/login/page.tsx:35` | **Dead code**: commented-out cookie assignment `//document.cookie = ...` left in production code. |
| Low | `src/features/report-generation/components/FileDropZone.tsx:30-33` | **No file type validation on drag-and-drop**: the `accept` prop only restricts the file input picker, not files dropped via drag. A user can drop any file type. |

## Metrics

- Silent error pattern count: 12 (empty catches: 6, console-only catches: 6)
- Async issues: 6 (unhandled mutations: 5 components with no try/catch, 1 draft save with swallowed return)
- Structural logical issues: 4 (2 memory leaks, 2 global isNaN usages)

## Top Recommendations

1. **Add user-facing error feedback to VersionHistory and HistoricalReportsTable**: These perform destructive operations (publish, delete, archive, restore) with no error notification. Wrap in try/catch, call `.unwrap()`, and display the error via a status message or toast.

2. **Fix the login page empty catch block**: Either display the error to the user (the RTK Query `error` state only covers a subset of shapes) or at minimum set a local error state. The current implementation silently swallows all login failures that do not match the `data.error` shape.

3. **Add error handling to all conversion logic mutations**: CO2Conversions and SegmentBasedConversions perform create/update/delete without any try/catch. Add `.unwrap()` and display errors to the user.

4. **Revoke blob URLs created by `URL.createObjectURL`**: In `FileDropZone.tsx` and `Step1CustomerDetails.tsx`, store the blob URL and call `URL.revokeObjectURL()` in a cleanup function (useEffect return) or before creating a new one, to prevent memory leaks.

5. **Replace generic "Check console for details" error messages with actual API error content**: In TemplatePage and TranslatorTemplatePage, extract the error detail from the caught exception and display it to the user instead of directing them to the browser console.
