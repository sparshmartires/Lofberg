# B - Error Handling, Silent Failures, Logical Errors

## Summary

Both the backend and frontend codebases handle errors consistently in most paths, but several notable patterns emerge. The backend contains three completely empty `catch` blocks in `ReportRepository` that silently swallow JSON parsing failures. More critically, the `GenerateReportCommandHandler` catches PDF generation exceptions and continues, allowing reports to be saved to the database without an actual PDF file -- the user receives a "created" response for a report they cannot download. On the frontend, there is no `ErrorBoundary` component anywhere, meaning any unhandled rendering exception will crash the entire application. The `FileReader` usage in `Step2DataSource` lacks `onerror` handlers, and `Step5OutputExport` leaks blob URLs by never calling `URL.revokeObjectURL`. Six auth-related pages use `catch (err: any)` which defeats TypeScript's type safety. Five components use `as any` type assertions to bypass API type contracts, creating a maintenance hazard where backend DTO changes will not produce compile-time errors.

## Findings

| Severity | File / Area | Description |
|----------|-------------|-------------|
| CRITICAL | BE: `Application/Features/Reports/GenerateReport/GenerateReportCommandHandler.cs:332-336` | PDF generation failure is caught, logged, and silently continued. Report is saved to DB and returned as "Created" without a PDF file. User gets a report they cannot download. |
| HIGH | FE: entire app | No `ErrorBoundary` component exists anywhere in the React app. An unhandled rendering error in any component will crash the entire application with a white screen. |
| HIGH | BE: `Infrastructure/Persistence/Repositories/ReportRepository.cs:444,463,479` | Three empty `catch { }` blocks silently swallow JSON parsing errors in `ExtractCustomerNameFromWizardState`, `ExtractSalesRepIdFromWizardState`, and `ExtractSegmentFromWizardState`. Malformed wizard state data will silently produce null/default values with no logging. |
| HIGH | BE: `Infrastructure/Services/AzureBlobStorageService.cs:90` | `uri.Segments.Last()` to extract blob name is incorrect for multi-segment paths. URI segments include trailing slashes (e.g., `["/", "container/", "blob-name"]`), and if the blob is in a virtual directory, only the last segment is used, potentially targeting the wrong blob or failing silently with `DeleteIfExistsAsync`. |
| MEDIUM | FE: `features/report-generation/components/steps/Step2DataSource.tsx:143-170` | `FileReader` instances for CSV and Excel parsing have `onload` handlers but no `onerror` handler. If the file read itself fails (permissions, corrupted file), the user sees no feedback and the UI silently does nothing. |
| MEDIUM | FE: `features/report-generation/components/steps/Step5OutputExport.tsx:140-141` | `URL.createObjectURL(blob)` is called for PDF preview but `URL.revokeObjectURL` is never called. Each preview creates a memory leak. Other blob URL usages in `FileDropZone` and `Step1CustomerDetails` correctly revoke. |
| MEDIUM | FE: `app/(public)/login/page.tsx:46`, `forgot-password/page.tsx:39`, `verify-code/page.tsx:63,114`, `change-password/page.tsx:72`, `reset-password/page.tsx:96` | Six auth pages use `catch (err: any)`, defeating TypeScript type narrowing. Error property access chains like `err?.data?.message || err?.data?.error` are untyped guesses that will silently produce wrong messages if the API error shape changes. |
| MEDIUM | FE: `EditCustomerPage.tsx:194`, `AddCustomerPage.tsx:135`, `CustomerTable.tsx:97,104`, `UsersTable.tsx:150` | Five locations use `as any` to cast API request bodies, bypassing type safety. If backend DTOs change, these will send malformed requests with no compile-time warning. |
| MEDIUM | BE: `Application/Mappers/CustomerMapper.cs:101-104` | `GenerateLogoUrl` catches all exceptions, logs a warning, and returns `null`. A persistent blob storage misconfiguration would cause all customer logos to silently disappear from the UI without any user-visible error. |
| LOW | BE: `Application/Features/Users/CreateUser/CreateUserCommandHandler.cs:66-70` | Welcome email failure is caught and logged but the user creation is reported as successful. While intentional (comment says "Log but don't fail"), there is no mechanism to inform the admin that the email was not sent. The new user has no way to receive credentials. |
| LOW | BE: `Infrastructure/Persistence/Repositories/SalesRepresentativeRepository.cs:140-141,196-197,270` | Three TODO comments indicate `ReportsGenerated` is hardcoded to `0`. This is stale placeholder logic that produces incorrect data in the sales representative listing. |
| LOW | FE: `app/providers.tsx:62` | `refreshToken().catch()` handles refresh failure by logging out, which is correct. However, the catch callback receives no error parameter, so the reason for token refresh failure is never logged anywhere -- makes debugging auth issues difficult. |
| INFO | FE: 9 locations across template/conversion/report features | `console.error` is used in catch blocks for user-facing operations. These provide no value in production and should be replaced with structured error reporting or removed. |

## Metrics

- Silent error pattern count: 7 (3 empty catch blocks in BE ReportRepository, 1 swallowed PDF error in GenerateReportCommandHandler, 1 swallowed logo URL error in CustomerMapper, 1 swallowed email error in CreateUserCommandHandler, 1 swallowed refresh error in FE providers)
- Async issues: 3 (2 missing FileReader.onerror handlers, 1 blob URL memory leak)
- Structural logical issues found: 5 (1 incorrect URI segment extraction, 3 hardcoded TODO placeholders, 6 `err: any` type-unsafe catches counted as 1 pattern)

## Top Recommendations

1. **Fix the silent PDF generation failure (CRITICAL):** In `GenerateReportCommandHandler`, when PDF generation fails at line 332, do not return a "Created" result. Either propagate the error to the caller so the user knows generation failed, or implement a retry mechanism. A report without a downloadable file is useless.

2. **Add a React ErrorBoundary (HIGH):** Wrap the main application layout in an `ErrorBoundary` component that catches rendering errors and shows a recovery UI instead of crashing the entire app. This is a standard React resilience pattern that is entirely absent.

3. **Add logging to empty catch blocks in ReportRepository (HIGH):** Replace the three `catch { }` blocks (lines 444, 463, 479) with `catch (Exception ex) { _logger.LogWarning(ex, "Failed to parse wizard state JSON"); }` at minimum. Silent swallowing of parse errors makes it impossible to diagnose data issues.

4. **Fix blob name extraction in AzureBlobStorageService.DeleteFileAsync (HIGH):** Replace `uri.Segments.Last()` with proper blob path extraction that accounts for URI encoding and virtual directory paths. Consider using `Uri.AbsolutePath` with the container prefix stripped instead.

5. **Add FileReader.onerror handlers and revoke blob URLs (MEDIUM):** In `Step2DataSource`, add `reader.onerror` handlers that set the parse error state. In `Step5OutputExport`, store the created object URL and call `URL.revokeObjectURL` when the component unmounts or when a new preview is generated.
