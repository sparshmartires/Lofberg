# CLAUDE.md

## Project
Löfbergs internal platform for generating sustainability reports and receipts for coffee customers. Used by admins, salespersons, and translators to manage customers, configure report templates with multi-language support, upload certification data via CSV, and generate branded PDF/JPEG outputs with dynamic placeholders (quantity, CO2, area conversions). Frontend for a .NET backend API.

## Stack
- Next.js 16 (App Router, React Compiler enabled)
- React 19
- TypeScript 5 (strict mode, `@/*` path alias → `./src/*`)
- Tailwind CSS 4 (via `@tailwindcss/postcss`)
- Redux Toolkit + RTK Query (state + API layer)
- Radix UI (primitives) + shadcn/ui pattern (`src/components/ui/`)
- TipTap 3 (rich text editing for template content)
- Recharts 3 (dashboard charts)
- react-hook-form (form handling)
- react-day-picker (date inputs)
- xlsx (CSV/Excel parsing for report data upload)
- lucide-react (icons)
- Custom font: BrownStd (loaded from `src/fonts/`)

## Dev commands
```bash
npm install          # install deps
npm run dev          # local dev server
npm run build        # production build
npm run lint         # eslint
```

## Architecture
```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Authenticated routes (dashboard, sales, customers, users, template, etc.)
│   ├── (public)/           # Unauthenticated routes (login, forgot-password, reset-password, verify-code)
│   ├── layout.tsx          # Root layout
│   ├── providers.tsx       # Redux Provider wrapper
│   └── globals.css         # Tailwind + global styles
├── components/
│   ├── ui/                 # Reusable UI primitives (shadcn/ui pattern)
│   └── layout/             # App shell components (header, dropdowns, page headers)
├── features/               # Feature-folder structure — each feature owns its pages + components
│   ├── customers/
│   ├── dashboard/
│   ├── sales/
│   ├── users/
│   ├── template/           # Report + receipt template management (admin)
│   ├── report-generation/  # Multi-step report wizard
│   ├── historical-reports/ # Past reports, drafts, archives
│   ├── conversion-logic/   # Segment + CO2 conversion management
│   ├── profile/
│   └── useful-resources/
├── store/
│   ├── services/           # RTK Query API slices (one per domain: authApi, customersApi, etc.)
│   ├── slices/             # Redux slices (authSlice, reportWizardSlice)
│   ├── hooks.ts            # Typed useAppDispatch/useAppSelector
│   └── index.ts            # Store configuration
├── middleware.ts            # Auth middleware — cookie-based token check, redirects
├── icons/                  # Custom SVG icon components
├── fonts/                  # BrownStd font files
└── lib/utils.ts            # cn() utility (clsx + tailwind-merge)
```

**Key patterns:**
- Feature-folder structure: all business logic lives in `src/features/`, pages are thin re-exports in `src/app/`
- Each RTK Query service file defines its own interfaces/types inline (no shared types package)
- API base URL from `NEXT_PUBLIC_API_URL`, fallback `http://localhost:5215`
- Auth via JWT token stored in cookies (`auth_token`), middleware redirects unauthenticated users to `/login`

## Business logic

### Roles & access
- **Administrator** — full access, manages users/customers/templates/conversions/resources
- **Salesperson** — generates reports, views own reports/customers, limited historical report actions
- **Translator** — translates template content, manages conversion logic translations
- **KeyAccountManager** — similar to Salesperson + account management

### Report generation (5-step wizard)
1. **Customer details** — select existing or enter manual customer (name + logo + segment). Manual customers are not persisted as customers. Select report date, language, salesperson (hidden from salesperson role)
2. **Data source** — CSV upload with column/type validation. Editable table for corrections
3. **Report type** — Report+Receipt or Receipt only. Options for compiled receipt, media screens with size selection
4. **Content selection** — ToC toggle, 3rd-party logo toggle, select 3-of-10 increase impact sections, certification data display, quantity/area/CO2 unit selection from conversion logic
5. **Output & export** — JPEG checkbox (per-receipt images), size selection (A4/A3), preview (no download), generate (triggers download + saves to historical), finish (back to dashboard)

### Placeholders (template system)
Stored in all languages. Replaced at generation time:
- `Quantity` → KGs or cups of coffee (from CSV)
- `Area` → football pitches or segment-specific metric (from conversion logic)
- `CO2 in KG` / `CO2 in equivalent units` → from CSV + conversion logic
- `EUR/NOK FT Cooperative Premium` / `FT Organic Income` → from CSV
- `Time period` → from CSV

### Templates
- Versioned: draft → publish creates new version, archives old
- Pages: Cover, Introduction, USPs, Increase Impact (10 sections), Certifications, Receipts, Compiled Receipt
- Rich text fields via TipTap editor
- Multi-language: admin enters content, translators provide translations per language
- Translation submit workflow: translators save draft or submit for admin review

### Historical reports
- Statuses: **Draft**, **Latest** (most recent per customer), **Past**, **Archived**, **In Progress**, **Failed**
- Editing a report always uses current template version; generates a new entry (never overwrites)
- Archive = soft delete for latest/past, hard delete for drafts
- Salespersons see only their own reports; admins see all

### Customers
- Parent-child hierarchy (subcustomer checkbox + parent dropdown)
- Service tiers: Type A, Type B
- Customer avatars fallback to first 2 letters of name
- Logo required, stored in Azure Blob Storage (`stlofbergdev0426.blob.core.windows.net`)

### Conversion logic
- **Segment-based area conversions** — segment + metric + conversion factor, translatable
- **CO2 quantity conversions** — metric + conversion factor, translatable
- If metric name changes, all translations are deleted

### Session & auth
- JWT tokens, 30-min expiry on inactivity
- Sliding window renewal (server sends `Token-Renewal-Available` header at halfway point)
- First login forces password reset
- Password: min 8 chars, 1 letter, 1 number, 1 special character

### Images
- Saved to Azure Blob Storage in 2 formats: web-optimized + highest-res for print
- Old image hard-deleted on replacement
- Accepts: jpg, png, svg. Max 2MB

## Related systems

### .NET Backend API (`LofbergServices`)
- **Repo:** `C:\Users\Admin\Projects\Others\LofbergsWorkspace\LofbergServices`
- **Architecture:** Clean Architecture — Api / Application (CQRS) / Domain / Infrastructure (EF Core + Identity)
- **Auth:** JWT Bearer (HS256), role-based policies (`AdministratorOnly`, `SalesOrAdmin`, `AdminOrTranslator`, etc.)
- **Base URL:** `NEXT_PUBLIC_API_URL` (default `http://localhost:5215`)
- **Swagger:** Available in dev at `/swagger`
- **Key API groups:** `/auth`, `/users`, `/sales-representatives`, `/customers`, `/templates`, `/reports`, `/conversion-logic`, `/resources`, `/files`, `/roles`, `/languages`, `/segments`, `/regions`
- **Rate limiting:** 100 requests/min, 120 burst
- **Entities:** Customer, Report, Template/TemplateVersion/TemplatePage/TemplatePageContent, Resource, CO2Conversion, SegmentConversion, SegmentTranslation, Language, Region, Segment, ApplicationUser/Role

## Conventions
- Feature-folder pattern: new features go in `src/features/<name>/` with `pages/` and `components/` subdirs
- API services use RTK Query `createApi` with `fetchBaseQuery`; types defined inline in service files
- UI components follow shadcn/ui conventions (Radix primitives + CVA + tailwind-merge)
- Path alias `@/*` for all imports from `src/`
- All backend filtering, sorting, and pagination is server-side — frontend sends query params
- Tables use `src/components/ui/table.tsx` + `app-pagination.tsx` with rows-per-page options (10, 15, 25, 50)
- Forms use react-hook-form
- CSS Modules used sparingly alongside Tailwind (template config, user dialog)
- European number and date formats

## Out of scope
- No customer-facing features (internal tool only)
- No currency conversions
- No ERP integration
- No 3rd-party analytics
- No real-time notifications
- No image editing/cropping
- Do not modify `src/components/ui/` primitives without explicit instruction (shadcn/ui managed)

## Audit Config
- package_manager: npm
- test_runner: none
- lint_cmd: npx eslint .
- src_dirs: src
- exclude_dirs: node_modules, .next, public, .git
- docstring_style: jsdoc
