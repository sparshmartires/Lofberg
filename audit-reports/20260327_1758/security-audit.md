# Security Audit Report -- Lofbergs Platform (Lite Mode)

**Date:** 2026-03-27
**Auditor:** Claude Opus 4.6 (Automated Static Analysis)
**Mode:** `--lite` (Phases 1, 2, 4 only -- no gray-box testing, no code smells)
**Tagging:** OWASP Top 10:2025 + CWE + NIST CSF 2.0 only
**Fix mode:** Off (remediation is text description only, no code blocks)

---

## Repositories Under Audit

| Repo | Stack | Path |
|------|-------|------|
| Backend (BE) | .NET 9, EF Core 9, ASP.NET Core Identity, JWT Bearer, PuppeteerSharp, Azure Blob | `C:\Users\Admin\Projects\Others\LofbergsWorkspace\LofbergServices` |
| Frontend (FE) | Next.js 16, React 19, TypeScript, Redux Toolkit + RTK Query, TipTap, Radix UI | `C:\Users\Admin\Projects\Others\LofbergsWorkspace\Lofberg` |

---

## Executive Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 5 |
| MEDIUM | 6 |
| LOW | 3 |
| INFO | 2 |
| **Total** | **18** |

The most severe findings are (1) an unauthenticated IDOR in the change-password endpoint allowing any user to change any other user's password, and (2) the PuppeteerSharp `--no-sandbox` flag combined with user-controlled HTML rendering to headless Chromium. The codebase demonstrates generally good security hygiene -- secrets are externalized, JWT validation is strict, HttpOnly cookies are used for auth tokens, EF Core parameterized queries prevent SQL injection, and DOMPurify is used for the one `dangerouslySetInnerHTML` usage. However, several authorization gaps, missing production CORS configuration, and file upload validation weaknesses require attention.

---

## OWASP Top 10:2025 Coverage

| OWASP ID | Category | Findings | Covered |
|----------|----------|----------|---------|
| A01 | Broken Access Control | CRIT-001, HIGH-001, HIGH-002, MED-001 | Yes |
| A02 | Security Misconfiguration | HIGH-003, MED-002, MED-003 | Yes |
| A03 | Vulnerable & Outdated Components | INFO-001 | Yes |
| A04 | Cryptographic Failures | LOW-002 | Yes |
| A05 | Injection | HIGH-004, MED-004 | Yes |
| A06 | Insecure Design | MED-005, LOW-001 | Yes |
| A07 | Identification & Auth Failures | CRIT-001, HIGH-005 | Yes |
| A08 | Software & Data Integrity Failures | INFO-002 | Yes |
| A09 | Security Logging & Monitoring Failures | MED-006 | Yes |
| A10 | Server-Side Request Forgery | -- | No findings |

---

## NIST CSF 2.0 Coverage

| Function | Category | Findings |
|----------|----------|----------|
| Protect (PR) | PR.AC - Access Control | CRIT-001, HIGH-001, HIGH-002, MED-001 |
| Protect (PR) | PR.DS - Data Security | LOW-002, HIGH-004 |
| Protect (PR) | PR.IP - Information Protection | HIGH-003, MED-002, MED-003, MED-004 |
| Protect (PR) | PR.PT - Protective Technology | CRIT-002, HIGH-005, MED-005 |
| Detect (DE) | DE.CM - Security Continuous Monitoring | MED-006 |
| Identify (ID) | ID.SC - Supply Chain | INFO-001 |

---

## Findings

### CRITICAL

---

#### CRIT-001: Unauthenticated IDOR in Change Password Endpoint

- **Severity:** CRITICAL
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Api/Endpoints/AuthEndpoints.cs` (lines 46-61)
- **Also:** `src/Lofberg.Services.Application/DTOs/Auth/ChangePasswordRequest.cs` (lines 11-16)
- **Also:** `src/Lofberg.Services.Api/Services/AuthService.cs` (lines 96-160)
- **OWASP:** A01 Broken Access Control, A07 Identification & Authentication Failures
- **CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)
- **NIST CSF:** PR.AC-1, PR.AC-4

**Vulnerable Code:**
```
app.MapPost("/auth/change-password", async (ChangePasswordRequest request, ...) => { ... })
    .WithTags("Auth")
    .RequireRateLimiting("ChangePassword");
```
The `ChangePasswordRequest` record accepts a `UserId` from the request body: `public record ChangePasswordRequest(Guid UserId, string CurrentPassword, string NewPassword)`. The endpoint does NOT call `.RequireAuthorization()` -- there is no auth middleware on this route. The handler (`AuthService.ChangePasswordAsync`) uses `request.UserId` directly to find the user via `FindByIdAsync(request.UserId.ToString())` and then changes their password.

- **Attack Vector:** An unauthenticated attacker who knows (or brute-forces) a valid user GUID can call `POST /auth/change-password` with a stolen or guessed `currentPassword` to change that user's password. More critically, the endpoint is designed for first-login password changes where the user is not yet fully authenticated, meaning the attacker only needs the temporary password (sent via email) and the userId (leaked in the login response's `requirePasswordChange` payload at line 67: `userId = user.Id`).
- **Impact:** Full account takeover. An attacker who intercepts or knows the initial password can change any user's password before the legitimate user does, gaining permanent access.
- **Remediation:** Either (1) add `.RequireAuthorization()` and extract the user ID from the JWT claims instead of the request body, or (2) for the first-login flow, issue a short-lived single-use token during the login response that must be presented with the change-password request, rather than accepting an arbitrary userId.

---

#### CRIT-002: PuppeteerSharp Renders Untrusted HTML with --no-sandbox

- **Severity:** CRITICAL
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Infrastructure/Services/PuppeteerPdfRenderingService.cs` (lines 35, 97-100)
- **OWASP:** A05 Injection
- **CWE:** CWE-94 (Improper Control of Generation of Code), CWE-693 (Protection Mechanism Failure)
- **NIST CSF:** PR.PT-3

**Vulnerable Code:**
```csharp
await page.SetContentAsync(html, new NavigationOptions { ... });
// ...
_browser = await Puppeteer.LaunchAsync(new LaunchOptions
{
    Headless = true,
    Args = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
});
```

The `RenderHtmlPagesToPdfAsync` method receives a `List<string> htmlPages` and renders each page in headless Chromium via `SetContentAsync`. The HTML originates from template pages whose content is admin-editable (via `UpdateTemplatePageHtmlCommand`) and merged with user-provided data (customer names, certification data values). Chromium is launched with `--no-sandbox`.

- **Attack Vector:** If an admin account is compromised (or a stored XSS payload enters template HTML), the attacker can inject arbitrary HTML/JavaScript that executes inside headless Chromium. With `--no-sandbox`, a Chromium exploit could escape to the host OS. Even without sandbox escape, the rendered page can make network requests (SSRF), read local files via `file://` protocol, or exfiltrate data.
- **Impact:** Server-side code execution, SSRF from the server, local file disclosure. The `--no-sandbox` flag removes the primary defense layer.
- **Remediation:** (1) Remove `--no-sandbox` and configure the container/server to support Chromium sandboxing. (2) Add `--disable-gpu --disable-extensions --block-new-web-contents --disable-web-security=false` flags. (3) Sanitize all HTML before rendering -- strip `<script>`, `<iframe>`, `<object>`, `<embed>`, event handlers, and `javascript:` URIs. (4) Set `page.SetJavaScriptEnabled(false)` since PDF rendering should not require JS execution. (5) Use `--no-remote` and network isolation to prevent SSRF.

---

### HIGH

---

#### HIGH-001: No CORS Policy Configured for Production

- **Severity:** HIGH
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Api/Program.cs` (lines 325-334, 403-406)
- **OWASP:** A01 Broken Access Control
- **CWE:** CWE-942 (Permissive Cross-domain Policy with Untrusted Domains)
- **NIST CSF:** PR.AC-3

**Vulnerable Code:**
```csharp
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevPolicy");
}
```

CORS middleware is only applied in Development. In Production/Staging, no CORS policy is applied at all. When no CORS middleware is configured, ASP.NET Core does not send `Access-Control-Allow-Origin` headers, which means browsers will block cross-origin requests. However, this also means **no preflight handling exists**, and simple requests (GET/POST with standard headers) from any origin will be processed by the server -- the response just won't be readable by the attacker's script. For cookie-based auth with `credentials: "include"`, the browser won't send cookies without CORS allow-credentials, but this configuration gap needs explicit production CORS.

- **Attack Vector:** In production, the absence of explicit CORS configuration means no `Access-Control-Allow-Origin` is returned, but the server still processes requests. Combined with any CSRF vulnerability, this creates a gap.
- **Impact:** Potential cross-origin request processing without proper access control headers. API responses are not readable cross-origin, but side effects (mutations) could still occur.
- **Remediation:** Add a production CORS policy that explicitly allows only the production frontend origin with `AllowCredentials()`. Apply `UseCors()` unconditionally with environment-specific policies.

---

#### HIGH-002: File Upload Endpoint Lacks Content-Type Validation

- **Severity:** HIGH
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Api/Endpoints/FileEndpoints.cs` (lines 23-56)
- **OWASP:** A01 Broken Access Control (file upload bypass)
- **CWE:** CWE-434 (Unrestricted Upload of File with Dangerous Type)
- **NIST CSF:** PR.IP-1

**Vulnerable Code:**
```csharp
group.MapPost("/upload", async (IFormFile file, string? fileCategory, ...) =>
{
    if (file.Length == 0) return Results.BadRequest(...);
    if (file.Length > 10 * 1024 * 1024) return Results.BadRequest(...);
    await using var uploadStream = file.OpenReadStream();
    var blobUrl = await fileStorageService.UploadFileAsync(file.FileName, file.ContentType, uploadStream, ct);
    return Results.Ok(new { success = true, data = new { fileUrl = blobUrl } });
})
```

The `/files/upload` endpoint validates only file size (10MB limit). It does **not** validate the file content type, file extension, or magic bytes. Any authenticated user with `SalesOrAdmin` policy can upload any file type (HTML, SVG with embedded JS, executable, etc.) to Azure Blob Storage. The blob container is configured with `PublicAccessType.Blob` (line 43 of `AzureBlobStorageService.cs`), meaning uploaded files are publicly accessible by URL.

- **Attack Vector:** An authenticated salesperson uploads a malicious HTML file or SVG with embedded JavaScript. The returned `fileUrl` is a publicly accessible Azure Blob URL. The attacker distributes this URL; when visited, the malicious content executes in the viewer's browser. Since the blob is on a different origin than the app, this is limited to phishing/drive-by attacks rather than session hijacking, but it still constitutes stored XSS via file upload.
- **Impact:** Stored XSS via malicious file upload. Public blob URLs could serve phishing pages or malware.
- **Remediation:** (1) Add file extension and MIME type allowlisting to the `/files/upload` endpoint (only allow image types: JPEG, PNG, SVG). (2) Validate magic bytes to prevent MIME type spoofing. (3) For SVG files, sanitize to remove `<script>` tags and event handlers. (4) Set `Content-Disposition: attachment` on blob uploads to prevent in-browser rendering. (5) Consider using `PublicAccessType.None` with SAS tokens for time-limited access instead of public blob access.

---

#### HIGH-003: Frontend Missing Content-Security-Policy and HSTS Headers

- **Severity:** HIGH
- **Repo:** Frontend
- **File:** `next.config.ts` (lines 6-15)
- **OWASP:** A02 Security Misconfiguration
- **CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers), CWE-693 (Protection Mechanism Failure)
- **NIST CSF:** PR.IP-1

**Vulnerable Code:**
```typescript
async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    }]
  },
```

The frontend sets X-Frame-Options, X-Content-Type-Options, and Referrer-Policy but is **missing** Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), and Permissions-Policy headers. Without CSP, any XSS vulnerability can load and execute arbitrary scripts. Without HSTS on the frontend, users may be susceptible to protocol downgrade attacks.

- **Attack Vector:** An XSS vulnerability (e.g., via the TipTap editor or a future `dangerouslySetInnerHTML` usage) would have no CSP to limit damage. An attacker's injected script can exfiltrate the localStorage user metadata, make authenticated API calls, or redirect to phishing sites.
- **Impact:** No defense-in-depth against XSS. Missing HSTS on frontend allows SSL stripping.
- **Remediation:** Add a Content-Security-Policy header that restricts script-src to 'self' (and 'unsafe-inline' only if needed for Next.js, with nonce-based CSP preferred). Add Strict-Transport-Security with max-age of at least 1 year. Add Permissions-Policy to disable unnecessary browser features. Set `poweredByHeader: false` in Next.js config.

---

#### HIGH-004: Template HTML Content Rendered Unsanitized in PuppeteerSharp

- **Severity:** HIGH
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Application/Features/Reports/GenerateReport/GenerateReportCommandHandler.cs` (lines 250-251, 278, 304)
- **Also:** `src/Lofberg.Services.Api/Endpoints/TemplateEndpoints.cs` (lines 172-182)
- **OWASP:** A05 Injection
- **CWE:** CWE-79 (Cross-site Scripting -- Stored), CWE-94 (Code Injection)
- **NIST CSF:** PR.DS-5, PR.IP-1

**Vulnerable Code:**
```csharp
var mergedHtml = _htmlMergeService.MergePageHtml(page.HtmlContent, finalContentJson, retrievedValues);
mergedHtmlPages.Add(mergedHtml);
```

Template page HTML content is stored in the database and editable by administrators via `PUT /templates/{templateId}/pages/{pageId}/html`. This HTML is then merged with data values and passed directly to PuppeteerSharp for rendering. There is no HTML sanitization at any point in this pipeline. While only administrators can edit template HTML, a compromised admin account or a stored XSS in the admin panel could inject malicious content into templates that gets executed server-side.

- **Attack Vector:** A compromised administrator account injects a `<script>` tag or event handler into template HTML. Every subsequent report generation executes this payload in headless Chromium on the server, enabling SSRF, file access, or data exfiltration.
- **Impact:** Persistent server-side code execution affecting all report generations. Data exfiltration from the server environment.
- **Remediation:** Sanitize template HTML before storing and/or before rendering. Strip `<script>`, `<iframe>`, `<object>`, event handler attributes, and `javascript:` URIs. Use an allowlist-based HTML sanitizer (e.g., HtmlSanitizer NuGet package). Alternatively, disable JavaScript in PuppeteerSharp pages.

---

#### HIGH-005: Login Endpoint Uses General Rate Limit Instead of Strict Auth Rate Limit

- **Severity:** HIGH
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Api/Endpoints/AuthEndpoints.cs` (line 41)
- **OWASP:** A07 Identification & Authentication Failures
- **CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)
- **NIST CSF:** PR.PT-3

**Vulnerable Code:**
```csharp
app.MapPost("/auth/login", async (...) => { ... })
    .WithTags("Auth")
    .RequireRateLimiting("General");
```

The login endpoint uses the "General" rate limiting policy which allows 300 burst requests and replenishes 200 tokens per minute. This is far too permissive for an authentication endpoint. By contrast, the change-password endpoint correctly uses the stricter "ChangePassword" policy (5 burst, 3/min). An attacker can make 300+ login attempts per minute per IP.

- **Attack Vector:** Credential stuffing or brute-force password attacks at scale. While ASP.NET Identity has account lockout (`lockoutOnFailure: true`), the lockout threshold defaults to 5 attempts -- but the high rate limit allows rapid enumeration across many accounts.
- **Impact:** Credential brute-forcing, account lockout denial-of-service across many accounts simultaneously.
- **Remediation:** Create a dedicated "Auth" rate limiting policy with strict limits (e.g., 5 burst, 10 tokens per minute). Apply it to `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`, and `/auth/verify-code`. Also apply rate limiting per username/email in addition to per IP.

---

### MEDIUM

---

#### MED-001: Middleware Auth Check Is Token-Presence Only -- No Role Validation

- **Severity:** MEDIUM
- **Repo:** Frontend
- **File:** `src/middleware.ts` (lines 4-31)
- **OWASP:** A01 Broken Access Control
- **CWE:** CWE-862 (Missing Authorization)
- **NIST CSF:** PR.AC-4

**Vulnerable Code:**
```typescript
const token = request.cookies.get("auth_token")?.value
if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
}
```

The Next.js middleware only checks for the **presence** of the `auth_token` cookie. It does not verify the token's validity, expiration, or the user's role. A Translator role could navigate to admin-only pages (e.g., `/users`, `/customers`) by directly entering the URL. While the backend enforces role-based policies on API calls, the frontend does not guard routes by role.

- **Attack Vector:** A Translator user navigates to `/users` or `/customers` -- the middleware allows access because the cookie exists. The page renders (possibly with empty data if API calls fail with 403), but it reveals the existence and structure of admin features.
- **Impact:** Information disclosure of admin UI structure. No data breach since backend enforces roles, but violates defense-in-depth and may confuse users with error states.
- **Remediation:** Parse the user role from localStorage or from the JWT claims (non-sensitive claims) in middleware. Redirect unauthorized roles to their appropriate pages. Alternatively, implement a client-side route guard component that checks roles before rendering admin pages.

---

#### MED-002: Hardcoded Dev Credentials in Source Code

- **Severity:** MEDIUM
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Infrastructure/Persistence/Seeds/DevUserSeeds.cs` (lines 11-31)
- **OWASP:** A02 Security Misconfiguration
- **CWE:** CWE-798 (Use of Hard-coded Credentials)
- **NIST CSF:** PR.IP-1

**Vulnerable Code:**
```csharp
new DevUserSeed(FirstName: "System", LastName: "Administrator",
    Email: "admin@lofberg.com", Password: "Admin@123!", Role: "Administrator"),
new DevUserSeed(FirstName: "Sales", LastName: "Representative",
    Email: "sales@lofberg.com", Password: "Sales@123!", Role: "Salesperson"),
new DevUserSeed(FirstName: "Content", LastName: "Translator",
    Email: "translator@lofberg.com", Password: "Translator@123!", Role: "Translator"),
```

Development user credentials (email + password) are hardcoded in a source file. The `DbSeeder.SeedDevUsersAsync` method creates these users on every startup. If this seed runs in production (the method is called unconditionally from `SeedAsync`), these well-known credentials would be active.

- **Attack Vector:** If the application is deployed to production with these seeds active, an attacker uses `admin@lofberg.com` / `Admin@123!` to gain full administrator access.
- **Impact:** Full system compromise if dev seeds run in production.
- **Remediation:** Guard `SeedDevUsersAsync` with an environment check (only run in Development). Move dev credentials to user-secrets or environment variables. Add a startup check that prevents known dev credentials from being active in non-development environments.

---

#### MED-003: Azure Blob Containers Created with Public Access

- **Severity:** MEDIUM
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Infrastructure/Services/AzureBlobStorageService.cs` (line 43)
- **Also:** `src/Lofberg.Services.Infrastructure/Services/LogoUploadService.cs` (line 84)
- **OWASP:** A02 Security Misconfiguration
- **CWE:** CWE-284 (Improper Access Control)
- **NIST CSF:** PR.AC-3

**Vulnerable Code:**
```csharp
await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob, cancellationToken: ct);
```

Both the general file storage service and the logo upload service create Azure Blob containers with `PublicAccessType.Blob`. This means every uploaded file (customer logos, report PDFs, resource documents) is publicly accessible to anyone who knows or guesses the URL. Blob URLs follow a predictable pattern (`https://{account}.blob.core.windows.net/{container}/{blobname}`).

- **Attack Vector:** An attacker enumerates or guesses blob URLs to access customer logos, generated PDF reports (which contain business-sensitive sustainability data), and uploaded resources without authentication.
- **Impact:** Unauthorized access to all uploaded files including generated reports with customer data.
- **Remediation:** Use `PublicAccessType.None` for blob containers. Generate short-lived SAS (Shared Access Signature) tokens for authorized file access. Return SAS URLs from the API instead of direct blob URLs. For customer-facing content (logos displayed in reports), consider a CDN with appropriate caching.

---

#### MED-004: Open Redirect in Report Download Endpoint

- **Severity:** MEDIUM
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Api/Endpoints/ReportEndpoints.cs` (line 263)
- **OWASP:** A05 Injection (URL Redirect)
- **CWE:** CWE-601 (URL Redirection to Untrusted Site)
- **NIST CSF:** PR.IP-1

**Vulnerable Code:**
```csharp
if (!string.IsNullOrEmpty(dto.GeneratedFileUrl))
    return Results.Redirect(dto.GeneratedFileUrl);
```

The `/reports/{id}/download` endpoint redirects the user to whatever URL is stored in `GeneratedFileUrl`. While this URL is set by the system during report generation (pointing to Azure Blob), if an attacker can modify the database record (SQL injection elsewhere, compromised admin, or a bug in the update flow), they could set `GeneratedFileUrl` to a malicious URL.

- **Attack Vector:** If `GeneratedFileUrl` is modified to point to a phishing site or malware download, any user clicking "Download" on that report would be redirected.
- **Impact:** Phishing attacks, malware delivery via trusted application flow.
- **Remediation:** Validate that `GeneratedFileUrl` starts with the expected Azure Blob Storage base URL before redirecting. Alternatively, proxy the file download through the API rather than redirecting.

---

#### MED-005: User Roles Stored in Tamper-Accessible localStorage

- **Severity:** MEDIUM
- **Repo:** Frontend
- **File:** `src/store/services/authApi.ts` (lines 237-238, 330-333, 360-362)
- **Also:** `src/store/slices/authSlice.ts` (lines 66-84)
- **OWASP:** A06 Insecure Design
- **CWE:** CWE-602 (Client-Side Enforcement of Server-Side Security)
- **NIST CSF:** PR.PT-1

**Vulnerable Code:**
```typescript
localStorage.setItem("user", JSON.stringify(data.user));
// ...
initializeAuth: (state) => {
    const userStr = localStorage.getItem("user");
    const user = JSON.parse(userStr);
    state.user = user;
    state.isAuthenticated = true;
}
```

User metadata including roles is cached in localStorage and used to hydrate the Redux auth state on page load. An attacker can modify localStorage to add `"Administrator"` to the roles array. Since the middleware (MED-001) only checks for cookie presence, and client-side UI rendering depends on `state.user.roles`, the attacker could see admin UI elements.

- **Attack Vector:** A Salesperson opens DevTools, modifies `localStorage.user` to include `"Administrator"` in the roles array, and refreshes. Admin navigation items and UI elements appear. Backend still enforces roles, so no actual data breach occurs.
- **Impact:** UI-level privilege escalation. No backend data breach, but could reveal admin UI patterns and confuse authorization boundaries.
- **Remediation:** Use the `/auth/me` response as the authoritative source for roles (already called on page load). Do not trust localStorage for role decisions. Add a client-side role check that verifies against the `/auth/me` response before rendering admin components.

---

#### MED-006: Audit Log Does Not Capture Authentication Events

- **Severity:** MEDIUM
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Infrastructure/Persistence/AuditSaveChangesInterceptor.cs` (lines 36-56)
- **OWASP:** A09 Security Logging & Monitoring Failures
- **CWE:** CWE-778 (Insufficient Logging)
- **NIST CSF:** DE.CM-1

The `AuditSaveChangesInterceptor` captures EF Core entity changes (Create/Update/Delete) but does **not** capture authentication events (login attempts, failed logins, password changes, password resets, token refreshes). These events occur in `AuthService` and are logged via `ILogger` (console/debug), but they are not persisted to the `AuditLogs` database table.

- **Attack Vector:** A brute-force attack or account takeover leaves no persistent audit trail in the database. Console logs may be lost when the container restarts.
- **Impact:** Inability to forensically investigate authentication-related security incidents. Login attempts, including failed attempts and account lockouts, are only available in ephemeral console logs.
- **Remediation:** Create explicit audit log entries for authentication events (login success/failure, password change, password reset, account lockout, token refresh). Store these in the AuditLog table or a dedicated security events table with IP address, user agent, and timestamp.

---

### LOW

---

#### LOW-001: Forgot-Password Anti-Timing Delay Is Insufficient

- **Severity:** LOW
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Api/Services/AuthService.cs` (line 191)
- **OWASP:** A06 Insecure Design
- **CWE:** CWE-208 (Observable Timing Discrepancy)
- **NIST CSF:** PR.AC-7

**Vulnerable Code:**
```csharp
await Task.Delay(TimeSpan.FromMilliseconds(200), ct);
```

The forgot-password endpoint adds a 200ms delay for non-existent users to mitigate timing attacks. However, the valid-user path involves database lookup + token generation + email sending (via SendGrid or mock), which likely takes significantly more than 200ms. A statistical timing attack over many requests could still distinguish valid from invalid emails.

- **Attack Vector:** An attacker sends hundreds of forgot-password requests and measures response times. Valid emails take longer (DB + email sending), revealing which emails are registered.
- **Impact:** User enumeration. Low impact since the endpoint already returns a generic message.
- **Remediation:** Measure the average time for the valid-user path and set the artificial delay to match. Alternatively, make the endpoint always async (queue the email) and return immediately for both paths.

---

#### LOW-002: JWT Token Included in Response Body (In Addition to Cookie)

- **Severity:** LOW
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Api/Services/AuthService.cs` (lines 79-91, 154-159)
- **OWASP:** A04 Cryptographic Failures
- **CWE:** CWE-200 (Exposure of Sensitive Information)
- **NIST CSF:** PR.DS-2

**Vulnerable Code:**
```csharp
return AuthResult.Ok(new { token, expiresIn, user = new { ... } });
```

The JWT token is both set as an HttpOnly cookie (good) and returned in the response body (unnecessary). The frontend does not need the token value since it uses `credentials: "include"` for cookie-based auth. Exposing the token in the response body means it is visible in browser DevTools network tab and could be captured by browser extensions.

- **Attack Vector:** A malicious browser extension or XSS payload reads the login response body and exfiltrates the JWT token.
- **Impact:** Token exposure in the response body. Mitigated by the fact that the HttpOnly cookie is the primary auth mechanism.
- **Remediation:** Remove the `token` field from the response body. Only return non-sensitive metadata (user info, expiresIn).

---

#### LOW-003: Dev Seed Users Created Unconditionally on Startup

- **Severity:** LOW
- **Repo:** Backend
- **File:** `src/Lofberg.Services.Infrastructure/Persistence/DbSeeder.cs` (line 81)
- **OWASP:** A02 Security Misconfiguration
- **CWE:** CWE-1188 (Insecure Default Initialization of Resource)
- **NIST CSF:** PR.IP-1

**Vulnerable Code:**
```csharp
await SeedDevUsersAsync(services, logger);
```

The `SeedDevUsersAsync` method is called unconditionally in `SeedAsync` regardless of the environment. While existing users are skipped, a fresh production database would get dev users created on first startup.

- **Attack Vector:** Fresh production deployment creates admin@lofberg.com with known password.
- **Impact:** Privilege escalation on first deployment. Related to MED-002.
- **Remediation:** Wrap `SeedDevUsersAsync` in an `if (env.IsDevelopment())` guard. The `IWebHostEnvironment` can be resolved from the service provider.

---

### INFORMATIONAL

---

#### INFO-001: No Automated Supply Chain Vulnerability Scanning Detected

- **Severity:** INFO
- **Repo:** Both
- **OWASP:** A03 Vulnerable and Outdated Components
- **CWE:** CWE-1104 (Use of Unmaintained Third Party Components)
- **NIST CSF:** ID.SC-2

No `semgrep.json`, `npm audit` results, or `dotnet list package --vulnerable` outputs were found in the expected audit-reports directory (`audit-reports/20260327_1758/`). PuppeteerSharp 21.1.0 is used for PDF rendering -- verify it is the latest patched version. Key FE dependencies (Next.js 16, React 19) should be checked for known CVEs.

- **Impact:** Unknown vulnerabilities in dependencies could be exploitable.
- **Remediation:** Run `npm audit` on the frontend and `dotnet list package --vulnerable` on the backend. Integrate Dependabot or Snyk for continuous monitoring. Document results in audit-reports.

---

#### INFO-002: Ngrok Bypass Header in Production Base Query

- **Severity:** INFO
- **Repo:** Frontend
- **File:** `src/store/services/baseApi.ts` (line 29)
- **OWASP:** A08 Software and Data Integrity Failures
- **CWE:** CWE-489 (Active Debug Code)
- **NIST CSF:** PR.IP-1

**Vulnerable Code:**
```typescript
headers.set("ngrok-skip-browser-warning", "true");
```

The `ngrok-skip-browser-warning` header is sent on every API request, including in production. This reveals that ngrok is (or was) used as a development tunnel and adds unnecessary header overhead.

- **Impact:** Minimal. Information disclosure about development practices. No security vulnerability.
- **Remediation:** Conditionally set this header only when `NEXT_PUBLIC_API_URL` contains "ngrok" or when `NODE_ENV` is "development".

---

## Security Hotspots

The following code areas are flagged for mandatory careful review in all future PRs:

| # | Area | File(s) | Reason |
|---|------|---------|--------|
| 1 | Authentication Flows | `AuthService.cs`, `AuthEndpoints.cs` | Any change to login, password change, or token handling must be reviewed for auth bypass |
| 2 | PuppeteerSharp Rendering | `PuppeteerPdfRenderingService.cs`, `GenerateReportCommandHandler.cs` | HTML-to-PDF pipeline is a server-side code execution risk |
| 3 | Template HTML Storage | `UpdateTemplatePageHtmlCommand`, `TemplateEndpoints.cs` (line 179) | Admin-editable HTML is rendered server-side without sanitization |
| 4 | File Upload Endpoints | `FileEndpoints.cs`, `AzureBlobStorageService.cs`, `LogoUploadService.cs` | Upload validation and blob access controls are security-critical |
| 5 | Report Download Redirect | `ReportEndpoints.cs` (line 263) | Open redirect risk if `GeneratedFileUrl` is tampered |
| 6 | CORS Configuration | `Program.cs` (lines 325-334, 403-406) | Production CORS must be explicitly configured before deployment |
| 7 | Rate Limiting Policies | `Program.cs` (lines 103-180) | Auth endpoints need stricter rate limits than general endpoints |
| 8 | DevUserSeeds | `DevUserSeeds.cs` | Must never execute in production environments |
| 9 | Frontend Middleware | `middleware.ts` | Token-presence-only check offers no role-based route protection |
| 10 | dangerouslySetInnerHTML | `TranslationFieldPair.tsx` (line 37) | DOMPurify is used (good), but any new usage must also sanitize |

---

## Recommendations Summary

### Immediate (Pre-Deploy Blockers)

1. **CRIT-001:** Add authentication and authorization to `/auth/change-password`. Extract userId from JWT claims, not request body.
2. **CRIT-002:** Disable JavaScript in PuppeteerSharp pages. Sanitize HTML before rendering. Remove `--no-sandbox` if deployment supports Chromium sandboxing.
3. **HIGH-001:** Configure explicit production CORS policy. Apply `UseCors()` unconditionally.
4. **HIGH-002:** Add file type allowlisting to `/files/upload`.

### Short-Term (Before First Public Users)

5. **HIGH-003:** Add CSP and HSTS headers to `next.config.ts`.
6. **HIGH-004:** Add server-side HTML sanitization in the report generation pipeline.
7. **HIGH-005:** Create a strict rate limiting policy for login and apply it.
8. **MED-002/LOW-003:** Guard dev user seeding with environment check.
9. **MED-003:** Switch blob containers to private access with SAS tokens.

### Medium-Term

10. **MED-001:** Add role-based route protection in Next.js middleware.
11. **MED-004:** Validate redirect URLs against allowlisted domains.
12. **MED-005:** Use `/auth/me` as authoritative role source, not localStorage.
13. **MED-006:** Persist authentication events to the audit log table.
14. **LOW-002:** Remove JWT from response body; rely on HttpOnly cookie only.

---

## Methodology

- **Phase 1 (Reconnaissance):** Read all endpoint definitions, auth configuration, middleware, data flow paths, and config files in both repositories. Mapped 15 endpoint groups (BE) and the middleware + RTK Query services (FE).
- **Phase 2 (White-Box Analysis):** Static analysis of source code for all 10 OWASP Top 10:2025 categories plus CSRF, file upload, API security, and PuppeteerSharp-specific risks. Checked for raw SQL (none found -- EF Core parameterized queries throughout), XSS sinks (1 found, properly sanitized with DOMPurify), hardcoded secrets (dev seeds only, config values use placeholders).
- **Phase 4 (Security Hotspots):** Identified 10 code areas requiring mandatory security review for future changes.
- **Skipped:** Phase 3 (Gray-box testing), code smell analysis, SANS/ASVS/PCI DSS/ATT&CK/SOC 2/ISO 27001 tagging per `--lite` mode.

**Tools used:** Manual static analysis via file reading, pattern-based code search (grep), file system enumeration (glob).
