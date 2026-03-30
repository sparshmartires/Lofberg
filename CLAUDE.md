# CLAUDE.md

## Project
Löfbergs Sustainability Platform frontend — an internal tool for generating sustainability reports and receipts for coffee customers. Used by admins, salespersons, and translators to manage customers, configure report templates with multi-language support, upload certification data via CSV, and generate branded PDF/JPEG outputs with dynamic placeholders. Consumes a .NET backend API.

## Stack
- Next.js 16 (App Router, React Compiler enabled)
- React 19
- TypeScript 5 (strict mode, `@/*` path alias → `./src/*`)
- Tailwind CSS 4 (via `@tailwindcss/postcss`, tw-animate-css)
- Redux Toolkit + RTK Query (state + API layer)
- Radix UI primitives + shadcn/ui pattern (`src/components/ui/`)
- TipTap 3 (rich text editing for template content)
- Recharts 3 (dashboard charts)
- react-hook-form (form handling)
- react-day-picker 9 (date inputs)
- date-fns 4 (date formatting)
- ExcelJS + PapaParse (CSV/Excel parsing for report data upload)
- DOMPurify (HTML sanitization)
- lucide-react (icons)
- @svgr/webpack (SVG as React components)
- Playwright (E2E testing)
- Custom font: BrownStd (loaded from `src/fonts/`)

## Dev commands
```bash
npm install          # install deps
npm run dev          # local dev server (--experimental-https)
npm run build        # production build
npm run lint         # eslint (next.js core-web-vitals + typescript)
npx playwright test  # run E2E tests (testDir: ./e2e)
```

## Architecture
```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Authenticated routes: dashboard, customers, users,
│   │                       #   template, report-generation, historical-reports,
│   │                       #   conversion-logic, profile, useful-resources
│   ├── (public)/           # Unauthenticated: login, forgot-password, reset-password,
│   │                       #   verify-code, change-password
│   ├── layout.tsx          # Root layout
│   ├── providers.tsx       # Redux Provider wrapper
│   └── globals.css         # Tailwind + global styles
├── components/
│   ├── ui/                 # Reusable UI primitives (shadcn/ui pattern — 23 components)
│   └── layout/             # App shell: header, sidebar, page headers
├── features/               # Feature-folder structure — each feature owns pages + components
│   ├── customers/
│   ├── dashboard/
│   ├── users/
│   ├── template/           # Report + receipt template management (admin)
│   ├── report-generation/  # Multi-step report wizard
│   ├── historical-reports/ # Past reports, drafts, archives
│   ├── conversion-logic/   # Segment + CO2 conversion management
│   ├── profile/
│   └── useful-resources/
├── store/
│   ├── services/           # RTK Query API slices (authApi, customersApi, templatesApi,
│   │                       #   reportsApi, usersApi, conversionLogicApi, resourcesApi,
│   │                       #   dashboardApi, salesRepresentativesApi, baseApi)
│   ├── slices/             # Redux slices (authSlice, reportWizardSlice)
│   ├── hooks.ts            # Typed useAppDispatch/useAppSelector
│   └── index.ts            # Store configuration
├── hooks/                  # Custom hooks (useDebounce, useAutoDismiss)
├── middleware.ts           # Auth middleware — cookie-based token check, redirects
├── icons/                  # Custom SVG icon components
├── lib/                    # Utilities: cn() (clsx + tailwind-merge), format, phone
├── fonts/                  # BrownStd font files
└── assets/                 # Static assets
```

**Key patterns:**
- Feature-folder: all business logic in `src/features/`, app route pages are thin re-exports
- RTK Query services define types inline (no shared types package with backend)
- API base URL from `NEXT_PUBLIC_API_URL`, fallback `https://localhost:5215`
- Auth via JWT token in HttpOnly `auth_token` cookie, `credentials: "include"` on all requests
- Middleware redirects unauthenticated users to `/login`, authenticated users away from `/login`

## Business logic

### Roles & access
- **Administrator** — full access to all screens and actions
- **Salesperson** — Dashboard, Generate, Past reports (own only), Useful resources
- **Translator** — Templates (translate only), Conversions (view + translate), Useful resources. NO dashboard access — redirects to /template/translate after login.

Sidebar items are role-dependent. RBAC enforced on both routes and component visibility.

### Report generation (5-step wizard)
State managed in `reportWizardSlice`. Steps:
1. **Customer details** — select existing or manual entry (name + logo + segment). Manual customers not persisted. Report date, language, salesperson (hidden for salesperson role).
2. **Purchase data** — CSV/Excel upload via ExcelJS/PapaParse. Editable table. CO2 value from CSV. Back/forward preserves data.
3. **Output type** — Report+Receipt or ReceiptOnly. Add-ons: compiled receipt, media screens.
4. **Content selection** — ToC toggle, 3rd-party logo, up to 3 of 10 impact blocks, certifications, unit selectors (quantity/area/CO2).
5. **Generate** — Preview (new tab, no persist) or Generate (blob + historical + download). All controls disabled during generation.

Draft: disabled until Step 1 complete. Title: "Draft - [Customer] - [date]". No "Unknown" customer drafts.

### Templates
- Versioned: Draft → Active → Archived. One active version at a time.
- Tab sections: Cover page, About sustainability, USPs, Increasing impact (10 sections), Certifications, Receipt.
- Rich text via TipTap. Multi-language: admin enters English, translators provide translations.
- Publish blocked until all English fields + images filled. Error identifies tab + field.

### Historical reports
- Statuses: Latest, Past, Draft, Archived.
- Editing always uses current template version. Generates new entry (no overwrite).
- Archive: soft delete for latest/past, hard delete for drafts. Salespersons see own reports only.

### Session & auth
- JWT in HttpOnly cookie. 30-min sliding expiry. Server signals renewal via `Token-Renewal-Available` header.
- First login forces password change.
- Password: min 8 chars, 1 letter, 1 number, 1 special character.

### Images
- Max 10 MB on all upload endpoints. JPG, PNG, SVG.
- On replace: old image hard-deleted from Azure Blob Storage.
- User avatars fallback to initials; customer avatars to first 2 letters of name.

### UI standards (from Application Definition)
- "Löfbergs" always with umlaut. No hardcoded asterisks in labels.
- All dropdowns searchable with × clear button. Backspace does not clear selection.
- Search uses debounce. Filter defaults use plural labels ("All statuses", "All regions").
- Tables server-side paginated (10/15/25/50). Card view on mobile/tablet. Long strings ellipsized.
- Toasts dismiss after 10s or on outside click. Success modals have "Ok" button.
- File upload: show file preview OR uploader, never both. × removes file and shows uploader.
- Rich text: static toolbar on desktop, BubbleMenu on mobile.
- Numbers in EU format. Dates in European convention. Phone: `+XX XXXXX XXXXX`.

## Related systems

### .NET Backend API (`LofbergServices`)
- **Repo:** `C:\Users\Admin\Projects\Others\LofbergsWorkspace\LofbergServices`
- **Auth:** JWT Bearer, HttpOnly cookie `auth_token`, `credentials: "include"`
- **Base URL:** `NEXT_PUBLIC_API_URL` env var (default `https://localhost:5215`)
- **Swagger:** `/swagger` in dev
- **API groups:** `/auth`, `/users`, `/customers`, `/templates`, `/reports`, `/conversion-logic`, `/resources`, `/dashboard`, `/files`, `/roles`, `/languages`, `/segments`, `/regions`
- **Response format:** All responses wrapped in `ApiResponse` / `ApiResponse<T>`
- **Azure Blob host:** `stlofbergdev0426.blob.core.windows.net` (configured in `next.config.ts` remotePatterns)

## Conventions
- Feature-folder: new features in `src/features/<name>/` with `pages/` and `components/` subdirs
- API services: RTK Query `createApi` with shared `createBaseQuery()` from `baseApi.ts`; types inline
- UI components follow shadcn/ui (Radix primitives + CVA + tailwind-merge)
- Path alias `@/*` for all imports from `src/`
- All backend filtering, sorting, and pagination is server-side — frontend sends query params
- Tables use `src/components/ui/table.tsx` + `app-pagination.tsx` with rows-per-page (10, 15, 25, 50)
- Forms use react-hook-form
- Security headers set in `next.config.ts`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Dev server uses `--experimental-https`

## Known inconsistencies
- `salesRepresentativesApi.ts` still exists in `src/store/services/` and is registered in the Redux store, but the Application Definition states sales representatives screen and APIs are removed entirely.
- `exampleApi.ts` leftover in `src/store/services/`, registered in Redux store — appears to be scaffolding/template code.
- `KeyAccountManager` role referenced in `SalespersonSearchCombobox.tsx` and `UserDialogForm.tsx` — App Definition specifies only 3 roles (Administrator, Salesperson, Translator).
- Playwright config (`playwright.config.ts`) exists with `testDir: './e2e'` but no `e2e/` directory exists yet.

## Out of scope
- Do not modify `src/components/ui/` primitives without explicit instruction (shadcn/ui managed)
- No customer-facing features (internal tool only)
- No currency conversions or financial calculations
- No ERP integration
- No third-party analytics
- No real-time notifications
- No image editing/cropping
- No cloud storage provider integration
- No sales representatives management screen (removed per spec)

## Audit Config
- package_manager: npm
- test_runner: playwright (npx playwright test)
- lint_cmd: npx eslint .
- src_dirs: src
- exclude_dirs: node_modules, .next, public, .git
- docstring_style: jsdoc
