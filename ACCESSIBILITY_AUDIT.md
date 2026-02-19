# Accessibility Audit & WCAG AA Compliance

## Document Overview
This document provides a comprehensive accessibility audit for the Lofberg application, ensuring every screen meets **WCAG 2.1 Level AA** compliance standards. It includes specific checkpoints, current status, and remediation steps for each component and screen.

**Last Updated:** February 19, 2026  
**WCAG Version:** 2.1 Level AA  
**Target Compliance Date:** March 31, 2026

---

## Table of Contents
1. [WCAG AA Principles Overview](#1-wcag-aa-principles-overview)
2. [Screen-by-Screen Audit](#2-screen-by-screen-audit)
3. [Component-Level Compliance](#3-component-level-compliance)
4. [Global Accessibility Requirements](#4-global-accessibility-requirements)
5. [Testing Procedures](#5-testing-procedures)
6. [Remediation Checklist](#6-remediation-checklist)
7. [Compliance Tracking](#7-compliance-tracking)

---

## 1. WCAG AA Principles Overview

### 1.1 The Four Principles (POUR)

#### **Perceivable**
Information and user interface components must be presentable to users in ways they can perceive.

#### **Operable**
User interface components and navigation must be operable.

#### **Understandable**
Information and the operation of user interface must be understandable.

#### **Robust**
Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

### 1.2 WCAG AA Success Criteria Summary

| Criterion | Level | Description |
|-----------|-------|-------------|
| 1.3.1 Info and Relationships | A | Semantic HTML structure |
| 1.4.3 Contrast (Minimum) | AA | 4.5:1 for normal text, 3:1 for large text |
| 1.4.5 Images of Text | AA | Avoid text in images |
| 2.1.1 Keyboard | A | All functionality via keyboard |
| 2.4.3 Focus Order | A | Logical focus order |
| 2.4.7 Focus Visible | AA | Visible focus indicator |
| 3.2.3 Consistent Navigation | AA | Navigation consistency |
| 3.3.1 Error Identification | A | Clear error messages |
| 3.3.2 Labels or Instructions | A | Form labels and instructions |
| 4.1.2 Name, Role, Value | A | Proper ARIA attributes |

---

## 2. Screen-by-Screen Audit

### 2.1 Login Page (`/login`)

#### **Current File:** [src/app/(public)/login/page.tsx](src/app/(public)/login/page.tsx)

#### **Accessibility Checklist**

| Criterion | Status | Notes | Action Required |
|-----------|--------|-------|-----------------|
| **Perceivable** | | | |
| Page has descriptive `<title>` | ⚠️ Needs Review | Verify Next.js metadata | Add: `<title>Login - Löfbergs</title>` |
| Form labels associated with inputs | ✅ Pass | Using label elements | None |
| Color contrast ratio ≥ 4.5:1 | ⚠️ Needs Testing | Must test #1F1F1F on white | Test and adjust if needed |
| Text resizable to 200% | ⚠️ Needs Testing | Test with browser zoom | Ensure no content breaks |
| **Operable** | | | |
| All functionality keyboard accessible | ⚠️ Partial | Form works, links work | Test Tab navigation completely |
| Visible focus indicator | ❌ Fail | Default browser focus may be insufficient | Add custom focus styles |
| Skip navigation link | ❌ Missing | N/A for single form page | Consider for consistency |
| **Understandable** | | | |
| Error messages descriptive | ✅ Pass | "Email is required", "Please enter a valid email" | None |
| Form validation clear | ✅ Pass | Inline error messages | None |
| Consistent navigation | ✅ Pass | "Forgot password" link clear | None |
| **Robust** | | | |
| Valid HTML | ⚠️ Needs Testing | Validate markup | Run HTML validator |
| ARIA attributes correct | ⚠️ Review | Check inputs have proper roles | Add `aria-invalid` on error states |
| Form has proper semantics | ✅ Pass | Uses `<form>` element | None |

#### **Required Fixes**

```tsx
// 1. Add page title in layout or metadata
export const metadata = {
  title: 'Login - Löfbergs',
  description: 'Log in to access the Löfbergs user management system'
}

// 2. Add visible focus styles (globals.css)
*:focus-visible {
  outline: 2px solid #1F1F1F;
  outline-offset: 2px;
}

// 3. Add aria-invalid to inputs with errors
<Input
  type="email"
  placeholder="email@lofberg.se"
  aria-invalid={errors.email ? "true" : "false"}
  aria-describedby={errors.email ? "email-error" : undefined}
  {...register("email", {
    required: "Email is required",
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: "Please enter a valid email",
    },
  })}
/>

{errors.email && (
  <p id="email-error" className="text-caption text-destructive" role="alert">
    {errors.email.message}
  </p>
)}

// 4. Add heading for screen readers
<h1 className="sr-only">Login to Löfbergs</h1>
// Or make "Welcome back" a proper h1
<h1 className="text-display-xl text-foreground">
  Welcome back
</h1>
```

---

### 2.2 Forgot Password Page (`/forgot-password`)

#### **Current File:** [src/app/(public)/forgot-password/page.tsx](src/app/(public)/forgot-password/page.tsx)

#### **Accessibility Checklist**

| Criterion | Status | Notes | Action Required |
|-----------|--------|-------|-----------------|
| **Perceivable** | | | |
| Page title descriptive | ⚠️ Needs Review | Add metadata | `<title>Forgot Password - Löfbergs</title>` |
| Heading structure logical | ⚠️ Needs Review | Check h1, h2 hierarchy | Ensure proper heading levels |
| Color contrast sufficient | ⚠️ Needs Testing | Test all text colors | Verify 4.5:1 ratio |
| **Operable** | | | |
| Back button keyboard accessible | ✅ Pass | Using `<button>` | None |
| Back button has accessible name | ⚠️ Review | ArrowLeft icon needs label | Add `aria-label="Go back"` |
| Focus visible | ❌ Fail | Custom focus styles needed | Add focus-visible styles |
| **Understandable** | | | |
| Purpose of page clear | ✅ Pass | Clear heading and description | None |
| Input instructions clear | ✅ Pass | "Enter your email or phone number" | None |
| **Robust** | | | |
| ARIA for back button | ⚠️ Review | Icon-only button needs label | Add aria-label |
| Form semantics correct | ✅ Pass | Uses form element | None |

#### **Required Fixes**

```tsx
// 1. Add aria-label to back button
<button
  onClick={() => router.back()}
  aria-label="Go back"
  className="flex items-center gap-2 text-[14px] text-[#1F1F1F] mb-8 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F1F1F]"
>
  <ArrowLeft size={16} aria-hidden="true" />
  Back
</button>

// 2. Add proper heading structure
<h1 className="text-[32px] leading-[120%] tracking-[-0.04em] font-normal text-[#1F1F1F]">
  Forgot Password
</h1>

// 3. Add aria-describedby for helper text
<Input
  type="text"
  placeholder="Enter your email or phone number"
  aria-describedby="email-helper"
  {...register("emailOrPhone", {
    required: "Email or phone number is required",
  })}
/>

<p id="email-helper" className="text-caption text-muted-foreground">
  We'll send you a verification code
</p>
```

---

### 2.3 Verify Code Page (`/verify-code`)

#### **Current File:** [src/app/(public)/verify-code/page.tsx](src/app/(public)/verify-code/page.tsx)

#### **Accessibility Checklist**

| Criterion | Status | Notes | Action Required |
|-----------|--------|-------|-----------------|
| **Perceivable** | | | |
| Page title descriptive | ⚠️ Needs Review | Add metadata | `<title>Verify Code - Löfbergs</title>` |
| OTP inputs labeled | ❌ Fail | Inputs lack accessible names | Add aria-label to each input |
| Timer accessible | ⚠️ Review | Screen readers need to know time | Use aria-live for countdown |
| **Operable** | | | |
| OTP inputs keyboard navigable | ⚠️ Needs Testing | Auto-focus between inputs | Test full keyboard flow |
| Resend button accessible | ✅ Pass | Button element used | None |
| **Understandable** | | | |
| Purpose of inputs clear | ⚠️ Partial | Visual but not for screen readers | Add instructions |
| Error messages clear | ⚠️ Review | Check error display | Ensure errors are announced |
| **Robust** | | | |
| ARIA roles for OTP inputs | ❌ Missing | Inputs need proper labeling | Add role and labels |
| Live region for timer | ❌ Missing | Timer updates not announced | Add aria-live region |

#### **Required Fixes**

```tsx
// 1. Add proper labels to OTP inputs
<div className="flex gap-4" role="group" aria-label="Enter 5-digit verification code">
  {code.map((digit, index) => (
    <input
      key={index}
      id={`code-${index}`}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={(e) => handleChange(e.target.value, index)}
      onKeyDown={(e) => handleKeyDown(e, index)}
      aria-label={`Digit ${index + 1} of 5`}
      aria-invalid={error ? "true" : "false"}
      className="w-16 h-16 text-center text-2xl border-2 rounded-lg focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    />
  ))}
</div>

// 2. Add live region for countdown
<p aria-live="polite" aria-atomic="true" className="text-caption text-muted-foreground">
  {canResend ? (
    "You can now resend the code"
  ) : (
    `Resend code in ${seconds} seconds`
  )}
</p>

// 3. Add error announcement
{error && (
  <p role="alert" className="text-caption text-destructive">
    {error}
  </p>
)}

// 4. Add instructions
<p id="otp-instructions" className="text-body text-muted-foreground">
  Enter the 5-digit code sent to {email}
</p>
```

---

### 2.4 Reset Password Page (`/reset-password`)

#### **Current File:** [src/app/(public)/reset-password/page.tsx](src/app/(public)/reset-password/page.tsx)

#### **Accessibility Checklist**

| Criterion | Status | Notes | Action Required |
|-----------|--------|-------|-----------------|
| **Perceivable** | | | |
| Page title descriptive | ⚠️ Needs Review | Add metadata | `<title>Reset Password - Löfbergs</title>` |
| Password visibility toggle accessible | ❌ Fail | Icon buttons need labels | Add aria-label |
| Color contrast sufficient | ⚠️ Needs Testing | Test colors | Verify ratios |
| **Operable** | | | |
| Show/Hide password keyboard accessible | ✅ Pass | Using buttons | None |
| Show/Hide has accessible name | ❌ Fail | Icon-only buttons | Add aria-label |
| **Understandable** | | | |
| Password requirements clear | ⚠️ Review | Check if requirements shown | Display password rules |
| Match validation clear | ✅ Pass | "Passwords must match" | None |
| **Robust** | | | |
| ARIA for toggle buttons | ❌ Missing | Need aria-pressed or aria-label | Add proper ARIA |
| Password input type toggles | ⚠️ Review | type="password" to type="text" | Ensure it works |

#### **Required Fixes**

```tsx
// 1. Add accessible name to visibility toggle
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  aria-label={showPassword ? "Hide password" : "Show password"}
  aria-pressed={showPassword}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
>
  {showPassword ? (
    <EyeOff size={20} aria-hidden="true" />
  ) : (
    <Eye size={20} aria-hidden="true" />
  )}
</button>

// 2. Add password requirements
<div id="password-requirements" className="text-caption text-muted-foreground">
  <p>Password must:</p>
  <ul className="list-disc pl-5">
    <li>Be at least 6 characters long</li>
    <li>Contain at least one number (optional enhancement)</li>
    <li>Contain at least one special character (optional enhancement)</li>
  </ul>
</div>

<Input
  type={showPassword ? "text" : "password"}
  placeholder="Enter new password"
  aria-describedby="password-requirements"
  {...register("password", {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  })}
/>

// 3. Add proper heading
<h1 className="text-[32px] leading-[120%] tracking-[-0.04em] font-normal text-[#1F1F1F]">
  Reset Password
</h1>
```

---

### 2.5 Users Management Page (`/users`)

#### **Current File:** [src/features/users/pages/UsersPage.tsx](src/features/users/pages/UsersPage.tsx)

#### **Accessibility Checklist**

| Criterion | Status | Notes | Action Required |
|-----------|--------|-------|-----------------|
| **Perceivable** | | | |
| Page title descriptive | ⚠️ Needs Review | Add metadata | `<title>User Management - Löfbergs</title>` |
| Heading hierarchy correct | ✅ Pass | h1 "User Management" present | None |
| Table has proper structure | ⚠️ Needs Review | Check UsersTable component | See table section below |
| **Operable** | | | |
| Add User button accessible | ✅ Pass | Button with icon and text | None |
| Pagination keyboard accessible | ⚠️ Needs Review | Check pagination component | See pagination section |
| Table row actions accessible | ⚠️ Needs Review | Edit/delete buttons | Needs labels |
| **Understandable** | | | |
| Page purpose clear | ✅ Pass | Clear heading and description | None |
| User count displayed | ✅ Pass | "System Users ({users.length})" | None |
| **Robust** | | | |
| Semantic HTML for layout | ✅ Pass | Good structure | None |
| ARIA for dialogs | ⚠️ Needs Review | Check dialog components | See dialog section |

#### **Required Fixes**

```tsx
// 1. Ensure Add User button has proper accessible name (already good)
<Button variant="primary" onClick={() => setOpen(true)}>
  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
  Add User
</Button>

// 2. Add landmark regions
<main>
  <div className="min-h-screen bg-background py-10">
    {/* Header section */}
    <header className="flex items-start justify-between pb-10">
      {/* ... */}
    </header>

    {/* Main content */}
    <section aria-label="User management table">
      <div className="rounded-[24px] border border-border bg-white p-8 shadow-sm">
        {/* ... */}
      </div>
    </section>
  </div>
</main>

// 3. Add live region for user count updates
<h2 
  className="text-[18px] leading-[120%] tracking-[0em] font-normal text-[#1F1F1F]"
  aria-live="polite"
>
  System Users ({users.length})
</h2>
```

---

### 2.6 Users Table Component

#### **Current File:** [src/features/users/components/UsersTable.tsx](src/features/users/components/UsersTable.tsx)

#### **Accessibility Checklist**

| Criterion | Status | Notes | Action Required |
|-----------|--------|-------|-----------------|
| **Perceivable** | | | |
| Table has caption or aria-label | ❌ Missing | Screen readers need context | Add caption or aria-label |
| Column headers properly marked | ⚠️ Needs Review | Check `<th>` usage | Verify TableHead component |
| Status badges distinguishable without color | ⚠️ Review | Check if text alone is clear | May need additional indicator |
| **Operable** | | | |
| Edit/Delete buttons keyboard accessible | ✅ Pass | Using buttons | None |
| Edit/Delete have accessible names | ❌ Fail | Icon-only buttons | Add aria-label |
| Row selection keyboard accessible | N/A | Not implemented | N/A |
| **Understandable** | | | |
| Table structure clear | ✅ Pass | Proper headers | None |
| Sortable columns indicated | N/A | Not implemented | If added, use aria-sort |
| **Robust** | | | |
| Table semantics correct | ⚠️ Needs Review | Verify Table component | Check implementation |
| Row headers identified | ⚠️ Review | First column may need scope | Add scope="row" |

#### **Required Fixes**

```tsx
// 1. Add table caption
<Table aria-label="System users list">
  <TableHeader>
    <TableRow>
      <TableHead scope="col">User</TableHead>
      <TableHead scope="col">Email</TableHead>
      <TableHead scope="col">Role</TableHead>
      <TableHead scope="col">Status</TableHead>
      <TableHead scope="col">Reports</TableHead>
      <TableHead scope="col">Last Login</TableHead>
      <TableHead scope="col">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* ... */}
  </TableBody>
</Table>

// 2. Add accessible names to action buttons
<button
  onClick={() => setEditUser(user)}
  aria-label={`Edit ${user.name}`}
  className="p-2 hover:bg-muted rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
>
  <Pencil className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
</button>

<button
  onClick={() => handleDelete(user.id)}
  aria-label={`Delete ${user.name}`}
  className="p-2 hover:bg-destructive/10 rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
>
  <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
</button>

// 3. Add scope to name cell
<TableCell scope="row">
  <div className="flex items-center gap-3">
    <Image
      src={user.avatar}
      alt={`${user.name}'s avatar`}
      width={40}
      height={40}
      className="rounded-full"
    />
    <span className="font-medium">{user.name}</span>
  </div>
</TableCell>

// 4. Ensure status badge is accessible
<Badge variant={user.status === "Active" ? "success" : "secondary"}>
  <span aria-label={`Status: ${user.status}`}>
    {user.status}
  </span>
</Badge>
```

---

### 2.7 Add User Dialog

#### **Current File:** [src/features/users/components/AddUserDialog.tsx](src/features/users/components/AddUserDialog.tsx)

#### **Accessibility Checklist**

| Criterion | Status | Notes | Action Required |
|-----------|--------|-------|-----------------|
| **Perceivable** | | | |
| Dialog has accessible title | ⚠️ Needs Review | DialogTitle component | Verify it uses aria-labelledby |
| Form labels associated | ✅ Pass | Using label elements | None |
| Required fields indicated | ⚠️ Partial | Asterisk used | Also add aria-required |
| **Operable** | | | |
| Dialog traps focus | ⚠️ Needs Review | Check Dialog component | Verify focus trap |
| Escape closes dialog | ⚠️ Needs Review | Check Dialog component | Should close on ESC |
| Close button accessible | ⚠️ Review | showCloseButton={false} | Consider adding close button |
| **Understandable** | | | |
| Required fields clear | ✅ Pass | Asterisk and validation | None |
| Error messages descriptive | ✅ Pass | Clear validation messages | None |
| **Robust** | | | |
| Dialog role correct | ⚠️ Needs Review | Check Dialog component | Should have role="dialog" |
| ARIA attributes proper | ⚠️ Needs Review | Check aria-labelledby, aria-describedby | Verify implementation |

#### **Required Fixes**

```tsx
// 1. Add aria-required to required inputs
<Input
  placeholder="Enter first name"
  aria-required="true"
  aria-invalid={errors.firstName ? "true" : "false"}
  aria-describedby={errors.firstName ? "firstName-error" : undefined}
  {...register("firstName", {
    required: "First name is required",
  })}
/>

{errors.firstName && (
  <p id="firstName-error" className="text-caption text-destructive" role="alert">
    {errors.firstName.message}
  </p>
)}

// 2. Ensure select has accessible name
<Select
  onValueChange={(value) => field.onChange(value)}
  value={field.value}
>
  <SelectTrigger aria-label="Select user role" aria-required="true">
    <SelectValue placeholder="Select Role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="admin">Administrator</SelectItem>
    <SelectItem value="salesperson">Salesperson</SelectItem>
    <SelectItem value="manager">Manager</SelectItem>
  </SelectContent>
</Select>

// 3. Add close button for accessibility
<DialogContent
  showCloseButton={true} // Change to true
  className="max-w-[880px] rounded-[32px] p-10 bg-white"
  aria-describedby="dialog-description"
>
  {/* ... */}
</DialogContent>

// 4. Ensure dialog description is connected
<DialogDescription id="dialog-description" className="...">
  Enter the user details below.
</DialogDescription>
```

---

### 2.8 App Header Component

#### **Current File:** [src/components/layout/AppHeader.tsx](src/components/layout/AppHeader.tsx)

#### **Accessibility Checklist**

| Criterion | Status | Notes | Action Required |
|-----------|--------|-------|-----------------|
| **Perceivable** | | | |
| Logo has alt text | ❌ Fail | Using img without proper alt | Change to Image component with alt |
| Header role defined | ⚠️ Review | Using `<header>` | Add role="banner" |
| Color contrast sufficient | ⚠️ Needs Testing | Text on primary background | Test contrast |
| **Operable** | | | |
| Hamburger menu accessible | ⚠️ Partial | Has aria-label | Add aria-expanded state |
| Dropdown menus keyboard accessible | ❌ Fail | Custom dropdowns may not work | Implement keyboard support |
| Skip to main content | ❌ Missing | No skip link | Add skip navigation |
| **Understandable** | | | |
| Menu purpose clear | ✅ Pass | "Open menu" label | None |
| Dropdown states clear | ⚠️ Review | Visual indication needed | Add aria-expanded |
| **Robust** | | | |
| Navigation semantics | ⚠️ Review | May need `<nav>` element | Wrap navigation in nav |
| ARIA for dropdowns | ❌ Missing | Need aria-haspopup, aria-expanded | Add ARIA attributes |

#### **Required Fixes**

```tsx
// 1. Add skip to main content link
export default function AppHeader() {
  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>
      
      <header role="banner" className="w-full bg-primary text-primary-foreground px-10 flex items-center justify-between" style={{ paddingTop: "16px", paddingBottom: "16px" }}>
        {/* ... */}
      </header>
    </>
  )
}

// 2. Fix logo accessibility
<Image
  src="/coffee.png"
  alt="Löfbergs Coffee - Home"
  width={125}
  height={40}
/>

// 3. Add proper ARIA to hamburger menu
<button
  aria-label="Open navigation menu"
  aria-expanded={isMenuOpen}
  aria-haspopup="true"
  onClick={() => setIsMenuOpen(!isMenuOpen)}
  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/90 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
>
  <Menu className="w-6 h-6 text-accent" aria-hidden="true" />
</button>

// 4. Fix language dropdown
<button
  onClick={() => setIsLangOpen(!isLangOpen)}
  aria-label="Select language"
  aria-expanded={isLangOpen}
  aria-haspopup="listbox"
  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/90 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
>
  <span>Svenska</span>
  <ChevronDown className="w-4 h-4" aria-hidden="true" />
</button>

{isLangOpen && (
  <div role="listbox" aria-label="Language options">
    <button role="option" aria-selected="true">Svenska</button>
    <button role="option" aria-selected="false">English</button>
  </div>
)}

// 5. Add navigation wrapper
<nav aria-label="Main navigation">
  <div className="flex items-center gap-4">
    {/* Navigation items */}
  </div>
</nav>
```

---

### 2.9 404 Not Found Page

#### **Current File:** [src/app/not-found.tsx](src/app/not-found.tsx)

#### **Accessibility Checklist**

| Criterion | Status | Notes | Action Required |
|-----------|--------|-------|-----------------|
| **Perceivable** | | | |
| Page title descriptive | ⚠️ Needs Review | Add metadata | `<title>404 - Page Not Found - Löfbergs</title>` |
| Illustration has alt text | ✅ Pass | "404 Coffee Not Found" | Good, descriptive |
| Heading hierarchy correct | ⚠️ Review | h1 present | Ensure no skipped levels |
| **Operable** | | | |
| Link keyboard accessible | ✅ Pass | Using Link component | None |
| All functionality available via keyboard | ✅ Pass | Simple page | None |
| **Understandable** | | | |
| Error clearly communicated | ✅ Pass | Clear 404 message | None |
| Action to resolve clear | ✅ Pass | "Let's brew a new batch" button | None |
| **Robust** | | | |
| Semantic HTML | ✅ Pass | Good structure | None |
| Landmarks defined | ⚠️ Review | Add main landmark | Wrap content in `<main>` |

#### **Required Fixes**

```tsx
// 1. Add main landmark
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Brand Border */}
      <div className="h-2 bg-primary w-full" role="presentation" />

      <main id="main-content" className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-6">
          {/* ... existing content ... */}
        </div>
      </main>
    </div>
  )
}

// 2. Ensure image alt is descriptive (already good)
<Image
  src="/notfound.png"
  alt="Illustration of an empty coffee pot representing page not found"
  width={400}
  height={400}
  sizes="(max-width: 768px) 250px, 400px"
  className="w-[300px] h-auto"
/>

// 3. Add metadata
export const metadata = {
  title: '404 - Page Not Found - Löfbergs',
  description: 'The page you are looking for could not be found.'
}
```

---

## 3. Component-Level Compliance

### 3.1 Button Component

#### **File:** [src/components/ui/button.tsx](src/components/ui/button.tsx)

#### **Requirements**

| Requirement | Implementation |
|-------------|----------------|
| Accessible name | Must have text content or aria-label |
| Focus visible | Custom focus-visible styles required |
| Disabled state | Proper disabled attribute and aria-disabled |
| Loading state | aria-busy="true" when loading |
| Icon-only buttons | Must have aria-label |

#### **Implementation Example**

```tsx
// Global focus styles (add to globals.css)
.focus-visible:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

// Button variants should include focus styles
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary",
        // ... other variants
      },
    },
  }
)
```

---

### 3.2 Input Component

#### **File:** [src/components/ui/input.tsx](src/components/ui/input.tsx)

#### **Requirements**

| Requirement | Implementation |
|-------------|----------------|
| Associated label | Use label with htmlFor or aria-label |
| Error state | aria-invalid and aria-describedby |
| Required fields | aria-required="true" |
| Placeholder | Not a replacement for label |
| Auto-complete | Appropriate autocomplete attribute |

#### **Implementation Example**

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  isRequired?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, isRequired, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random()}`
    const errorId = `${inputId}-error`
    
    return (
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
        aria-required={isRequired}
        {...props}
      />
    )
  }
)
```

---

### 3.3 Dialog Component

#### **File:** [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx)

#### **Requirements**

| Requirement | Implementation |
|-------------|----------------|
| Role | role="dialog" or role="alertdialog" |
| Accessible name | aria-labelledby pointing to title |
| Description | aria-describedby for description |
| Focus trap | Focus locked inside dialog |
| ESC to close | Keyboard handler |
| Return focus | Focus returns to trigger element |
| Backdrop | Non-interactive backdrop |

---

### 3.4 Select Component

#### **File:** [src/components/ui/select.tsx](src/components/ui/select.tsx)

#### **Requirements**

| Requirement | Implementation |
|-------------|----------------|
| Accessible name | aria-label or associated label |
| Keyboard navigation | Arrow keys, Enter, ESC |
| Selected value announced | aria-selected on options |
| Expanded state | aria-expanded on trigger |

---

### 3.5 Table Component

#### **File:** [src/components/ui/table.tsx](src/components/ui/table.tsx)

#### **Requirements**

| Requirement | Implementation |
|-------------|----------------|
| Caption or aria-label | Describe table purpose |
| Column headers | `<th scope="col">` |
| Row headers | `<th scope="row">` for first column |
| Sortable columns | aria-sort attribute |
| Empty state | Meaningful message, not just blank |

---

## 4. Global Accessibility Requirements

### 4.1 Color Contrast Standards

#### **WCAG AA Requirements:**
- **Normal text:** 4.5:1 minimum contrast ratio
- **Large text (18pt+):** 3:1 minimum contrast ratio
- **UI components:** 3:1 minimum contrast ratio

#### **Colors to Test:**

| Element | Foreground | Background | Ratio Required | Status |
|---------|------------|------------|----------------|--------|
| Body text | #1F1F1F | #FFFFFF | 4.5:1 | ⚠️ Test |
| Muted text | #747474 | #FFFFFF | 4.5:1 | ⚠️ Test |
| Primary button text | #FFFFFF | Primary color | 4.5:1 | ⚠️ Test |
| Error text | Destructive color | #FFFFFF | 4.5:1 | ⚠️ Test |
| Links | Link color | #FFFFFF | 4.5:1 | ⚠️ Test |
| Border | #EDEDED | #FFFFFF | 3:1 | ⚠️ Test |

#### **Testing Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Inspect element > Accessibility panel
- axe DevTools browser extension

---

### 4.2 Focus Indicators

#### **Global Focus Styles (globals.css)**

```css
/* Remove default outline */
*:focus {
  outline: none;
}

/* Custom focus-visible styles */
*:focus-visible {
  outline: 2px solid #1F1F1F;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Button focus */
button:focus-visible,
a:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Input focus */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid #1F1F1F;
  outline-offset: 0;
  border-color: #1F1F1F;
}

/* Skip link focus */
.skip-link:focus {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 9999;
  padding: 0.5rem 1rem;
  background: #1F1F1F;
  color: #FFFFFF;
  text-decoration: none;
  border-radius: 4px;
}
```

---

### 4.3 Keyboard Navigation

#### **Required Keyboard Support:**

| Element | Key | Action |
|---------|-----|--------|
| Links/Buttons | Enter/Space | Activate |
| Forms | Tab | Move to next field |
| Forms | Shift+Tab | Move to previous field |
| Dialogs | ESC | Close dialog |
| Dropdowns | Arrow Up/Down | Navigate options |
| Dropdowns | Enter | Select option |
| Tables | Tab | Navigate cells |
| Custom controls | Arrow keys | Navigate/activate |

#### **Tab Order Requirements:**
- Logical and predictable
- Follows visual layout
- No keyboard traps
- Skip links available

---

### 4.4 ARIA Landmarks

#### **Required Landmarks:**

```tsx
// App Layout Structure
<div>
  {/* Skip Navigation */}
  <a href="#main-content" className="skip-link">
    Skip to main content
  </a>
  
  {/* Header */}
  <header role="banner">
    <nav aria-label="Main navigation">
      {/* Navigation content */}
    </nav>
  </header>
  
  {/* Main Content */}
  <main id="main-content" tabIndex={-1}>
    {/* Page content */}
  </main>
  
  {/* Footer (if exists) */}
  <footer role="contentinfo">
    {/* Footer content */}
  </footer>
</div>
```

---

### 4.5 Screen Reader Support

#### **Required Announcements:**

1. **Page title changes** - Automatic via Next.js metadata
2. **Form errors** - Use `role="alert"` or `aria-live="polite"`
3. **Loading states** - Use `aria-busy="true"` and `aria-live` regions
4. **Dynamic content** - Use `aria-live` regions
5. **Hidden content** - Use `aria-hidden="true"` for decorative elements

#### **Live Regions:**

```tsx
// Polite announcements (don't interrupt)
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Assertive announcements (interrupt immediately)
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>

// Status updates
<div role="status" aria-live="polite">
  {loadingMessage}
</div>
```

---

### 4.6 Responsive Text Sizing

#### **Requirements:**
- Text must be resizable up to 200% without loss of functionality
- No horizontal scrolling at 200% zoom
- Content reflows appropriately
- Use relative units (rem, em) not pixels

#### **Implementation:**

```css
/* Base font size */
html {
  font-size: 16px; /* 1rem = 16px */
}

/* Use rem for all text */
.text-body {
  font-size: 1rem; /* 16px */
}

.text-caption {
  font-size: 0.875rem; /* 14px */
}

.text-display-xl {
  font-size: 2.5rem; /* 40px */
}

/* Ensure minimum touch target size */
button,
a,
input,
[role="button"] {
  min-height: 44px;
  min-width: 44px;
}
```

---

## 5. Testing Procedures

### 5.1 Automated Testing Tools

#### **Recommended Tools:**

1. **axe DevTools** (Browser Extension)
   - Install: Chrome/Firefox Web Store
   - Run on each page
   - Fix all violations

2. **Lighthouse** (Chrome DevTools)
   - Run accessibility audit
   - Target score: 100
   - Fix all issues

3. **WAVE** (Browser Extension)
   - Visual accessibility checker
   - Identifies errors, alerts, features

4. **Pa11y** (CLI Tool)
   ```bash
   npm install -g pa11y
   pa11y http://localhost:3000
   ```

5. **axe-core** (Jest Integration)
   ```bash
   npm install --save-dev jest-axe
   ```

#### **Automated Test Script:**

```bash
# Run all accessibility tests
npm run test:a11y

# Test specific page
pa11y http://localhost:3000/login --standard WCAG2AA
```

---

### 5.2 Manual Testing Procedures

#### **Keyboard Navigation Test:**

1. **Tab through entire page**
   - All interactive elements reachable
   - Focus order logical
   - Focus visible at all times
   - No keyboard traps

2. **Activate all controls**
   - Enter/Space on buttons and links
   - Arrow keys in dropdowns
   - ESC closes dialogs

3. **Form submission**
   - Complete form using only keyboard
   - Error messages accessible
   - Submit works with Enter

#### **Screen Reader Test:**

**Test with:**
- NVDA (Windows - Free)
- JAWS (Windows - Paid)
- VoiceOver (macOS - Built-in)

**Testing Checklist:**
1. Navigate page using screen reader shortcuts
2. Verify all content is announced
3. Check form labels and instructions
4. Verify error messages are announced
5. Test dialog behavior
6. Check table navigation
7. Verify landmark regions

#### **Zoom Test:**

1. Set browser zoom to 200%
2. Navigate through entire page
3. Verify:
   - No horizontal scrolling
   - All text readable
   - No content cut off
   - Functionality preserved

#### **Color Blindness Test:**

**Use browser extensions:**
- Colorblind Web Page Filter
- Chromelens

**Test scenarios:**
- Deuteranopia (red-green)
- Protanopia (red-green)
- Tritanopia (blue-yellow)
- Achromatopsia (no color)

---

### 5.3 Testing Checklist by Page

```markdown
## Login Page Testing Checklist
- [ ] Automated: axe DevTools - 0 violations
- [ ] Automated: Lighthouse - Score 100
- [ ] Keyboard: Can complete login with keyboard only
- [ ] Keyboard: Focus visible on all elements
- [ ] Screen Reader: All form labels announced
- [ ] Screen Reader: Error messages announced
- [ ] Zoom: Page usable at 200% zoom
- [ ] Contrast: All text meets 4.5:1 ratio
- [ ] Color Blind: Form usable without color perception

## Users Page Testing Checklist
- [ ] Automated: axe DevTools - 0 violations
- [ ] Automated: Lighthouse - Score 100
- [ ] Keyboard: Table navigable with keyboard
- [ ] Keyboard: Add/Edit/Delete accessible
- [ ] Screen Reader: Table structure announced
- [ ] Screen Reader: Row actions clear
- [ ] Zoom: Table usable at 200% zoom
- [ ] Contrast: All elements meet contrast requirements

## Dialog Testing Checklist
- [ ] Keyboard: Opens with keyboard
- [ ] Keyboard: ESC closes dialog
- [ ] Keyboard: Focus trapped in dialog
- [ ] Keyboard: Focus returns to trigger
- [ ] Screen Reader: Title announced
- [ ] Screen Reader: Required fields clear
- [ ] Screen Reader: Error messages announced
```

---

## 6. Remediation Checklist

### 6.1 High Priority Fixes (Must Fix)

- [ ] **Add focus-visible styles globally** - All interactive elements need visible focus
- [ ] **Fix icon-only buttons** - Add aria-label to all icon-only buttons
- [ ] **Add page titles** - Every page needs descriptive `<title>`
- [ ] **Add ARIA labels to forms** - All inputs need associated labels
- [ ] **Fix dialog accessibility** - Ensure proper ARIA and focus management
- [ ] **Add skip navigation** - Skip to main content link needed
- [ ] **Test color contrast** - Verify all text meets 4.5:1 ratio
- [ ] **Add live regions** - Dynamic content needs announcements

### 6.2 Medium Priority Fixes (Should Fix)

- [ ] **Add table captions** - Tables need accessible names
- [ ] **Improve error announcements** - Use role="alert" consistently
- [ ] **Add password visibility toggle labels** - Icon buttons need labels
- [ ] **Add OTP input labels** - Each digit input needs label
- [ ] **Add landmark regions** - Proper header, main, nav structure
- [ ] **Fix dropdown keyboard support** - Full keyboard navigation
- [ ] **Add loading states** - Use aria-busy for async operations

### 6.3 Low Priority Enhancements (Nice to Have)

- [ ] **Add aria-current for navigation** - Indicate active page
- [ ] **Add breadcrumbs** - If needed for navigation
- [ ] **Add tooltips for icon buttons** - Additional context
- [ ] **Improve empty states** - More descriptive messages
- [ ] **Add search functionality** - With proper ARIA
- [ ] **Add keyboard shortcuts** - Document and implement

---

## 7. Compliance Tracking

### 7.1 WCAG 2.1 AA Compliance Matrix

| Success Criterion | Level | Status | Notes |
|-------------------|-------|--------|-------|
| **1.1.1 Non-text Content** | A | ⚠️ In Progress | Images need alt text review |
| **1.3.1 Info and Relationships** | A | ⚠️ In Progress | Semantic HTML needs verification |
| **1.3.2 Meaningful Sequence** | A | ✅ Pass | Logical reading order |
| **1.3.3 Sensory Characteristics** | A | ✅ Pass | No shape/color-only instructions |
| **1.4.1 Use of Color** | A | ⚠️ Review | Status badges need review |
| **1.4.3 Contrast (Minimum)** | AA | ⚠️ Needs Testing | All colors need verification |
| **1.4.5 Images of Text** | AA | ✅ Pass | No images of text used |
| **1.4.10 Reflow** | AA | ⚠️ Needs Testing | Test at 320px width |
| **1.4.11 Non-text Contrast** | AA | ⚠️ Needs Testing | UI components need testing |
| **1.4.12 Text Spacing** | AA | ⚠️ Needs Testing | Test with increased spacing |
| **2.1.1 Keyboard** | A | ⚠️ In Progress | Full keyboard support needed |
| **2.1.2 No Keyboard Trap** | A | ⚠️ Needs Testing | Test all components |
| **2.4.1 Bypass Blocks** | A | ❌ Fail | Skip link needed |
| **2.4.2 Page Titled** | A | ⚠️ In Progress | All pages need titles |
| **2.4.3 Focus Order** | A | ⚠️ Needs Testing | Tab order needs verification |
| **2.4.6 Headings and Labels** | AA | ⚠️ Review | Heading hierarchy needs check |
| **2.4.7 Focus Visible** | AA | ❌ Fail | Custom focus styles needed |
| **3.1.1 Language of Page** | A | ✅ Pass | HTML lang attribute set |
| **3.2.3 Consistent Navigation** | AA | ✅ Pass | Navigation is consistent |
| **3.2.4 Consistent Identification** | AA | ✅ Pass | Components used consistently |
| **3.3.1 Error Identification** | A | ✅ Pass | Errors clearly identified |
| **3.3.2 Labels or Instructions** | A | ✅ Pass | Form labels present |
| **3.3.3 Error Suggestion** | AA | ✅ Pass | Helpful error messages |
| **3.3.4 Error Prevention** | AA | ⚠️ Review | Confirmation dialogs needed |
| **4.1.1 Parsing** | A | ⚠️ Needs Testing | Validate HTML |
| **4.1.2 Name, Role, Value** | A | ⚠️ In Progress | ARIA attributes needed |
| **4.1.3 Status Messages** | AA | ❌ Fail | Live regions needed |

### 7.2 Compliance Progress

**Overall Progress: 45% Complete**

| Category | Status |
|----------|--------|
| Perceivable | 60% ⚠️ |
| Operable | 40% ❌ |
| Understandable | 80% ✅ |
| Robust | 30% ❌ |

### 7.3 Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| High Priority Fixes Complete | March 1, 2026 | 🔄 In Progress |
| Medium Priority Fixes Complete | March 15, 2026 | ⏳ Not Started |
| All Automated Tests Pass | March 22, 2026 | ⏳ Not Started |
| Manual Testing Complete | March 29, 2026 | ⏳ Not Started |
| **Full WCAG AA Compliance** | **March 31, 2026** | ⏳ Not Started |

---

## 8. Resources and References

### 8.1 Official Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

### 8.2 Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### 8.3 Learning Resources
- [A11ycasts by Google](https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g)
- [WebAIM Articles](https://webaim.org/articles/)
- [The A11Y Project](https://www.a11yproject.com/)

---

## Summary

This accessibility audit identifies critical areas for improvement to achieve WCAG 2.1 Level AA compliance across all screens in the Lofberg application. 

**Key Actions:**
1. ✅ Add global focus-visible styles
2. ✅ Add aria-labels to all icon-only buttons
3. ✅ Implement skip navigation
4. ✅ Add page titles to all pages
5. ✅ Test and fix color contrast issues
6. ✅ Add live regions for dynamic content
7. ✅ Implement proper dialog accessibility
8. ✅ Add table captions and proper structure
9. ✅ Test all functionality with keyboard only
10. ✅ Test with screen readers

**Target:** 100% WCAG AA compliance by March 31, 2026

Regular testing and updates to this document will ensure ongoing compliance as the application evolves.
