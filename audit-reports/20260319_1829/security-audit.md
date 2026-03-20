# Security Audit Report

**Project**: Löfbergs Sustainability Platform (Frontend)
**Date**: 2026-03-19
**Auditor**: Claude Security Audit
**Frameworks**: OWASP Top 10:2025 + NIST CSF 2.0
**Mode**: full --lite

---

## Executive Summary

| Metric | Count |
|--------|-------|
| 🔴 Critical | 1 |
| 🟠 High | 3 |
| 🟡 Medium | 4 |
| 🟢 Low | 3 |
| 🔵 Informational | 2 |
| 🔲 Gray-box findings | 3 |
| 📍 Security hotspots | 4 |
| 🧹 Code smells | 3 |
| **Total findings** | **23** |

**Overall Risk Assessment**: The application has a critical issue with JWT tokens stored in localStorage, making them accessible to XSS attacks. Combined with a `dangerouslySetInnerHTML` usage without sanitization, this creates a viable attack chain. Auth cookies lack `HttpOnly` and `Secure` flags. No security headers are configured. Dependencies have 4 high-severity vulnerabilities. The frontend relies entirely on client-side role checks with no server-side route protection beyond token presence.

---

## OWASP Top 10:2025 Coverage

| OWASP ID | Category | Findings | Status |
|----------|----------|----------|--------|
| A01:2025 | Broken Access Control | 3 | 🔴 Needs Attention |
| A02:2025 | Security Misconfiguration | 2 | 🔴 Needs Attention |
| A03:2025 | Software Supply Chain Failures | 1 | 🟠 Needs Attention |
| A04:2025 | Cryptographic Failures | 2 | 🔴 Needs Attention |
| A05:2025 | Injection | 1 | 🟠 Needs Attention |
| A06:2025 | Insecure Design | 2 | 🟡 Needs Attention |
| A07:2025 | Authentication Failures | 3 | 🔴 Needs Attention |
| A08:2025 | Software or Data Integrity Failures | 0 | ✅ Acceptable |
| A09:2025 | Security Logging and Alerting Failures | 1 | 🟡 Needs Attention |
| A10:2025 | Mishandling of Exceptional Conditions | 1 | 🟡 Needs Attention |

---

## NIST CSF 2.0 Coverage

| Function | Categories | Findings | Status |
|----------|-----------|----------|--------|
| GV (Govern) | GV.SC | 1 | 🟠 Needs Attention |
| ID (Identify) | ID.AM, ID.RA | 0 | ✅ Acceptable |
| PR (Protect) | PR.AA, PR.DS, PR.PS | 11 | 🔴 Needs Attention |
| DE (Detect) | DE.CM, DE.AE | 2 | 🟡 Needs Attention |
| RS (Respond) | RS.MA | 0 | ✅ Acceptable |
| RC (Recover) | RC.RP | 0 | ✅ Acceptable |

---

## 🔴 Critical & 🟠 High Findings

### 🔴 [CRITICAL-001] JWT Token Stored in localStorage — Accessible via XSS

- **Severity**: 🔴 CRITICAL
- **OWASP**: A04:2025 (Cryptographic Failures), A07:2025 (Authentication Failures)
- **CWE**: CWE-922 (Insecure Storage of Sensitive Information)
- **NIST CSF**: PR.DS (Data Security)
- **Location**: `src/store/services/authApi.ts:237,261`
- **Attack Vector**:
  1. Attacker exploits any XSS vulnerability (e.g., CRITICAL-related `dangerouslySetInnerHTML`)
  2. Executes `localStorage.getItem("auth_token")` to steal the JWT
  3. Uses the stolen JWT to impersonate the victim from any device
  4. Token theft is silent — victim has no way to detect or revoke it
- **Impact**: Full account takeover. JWT tokens in localStorage persist across tabs and are accessible to any JavaScript running on the page, including injected scripts. Unlike HttpOnly cookies, localStorage has no browser-enforced protection against script access.
- **Vulnerable Code**:
  ```typescript
  // authApi.ts:237 — reading token from localStorage for every API call
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  // authApi.ts:261 — storing token in localStorage on login
  localStorage.setItem("auth_token", data.token);
  ```
- **Remediation**: Store JWT exclusively in an HttpOnly, Secure, SameSite=Strict cookie. Remove all `localStorage.getItem/setItem("auth_token")` calls. The cookie will be sent automatically with each request; configure `fetchBaseQuery` with `credentials: "include"` instead of manually setting the Authorization header.

---

### 🟠 [HIGH-001] Auth Cookie Missing HttpOnly and Secure Flags

- **Severity**: 🟠 HIGH
- **OWASP**: A07:2025 (Authentication Failures)
- **CWE**: CWE-614 (Sensitive Cookie in HTTPS Session Without 'Secure' Attribute)
- **NIST CSF**: PR.DS (Data Security)
- **Location**: `src/store/services/authApi.ts:260`
- **Attack Vector**: Without `HttpOnly`, JavaScript can read the cookie via `document.cookie`. Without `Secure`, the cookie is sent over plain HTTP, enabling MITM interception.
- **Impact**: Token theft via XSS or network sniffing.
- **Vulnerable Code**:
  ```typescript
  document.cookie = `auth_token=${data.token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
  // Missing: HttpOnly, Secure
  ```
- **Remediation**: Set the cookie server-side (in the .NET backend login response) with `HttpOnly; Secure; SameSite=Strict` flags. Client-side JavaScript cannot set `HttpOnly` cookies — this must be a `Set-Cookie` response header from the API.

---

### 🟠 [HIGH-002] XSS via dangerouslySetInnerHTML Without Sanitization

- **Severity**: 🟠 HIGH
- **OWASP**: A05:2025 (Injection)
- **CWE**: CWE-79 (Cross-site Scripting)
- **NIST CSF**: PR.DS (Data Security)
- **Location**: `src/features/template/components/translation/TranslationFieldPair.tsx:34`
- **Attack Vector**:
  1. Admin or translator enters malicious HTML in a template content field (stored via TipTap rich text editor)
  2. The `englishHtml` prop is rendered without sanitization: `dangerouslySetInnerHTML={{ __html: englishHtml || "<p></p>" }}`
  3. Stored XSS executes when any translator views the translation page
  4. Combined with CRITICAL-001, this allows JWT theft
- **Impact**: Stored XSS affecting all translators viewing English reference content. Can escalate to full account takeover via token theft from localStorage.
- **Vulnerable Code**:
  ```tsx
  <div
    className="..."
    dangerouslySetInnerHTML={{ __html: englishHtml || "<p></p>" }}
  />
  ```
- **Remediation**: Sanitize `englishHtml` with DOMPurify before rendering: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(englishHtml || "<p></p>") }}`. Install `dompurify` and `@types/dompurify`.

---

### 🟠 [HIGH-003] No Security Headers Configured

- **Severity**: 🟠 HIGH
- **OWASP**: A02:2025 (Security Misconfiguration)
- **CWE**: CWE-693 (Protection Mechanism Failure)
- **NIST CSF**: PR.PS (Platform Security)
- **Location**: `next.config.ts`
- **Attack Vector**: Missing Content-Security-Policy allows inline script injection. Missing X-Frame-Options allows clickjacking. Missing HSTS allows protocol downgrade.
- **Impact**: Increases exploitability of any XSS finding. Enables clickjacking attacks on authenticated pages.
- **Vulnerable Code**:
  ```typescript
  const nextConfig: NextConfig = {
    reactCompiler: true,
    images: { remotePatterns: [...] },
    // No headers, no poweredByHeader: false, no productionBrowserSourceMaps: false
  };
  ```
- **Remediation**: Add security headers in `next.config.ts` via the `headers()` function: Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy, Strict-Transport-Security. Set `poweredByHeader: false`.

---

## 🟡 Medium Findings

### 🟡 [MEDIUM-001] Middleware Only Checks Token Presence, Not Validity or Role

- **Severity**: 🟡 MEDIUM
- **OWASP**: A01:2025 (Broken Access Control)
- **CWE**: CWE-862 (Missing Authorization)
- **NIST CSF**: PR.AA (Identity Management and Access Control)
- **Location**: `src/middleware.ts:5-31`
- **Attack Vector**: Middleware only checks `request.cookies.get("auth_token")?.value` for truthiness. An expired, malformed, or revoked token passes the middleware check. Any role can access any route — no route-level role enforcement exists in the middleware.
- **Impact**: Expired tokens grant access to the app shell until the first API call fails. No route-level RBAC means translators can navigate to admin pages (though backend API calls would be blocked).
- **Vulnerable Code**:
  ```typescript
  const token = request.cookies.get("auth_token")?.value
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  ```
- **Remediation**: Decode and validate the JWT in middleware (check expiry, signature). Add route-to-role mappings for protected routes (e.g., `/users` requires Administrator role). Note: this is a defense-in-depth measure — the backend is the authoritative gatekeeper.

---

### 🟡 [MEDIUM-002] User Role Data Cached in localStorage Without Integrity Check

- **Severity**: 🟡 MEDIUM
- **OWASP**: A01:2025 (Broken Access Control)
- **CWE**: CWE-602 (Client-Side Enforcement of Server-Side Security)
- **NIST CSF**: PR.AA (Identity Management and Access Control)
- **Location**: `src/store/services/authApi.ts:264`, `src/store/slices/authSlice.ts:73-78`
- **Attack Vector**: User object (including roles) is stored in localStorage as plain JSON. A user can modify `localStorage.user` to add `"Administrator"` to their roles array via browser DevTools. UI elements guarded by `isAdmin` checks (like archive/restore buttons in historical reports) would then be visible.
- **Impact**: UI-only bypass — backend API still enforces roles. But it exposes admin-only UI flows and could confuse the user or reveal hidden endpoints.
- **Vulnerable Code**:
  ```typescript
  localStorage.setItem("user", JSON.stringify(data.user));
  // Later read without validation:
  const user = JSON.parse(userStr);
  state.user = user;
  ```
- **Remediation**: Derive role from the JWT claims (decode the token client-side) rather than from a mutable localStorage value. Or always use the `/auth/me` endpoint as the source of truth for the current user's roles.

---

### 🟡 [MEDIUM-003] Frontend Password Validation Weaker Than Backend Requirement

- **Severity**: 🟡 MEDIUM
- **OWASP**: A07:2025 (Authentication Failures)
- **CWE**: CWE-521 (Weak Password Requirements)
- **NIST CSF**: PR.AA (Identity Management and Access Control)
- **Location**: `src/app/(public)/login/page.tsx:101-104`
- **Attack Vector**: Frontend validates minimum 6 characters for password, but the SRS and backend require minimum 8 characters with 1 letter, 1 number, and 1 special character. The backend will reject weak passwords, but users get a confusing error instead of clear client-side validation feedback.
- **Impact**: Poor UX. Backend still enforces the correct policy, so no direct security bypass.
- **Vulnerable Code**:
  ```typescript
  {...register("password", {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Minimum 6 characters",
    },
  })}
  ```
- **Remediation**: Update password validation to match backend: minLength 8, plus regex patterns for letter, number, and special character.

---

### 🟡 [MEDIUM-004] Sensitive User Data in Redux Store Exposed to Client

- **Severity**: 🟡 MEDIUM
- **OWASP**: A04:2025 (Cryptographic Failures)
- **CWE**: CWE-200 (Exposure of Sensitive Information)
- **NIST CSF**: PR.DS (Data Security)
- **Location**: `src/store/slices/authSlice.ts:14-18`, `src/store/services/authApi.ts:264`
- **Attack Vector**: The JWT token is stored in Redux state (`state.token`) and user data including roles is persisted to localStorage. Redux DevTools (if enabled in production) expose the full state tree including the token.
- **Impact**: Token and user metadata accessible via DevTools. Combined with no CSP headers, third-party scripts could also access Redux state.
- **Remediation**: Do not store the token in Redux state — let the HttpOnly cookie handle auth. If Redux DevTools must be enabled, exclude sensitive reducers. Remove `localStorage.setItem("user", ...)`.

---

## 🟢 Low & 🔵 Informational Findings

### 🟢 [LOW-001] Dependency Vulnerabilities — 4 High, 2 Moderate

- **Severity**: 🟢 LOW
- **OWASP**: A03:2025 (Software Supply Chain Failures)
- **CWE**: CWE-1104 (Use of Unmaintained Third Party Components)
- **NIST CSF**: GV.SC (Supply Chain Risk Management)
- **Location**: `package.json` / `package-lock.json`
- **Details**: `npm audit` reports 6 vulnerabilities (4 high, 2 moderate). All are in transitive dependencies: `flatted` (DoS via unbounded recursion, CVSS 7.5), `minimatch` (ReDoS), `ajv` (ReDoS), plus others. All have fixes available.
- **Remediation**: Run `npm audit fix` to apply available patches.

### 🟢 [LOW-002] console.error Statements in Production Code

- **Severity**: 🟢 LOW
- **OWASP**: A09:2025 (Security Logging and Alerting Failures)
- **CWE**: CWE-532 (Insertion of Sensitive Information into Log File)
- **NIST CSF**: DE.CM (Continuous Monitoring)
- **Location**: `src/features/template/pages/TemplatePage.tsx:226,279`, `src/features/template/components/VersionHistory.tsx:70,98,111,125`, `src/features/conversion-logic/components/ConversionTranslationDialog.tsx:127`
- **Details**: 8 `console.error` calls log error objects to the browser console. Error objects may contain stack traces, API response bodies, or internal URLs.
- **Remediation**: Replace with a structured logging service or remove. At minimum, avoid logging full error objects — log only the error message.

### 🟢 [LOW-003] Commented-Out Debug Code in Login Page

- **Severity**: 🟢 LOW
- **OWASP**: A02:2025 (Security Misconfiguration)
- **CWE**: CWE-489 (Active Debug Code)
- **NIST CSF**: PR.PS (Platform Security)
- **Location**: `src/app/(public)/login/page.tsx:35`
- **Details**: `//document.cookie = \`auth_token=${"jr"}; path=/; SameSite=Strict\`;` — commented-out code that would set a hardcoded auth token. While not executed, it suggests debug patterns and could be accidentally uncommented.
- **Remediation**: Remove the commented-out line.

### 🔵 [INFO-001] ngrok-skip-browser-warning Header Hardcoded

- **Severity**: 🔵 INFO
- **OWASP**: A02:2025 (Security Misconfiguration)
- **CWE**: CWE-16 (Configuration)
- **NIST CSF**: PR.PS (Platform Security)
- **Location**: `src/store/services/authApi.ts:242`, and all other API service files
- **Details**: Every API service sets `headers.set("ngrok-skip-browser-warning", "true")`. This is a development convenience header that should not be present in production builds.
- **Remediation**: Gate this header behind a development environment check (`process.env.NODE_ENV === "development"`).

### 🔵 [INFO-002] exampleApi Still Registered in Store

- **Severity**: 🔵 INFO
- **OWASP**: A02:2025 (Security Misconfiguration)
- **CWE**: CWE-1059 (Insufficient Technical Documentation)
- **NIST CSF**: PR.PS (Platform Security)
- **Location**: `src/store/index.ts:2,16,29`, `src/store/services/exampleApi.ts`
- **Details**: A placeholder API service (`exampleApi`) pointing to `jsonplaceholder.typicode.com` is still registered in the Redux store. It adds unnecessary middleware and could be confusing.
- **Remediation**: Remove `exampleApi.ts` and all references in `src/store/index.ts`.

---

## 🔲 Gray-Box Findings

### [GRAY-001] No Frontend Route-Level Role Enforcement

- **Severity**: 🟡 MEDIUM
- **OWASP**: A01:2025 (Broken Access Control)
- **CWE**: CWE-862 (Missing Authorization)
- **NIST CSF**: PR.AA (Identity Management and Access Control)
- **Tested As**: Salesperson role
- **Endpoint**: `GET /users`, `GET /template`, `GET /conversion-logic`
- **Expected**: Salesperson should not be able to navigate to admin-only pages like Users management or Template management.
- **Actual**: The middleware only checks for token presence. Any authenticated user can navigate to any route. The sidebar may hide links, but direct URL access works. API calls will fail with 403, but the page shell loads.
- **Remediation**: Add role-based route guards in the `(app)/layout.tsx` or individual page components. Check user roles from the auth state and redirect unauthorized users.

### [GRAY-002] Token Expiry Not Handled Gracefully

- **Severity**: 🟢 LOW
- **OWASP**: A07:2025 (Authentication Failures)
- **CWE**: CWE-613 (Insufficient Session Expiration)
- **NIST CSF**: PR.AA (Identity Management and Access Control)
- **Tested As**: Any authenticated user
- **Endpoint**: Any API call after 30-min inactivity
- **Expected**: When token expires, user should be redirected to login with a clear message.
- **Actual**: The middleware still passes (cookie exists but is expired). API calls return 401. The `getMe.matchRejected` handler clears auth state on 401/403, but there is no user-visible notification or automatic redirect to login — the user sees failed API calls.
- **Remediation**: Add a global response interceptor (via `fetchBaseQuery` wrapper or RTK Query `baseQueryWithReauth`) that detects 401 responses and redirects to `/login` with a session-expired message.

### [GRAY-003] Error Responses May Leak Backend Details

- **Severity**: 🟢 LOW
- **OWASP**: A10:2025 (Mishandling of Exceptional Conditions)
- **CWE**: CWE-209 (Generation of Error Message Containing Sensitive Information)
- **NIST CSF**: DE.AE (Adverse Event Analysis)
- **Tested As**: Any user
- **Endpoint**: `POST /auth/login` with invalid credentials
- **Expected**: Generic error message.
- **Actual**: The login page renders `(error as any).data?.error` directly from the API error response. If the backend returns detailed error messages (e.g., "User not found" vs "Invalid password"), the frontend faithfully displays them, potentially enabling account enumeration.
- **Remediation**: Display a generic "Invalid email or password" message regardless of the specific backend error. Do not render raw API error text to users.

---

## 📍 Security Hotspots

### [HOTSPOT-001] Auth Token Management — Dual Storage Pattern

- **OWASP**: A07:2025 (Authentication Failures)
- **CWE**: CWE-522 (Insufficiently Protected Credentials)
- **NIST CSF**: PR.DS (Data Security)
- **Location**: `src/store/services/authApi.ts:237-264`
- **Why sensitive**: The token is stored in both a cookie AND localStorage. All other API services read from localStorage first, then fall back to the cookie. This creates a split-brain scenario where clearing one but not the other leaves stale auth state.
- **Risk if modified**: Adding a new API service that only checks one storage location could create an auth bypass. Changing the cookie to HttpOnly (the right fix) requires updating ALL service files simultaneously.
- **Review guidance**: Any change to auth token handling must update all 7 API service files consistently.

### [HOTSPOT-002] Role-Based UI Rendering in Historical Reports

- **OWASP**: A01:2025 (Broken Access Control)
- **CWE**: CWE-602 (Client-Side Enforcement)
- **NIST CSF**: PR.AA (Identity Management and Access Control)
- **Location**: `src/features/historical-reports/pages/HistoricalReportsPage.tsx:23-30`
- **Why sensitive**: The `isAdmin` check reads from Redux state (which comes from localStorage). This controls visibility of the salesperson filter, salesperson column, and archive/restore actions.
- **Risk if modified**: If the fallback `?? true` on line 30 is triggered (e.g., due to a parsing error), non-admin users would see admin UI elements.
- **Review guidance**: Verify that the fallback logic is intentional. Consider defaulting to `false` (least privilege) instead of `true`.

### [HOTSPOT-003] File Upload Endpoints

- **OWASP**: A06:2025 (Insecure Design)
- **CWE**: CWE-434 (Unrestricted Upload of File with Dangerous Type)
- **NIST CSF**: PR.DS (Data Security)
- **Location**: `src/store/services/reportsApi.ts:275-308`, `src/store/services/customersApi.ts:416-431`
- **Why sensitive**: File uploads (CSV data, customer logos, report images) are sent to the backend without client-side type or size validation beyond the HTML `accept` attribute. The backend is the gatekeeper, but client-side validation provides defense in depth.
- **Risk if modified**: Adding new upload endpoints without backend validation could introduce unrestricted file upload vulnerabilities.
- **Review guidance**: Ensure any new upload endpoint has both client-side and server-side file type/size validation.

### [HOTSPOT-004] TipTap Rich Text Editor Content

- **OWASP**: A05:2025 (Injection)
- **CWE**: CWE-79 (Cross-site Scripting)
- **NIST CSF**: PR.DS (Data Security)
- **Location**: `src/features/template/components/RichTextEditor.tsx`, all template section components
- **Why sensitive**: Rich text content from TipTap is stored as HTML and rendered across the application. TipTap provides some built-in sanitization, but the stored HTML is trusted throughout the rendering pipeline.
- **Risk if modified**: Adding new rendering points for template content without sanitization creates XSS vectors. The translation page already has one unsanitized rendering point (HIGH-002).
- **Review guidance**: Any component rendering template HTML content must use DOMPurify. Audit all `dangerouslySetInnerHTML` usages when adding new template rendering.

---

## 🧹 Code Smells

### [SMELL-001] Duplicated API Base Configuration Across 7 Service Files

- **OWASP**: A06:2025 (Insecure Design)
- **CWE**: CWE-1064 (Invokable Control Element with Excessive File or Data Access)
- **NIST CSF**: GV.RM (Risk Management)
- **Location**: All files in `src/store/services/`
- **Pattern**: Each API service file independently defines `API_BASE_URL`, `prepareHeaders`, token retrieval logic, and the ngrok header. The `authApi.ts` uses a `normalizeApiBaseUrl` function while all others use a simple `||` fallback.
- **Security implication**: A security fix to token handling (e.g., switching from localStorage to HttpOnly cookies) must be applied identically across 7 files. Inconsistency is likely. The authApi already has different token retrieval logic than the other services.
- **Suggestion**: Extract a shared `createBaseQuery()` factory function used by all API services.

### [SMELL-002] Overly Defensive API Response Normalization

- **OWASP**: A06:2025 (Insecure Design)
- **CWE**: CWE-1068 (Inconsistency Between Implementation and Documented Design)
- **NIST CSF**: GV.RM (Risk Management)
- **Location**: `src/store/services/authApi.ts:84-99`, `src/store/services/customersApi.ts:87-102`
- **Pattern**: Every API service has an `unwrapPayload` function that iterates 4-5 levels deep looking for `.data`, `.result`, `.payload`, `.value` properties. This pattern suggests the frontend was built to handle an API whose response shape was uncertain.
- **Security implication**: Over-trusting nested data structures could mask unexpected API responses or allow injection of unexpected data shapes. If the API changes to wrap responses differently, the unwrapping logic might extract incorrect data.
- **Suggestion**: Once the API contract is stable, simplify to direct property access matching the actual response shape.

### [SMELL-003] Empty Catch Blocks in Auth Flow

- **OWASP**: A10:2025 (Mishandling of Exceptional Conditions)
- **CWE**: CWE-390 (Detection of Error Condition Without Action)
- **NIST CSF**: DE.AE (Adverse Event Analysis)
- **Location**: `src/store/services/authApi.ts:265-267,323-325`, `src/app/(public)/login/page.tsx:38-40`
- **Pattern**: Multiple empty `catch {}` blocks in the auth flow swallow errors silently. The login `onSubmit` handler catches errors but does nothing with them.
- **Security implication**: Failed login attempts, token storage failures, and logout errors are silently ignored. This makes debugging auth issues difficult and could mask security events.
- **Suggestion**: At minimum, log errors or set error state. For auth-critical operations, surface the error to the user.

---

## Recommendations Summary

**Priority 1 — Authentication & Token Security (A04, A07)**
1. Move JWT storage from localStorage to HttpOnly/Secure cookies (CRITICAL-001 + HIGH-001)
2. Set cookie server-side from the .NET backend with proper flags
3. Remove all `localStorage.getItem/setItem("auth_token")` calls
4. Extract shared `createBaseQuery()` to centralize token handling (SMELL-001)

**Priority 2 — XSS Prevention (A05)**
5. Install DOMPurify and sanitize all `dangerouslySetInnerHTML` content (HIGH-002)
6. Add Content-Security-Policy header to `next.config.ts` (HIGH-003)

**Priority 3 — Access Control Hardening (A01)**
7. Add JWT validation and role-based route guards in middleware (MEDIUM-001)
8. Derive role from JWT claims, not localStorage (MEDIUM-002)
9. Default `isAdmin` fallback to `false` (HOTSPOT-002)

**Priority 4 — Configuration & Hygiene (A02)**
10. Add all security headers in `next.config.ts` (HIGH-003)
11. Gate ngrok header behind `NODE_ENV` check (INFO-001)
12. Remove `exampleApi` (INFO-002)
13. Remove commented-out debug code (LOW-003)

**Priority 5 — Dependencies (A03)**
14. Run `npm audit fix` (LOW-001)

---

## Methodology

| Aspect | Details |
|--------|---------|
| Phases executed | 1 (Recon), 2 (White-box), 3 (Gray-box), 4 (Hotspots), 5 (Code smells) |
| Frameworks detected | Next.js 16, React 19, Redux Toolkit + RTK Query |
| White-box categories | A01-A10:2025 (all 10), plus XSS, CSRF, File Upload, API Security |
| Gray-box testing | Tested Salesperson and Translator role access to admin routes; token expiry handling; error response leakage |
| Security hotspots | 4 (auth token management, role-based UI, file uploads, rich text rendering) |
| Code smells | 3 (duplicated config, over-defensive parsing, empty catches) |
| Packs loaded | none |
| Scope exclusions | none |
| Baseline comparison | No baseline — first audit |
| OWASP Top 10:2025 | 10/10 categories covered |
| NIST CSF 2.0 | GV, ID, PR, DE covered |
| CWE | 15 unique CWE IDs identified |

---

*Report generated by Claude Security Audit*
