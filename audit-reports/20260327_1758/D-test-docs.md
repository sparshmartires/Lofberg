# D -- Test Coverage & Documentation Quality

## Summary

Both repositories have significant documentation and test coverage gaps. The frontend has virtually no JSDoc documentation -- only 10 of 139 files with exports contain any JSDoc comments (7.2%), and those comments are concentrated in utility/helper modules while all React components, pages, Redux slices, and API service files lack documentation entirely. The backend fares better with XML doc comments present in 59% of files containing public types (200 of 338 files), but coverage drops sharply in the Application layer (particularly DTOs for Reports, Templates, Dashboard, and Conversion Translations) and the Infrastructure layer. On testing, the backend has a reasonable test-to-source ratio of 0.23 with 95 test files covering 419 source files, though 81 of 574 tests are currently failing. The frontend relies exclusively on Playwright E2E tests (25 test files for 152 source files, ratio 0.16) with no unit or integration tests, and 85 of 148 E2E tests are failing.

## Findings

| Severity | File / Area | Description |
|----------|-------------|-------------|
| HIGH | FE: all component files (129 of 139 export files) | No JSDoc on any exported React component, hook, Redux slice, or API service. Only utility files (`format.ts`, `phone.ts`, `useAutoDismiss.ts`, `baseApi.ts`, `customerLogoRef.ts`, `template/types.ts`, `DataSourceTable.tsx`, `Step2DataSource.tsx`, `customersApi.ts`) have any JSDoc. |
| HIGH | FE: entire codebase | Zero unit tests. All testing is E2E via Playwright. No coverage of individual component logic, Redux reducers, utility functions, or API service transformations. |
| HIGH | FE: E2E suite | 85 of 148 tests failing (57% failure rate). Only 60 tests pass. Test suite is not reliable for regression detection. |
| HIGH | BE: test suite | 81 of 574 tests failing (14% failure rate). Integration tests for SalesRep endpoints failing due to connection issues in `ApiTestBase.GetAdminClientAsync()`. |
| MEDIUM | BE: `src/Lofberg.Services.Application/DTOs/Reports/` | All Report DTOs (`DraftDto`, `GenerateReportRequest`, `ReportDto`, `ReportResult`, `SaveDraftRequest`) lack XML doc comments. These are core business objects. |
| MEDIUM | BE: `src/Lofberg.Services.Application/DTOs/Templates/` | Template DTOs (`CreateDraftRequest`, `SaveActiveChangesRequest`, `SaveTranslationsRequest`, `TemplateDto`, `TemplatePageContentDto`, `TemplatePageDto`, `TemplatePageTranslationDto`) lack XML doc comments. |
| MEDIUM | BE: `src/Lofberg.Services.Application/DTOs/Dashboard/` | `DashboardDtos.cs` has no XML doc comments for any of its 6 public types. |
| MEDIUM | BE: `src/Lofberg.Services.Infrastructure/` (26 of 47 files) | Over half of Infrastructure files with public types lack XML doc. Repositories and services undocumented. |
| MEDIUM | BE: `src/Lofberg.Services.Domain/` (11 of 25 files) | 44% of Domain entity files lack XML doc comments. Domain is the core of the system and should be fully documented. |
| LOW | BE: `src/Lofberg.Services.Api/Endpoints/` | `DashboardEndpoints.cs`, `ReportEndpoints.cs`, and `TemplateEndpoints.cs` lack XML doc comments, unlike all other endpoint files which are documented. |
| LOW | FE: `src/middleware.ts` | Auth middleware has no JSDoc. Exports `middleware` function and `config` object without documentation of route-matching behavior. |
| LOW | FE: `src/store/slices/reportWizardSlice.ts` | Complex Redux slice with 14+ actions and initial state for 5-step wizard. No documentation on any exported action or reducer. |

## Metrics

- FE test coverage %: N/A (E2E only, no unit coverage instrumentation)
- FE test file count: 25
- FE source file count: 152
- FE test-to-source ratio: 0.16
- FE exported symbol count: 250
- FE JSDoc present count: 21
- FE JSDoc compliance %: 7.2% (10 of 139 files with exports have any JSDoc)
- BE test file count: 95
- BE source file count: 419
- BE test-to-source ratio: 0.23
- BE public type count: 709 (across 338 unique files)
- BE XML doc present count: 549 (across 200 unique files)
- BE XML doc compliance %: 59.2% (200 of 338 files with public types have XML docs)

## Top Recommendations

1. **Fix failing test suites before adding new tests.** The BE has 81 failures (many from integration test infrastructure issues in `ApiTestBase`) and the FE has 85 E2E failures. Stabilize these first -- a test suite with >14% failure rate provides no confidence for regression detection.

2. **Add FE unit tests for critical business logic.** Prioritize: Redux slices (`reportWizardSlice`, `authSlice`), utility functions (`format.ts`, `phone.ts`), API service transformations (`reportsApi.ts` unwrapPayload), and the `middleware.ts` route guard. Use Jest + React Testing Library. Target a 0.3+ test-to-source ratio.

3. **Add JSDoc to all exported FE components and hooks.** Start with shared UI components (`app-pagination`, `feedback-dialog`, `search-input`, `date-range-picker`), then feature page components, then API services. Each JSDoc should have a summary line and `@param`/`@returns` tags. This affects 129 files.

4. **Complete BE XML doc coverage for Application DTOs and Domain entities.** The Application/DTOs/Reports, Application/DTOs/Templates, and Domain entity directories are the most impactful gaps. These types define the API contract and business rules. Target 100% XML doc on all public types in these directories.

5. **Add XML doc to Infrastructure repositories and services.** 26 of 47 Infrastructure files lack documentation. Since these implement the repository interfaces consumed by the Application layer, documenting them improves maintainability and onboarding.
