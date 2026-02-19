# Testing Plan for Lofberg Application

## Overview
This document outlines a comprehensive testing strategy for the Lofberg user management application built with Next.js 16, React 19, Redux Toolkit, and React Hook Form.

---

## 1. Unit Testing

### 1.1 Testing Framework Setup
**Recommended Stack:**
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **MSW (Mock Service Worker)** - API mocking

**Installation:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom msw
```

### 1.2 Components to Unit Test

#### **Authentication Components**
- **LoginForm** (`src/features/auth/components/LoginForm.tsx`)
  - ✅ Renders email and password inputs correctly
  - ✅ Displays validation errors for invalid email format
  - ✅ Displays validation error when password is less than 6 characters
  - ✅ Submits form with valid credentials
  - ✅ Sets auth cookie on successful login
  - ✅ Navigates to /users after successful login
  - ✅ "Forgot password" link navigates correctly
  - ✅ Button is disabled during submission

- **Login Page** (`src/app/(public)/login/page.tsx`)
  - ✅ Renders login form correctly
  - ✅ Handles form submission
  - ✅ Cookie is set with proper path
  - ✅ Router navigation works correctly

#### **User Management Components**
- **UsersTable** (`src/features/users/components/UsersTable.tsx`)
  - ✅ Renders table with correct headers
  - ✅ Displays user data correctly
  - ✅ Shows status badges with correct styling (Active/Inactive)
  - ✅ Edit button triggers edit dialog
  - ✅ Delete button shows confirmation dialog
  - ✅ Handles empty state
  - ✅ Renders avatar images

- **AddUserDialog** (`src/features/users/components/AddUserDialog.tsx`)
  - ✅ Opens and closes correctly
  - ✅ Form validation for required fields
  - ✅ Email validation (format check)
  - ✅ Phone number validation
  - ✅ Password strength validation
  - ✅ Submits form with correct data structure
  - ✅ Clears form after successful submission
  - ✅ Select dropdowns work correctly (role, language)

- **EditUserDialog** (`src/features/users/components/EditUserDialog.tsx`)
  - ✅ Pre-populates form with existing user data
  - ✅ Updates user data on submit
  - ✅ Validates changes before submission
  - ✅ Closes dialog on successful update

- **UsersPagination** (`src/features/users/components/UsersPagination.tsx`)
  - ✅ Displays correct page numbers
  - ✅ Next/Previous buttons work correctly
  - ✅ Disables buttons appropriately (first/last page)
  - ✅ Updates page state correctly

- **UsersEmptyState** (`src/features/users/components/UsersEmptyState.tsx`)
  - ✅ Renders when users array is empty
  - ✅ Displays correct messaging
  - ✅ Call-to-action button works

#### **UI Components**
- **Button** (`src/components/ui/button.tsx`)
  - ✅ Renders with correct variants (primary, secondary, etc.)
  - ✅ Handles click events
  - ✅ Disabled state works correctly
  - ✅ Loading state (if implemented)

- **Input** (`src/components/ui/input.tsx`)
  - ✅ Accepts user input
  - ✅ Shows error states
  - ✅ Placeholder text displays correctly
  - ✅ Handles different input types (email, password, text)

- **Dialog** (`src/components/ui/dialog.tsx`)
  - ✅ Opens and closes correctly
  - ✅ Backdrop click closes dialog (if enabled)
  - ✅ Escape key closes dialog
  - ✅ Focus trap works correctly

- **Table** (`src/components/ui/table.tsx`)
  - ✅ Renders headers and rows correctly
  - ✅ Handles empty state
  - ✅ Applies correct styling

- **Select** (`src/components/ui/select.tsx`)
  - ✅ Displays options correctly
  - ✅ Handles selection changes
  - ✅ Shows placeholder when no value selected

- **Badge** (`src/components/ui/badge.tsx`)
  - ✅ Renders with correct variants
  - ✅ Displays text correctly

#### **Redux Store & API**
- **exampleApi** (`src/store/services/exampleApi.ts`)
  - ✅ getPosts query returns data correctly
  - ✅ Handles loading state
  - ✅ Handles error state
  - ✅ Cache invalidation works

- **Store Configuration** (`src/store/index.ts`)
  - ✅ Store initializes correctly
  - ✅ Middleware is applied
  - ✅ Reducers are registered

#### **Utilities**
- **utils.ts** (`src/lib/utils.ts`)
  - ✅ `cn()` function merges classes correctly
  - ✅ Handles conditional classes
  - ✅ TailwindCSS class conflicts resolved

### 1.3 Unit Test Example

```typescript
// __tests__/features/auth/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/features/auth/components/LoginForm'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LoginForm', () => {
  it('should display validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByPlaceholderText(/email@lofberg.se/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)
    
    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument()
  })

  it('should navigate to /users on successful login', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    await user.type(screen.getByPlaceholderText(/email@lofberg.se/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/enter password/i), 'password123')
    
    await user.click(screen.getByRole('button', { name: /log in/i }))
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/users')
    })
  })
})
```

---

## 2. Integration Testing

### 2.1 User Authentication Flow
**Test Scenarios:**
- ✅ Complete login flow from login page to users dashboard
- ✅ Failed login with invalid credentials
- ✅ Forgot password flow (navigate to forgot-password page)
- ✅ Reset password flow with valid token
- ✅ Verify code functionality
- ✅ Logout functionality (clear cookies, redirect to login)
- ✅ Protected route access without authentication (redirect to login)
- ✅ Authenticated user accessing login page (redirect to dashboard)

### 2.2 User Management Flow
**Test Scenarios:**
- ✅ Add new user (open dialog → fill form → submit → see in table)
- ✅ Edit existing user (click edit → modify data → save → verify changes)
- ✅ Delete user (click delete → confirm → user removed from table)
- ✅ Pagination flow (navigate between pages, verify data)
- ✅ Filter/search users (if implemented)
- ✅ Sort table columns (if implemented)
- ✅ Status toggle (Active/Inactive)

### 2.3 Redux State Integration
**Test Scenarios:**
- ✅ API calls update Redux store correctly
- ✅ Components read from Redux store correctly
- ✅ Optimistic updates work (if implemented)
- ✅ Error handling updates store state
- ✅ Cache invalidation after mutations

### 2.4 Middleware Integration
**Test Scenarios:**
- ✅ Middleware redirects unauthenticated users to /login
- ✅ Middleware allows access to public routes without auth
- ✅ Middleware redirects authenticated users away from /login
- ✅ Middleware doesn't block static assets (_next, favicon.ico)

### 2.5 Integration Test Example

```typescript
// __tests__/integration/user-management.test.tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { UsersPage } from '@/features/users/pages/UsersPage'

describe('User Management Integration', () => {
  it('should add a new user and display in table', async () => {
    const user = userEvent.setup()
    
    render(
      <Provider store={store}>
        <UsersPage />
      </Provider>
    )
    
    // Click Add User button
    await user.click(screen.getByRole('button', { name: /add user/i }))
    
    // Fill form
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByPlaceholderText(/enter first name/i), 'John')
    await user.type(within(dialog).getByPlaceholderText(/enter last name/i), 'Doe')
    await user.type(within(dialog).getByPlaceholderText(/email/i), 'john.doe@example.com')
    
    // Submit
    await user.click(within(dialog).getByRole('button', { name: /create user/i }))
    
    // Verify user appears in table
    expect(await screen.findByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
  })
})
```

---

## 3. Regression Testing

### 3.1 Critical User Paths (Smoke Tests)
Run these tests before every release to ensure core functionality works:

1. **Authentication Regression**
   - ✅ User can log in with valid credentials
   - ✅ User cannot log in with invalid credentials
   - ✅ Forgot password link works
   - ✅ Protected routes require authentication

2. **User Management Regression**
   - ✅ Users table loads and displays data
   - ✅ Add user dialog opens and closes
   - ✅ Edit user functionality works
   - ✅ Pagination works correctly
   - ✅ User status badges display correctly

3. **UI Component Regression**
   - ✅ All buttons are clickable and styled correctly
   - ✅ Forms validate inputs correctly
   - ✅ Dialogs open/close without errors
   - ✅ Tables render without layout issues
   - ✅ Responsive design works on mobile/tablet/desktop

4. **Navigation Regression**
   - ✅ All internal links navigate correctly
   - ✅ Browser back/forward buttons work
   - ✅ 404 page displays for invalid routes
   - ✅ Middleware redirects work correctly

### 3.2 Visual Regression Testing
**Recommended Tool:** Percy, Chromatic, or BackstopJS

**Components to Test:**
- ✅ Login page (desktop & mobile)
- ✅ Users table (empty state, with data, pagination)
- ✅ Add/Edit user dialogs
- ✅ Status badges (Active/Inactive)
- ✅ Button variants (primary, secondary, destructive)
- ✅ Form validation error states
- ✅ Header navigation
- ✅ 404 page

### 3.3 Performance Regression
**Metrics to Monitor:**
- ✅ Page load time (< 2 seconds for initial load)
- ✅ Time to Interactive (TTI)
- ✅ First Contentful Paint (FCP)
- ✅ Largest Contentful Paint (LCP)
- ✅ Cumulative Layout Shift (CLS)
- ✅ Bundle size (prevent increases)

**Tools:**
- Lighthouse CI
- Next.js Analytics
- Web Vitals reporting

### 3.4 Accessibility Regression
**Test Scenarios:**
- ✅ Keyboard navigation works (Tab, Enter, Escape)
- ✅ Screen reader announcements are correct
- ✅ Form inputs have proper labels
- ✅ Buttons have accessible names
- ✅ Color contrast meets WCAG AA standards
- ✅ Focus indicators are visible
- ✅ ARIA attributes are correct

**Tools:**
- axe-core / @axe-core/react
- WAVE browser extension
- Lighthouse accessibility audit

### 3.5 Browser Compatibility Regression
**Browsers to Test:**
- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)
- ✅ Mobile Safari (iOS)
- ✅ Mobile Chrome (Android)

---

## 4. Additional Testing Strategies

### 4.1 End-to-End (E2E) Testing
**Recommended Tool:** Playwright or Cypress

**Critical E2E Flows:**
1. Complete user journey from login to user management
2. Multi-step form completion
3. Error handling and recovery
4. Session persistence across page reloads

### 4.2 API Testing
When real backend is implemented:
- ✅ Test all RTK Query endpoints
- ✅ Verify request/response schemas
- ✅ Test error handling (network errors, 4xx, 5xx)
- ✅ Test authentication headers
- ✅ Test rate limiting

### 4.3 Security Testing
- ✅ XSS prevention (input sanitization)
- ✅ CSRF protection
- ✅ Cookie security (httpOnly, secure, sameSite)
- ✅ Authentication token expiration
- ✅ Protected route access control

---

## 5. Test Coverage Goals

### 5.1 Coverage Targets
- **Unit Tests:** 80% code coverage
- **Integration Tests:** All critical user flows
- **E2E Tests:** Top 5 user journeys
- **Regression Tests:** All existing features before each release

### 5.2 Coverage by Module
| Module | Unit Tests | Integration Tests | E2E Tests |
|--------|------------|-------------------|-----------|
| Authentication | 90% | ✅ | ✅ |
| User Management | 85% | ✅ | ✅ |
| UI Components | 80% | N/A | N/A |
| Redux Store | 90% | ✅ | N/A |
| Middleware | 100% | ✅ | ✅ |

---

## 6. Testing Workflow

### 6.1 Development Phase
1. Write unit tests alongside feature development (TDD preferred)
2. Run unit tests on file save (watch mode)
3. Maintain test coverage above threshold

### 6.2 Pre-Commit
```bash
npm run test:unit
npm run lint
npm run type-check
```

### 6.3 CI/CD Pipeline
```yaml
# Example GitHub Actions workflow
- Run unit tests
- Run integration tests
- Check code coverage (fail if < 80%)
- Run E2E tests
- Run accessibility tests
- Build application
- Deploy to staging
```

### 6.4 Pre-Release
1. Run full regression test suite
2. Visual regression tests
3. Performance audits
4. Accessibility audits
5. Cross-browser testing
6. Security scan

---

## 7. Test Data Management

### 7.1 Mock Data
- Store mock data in `__mocks__` directory
- Use MSW for API mocking
- Create factories for generating test data

### 7.2 Test Database
- Use in-memory database for integration tests
- Reset database state between tests
- Seed with known test data

---

## 8. Recommended Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "playwright test",
    "test:a11y": "jest --testPathPattern=a11y",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

---

## 9. Next Steps

### Immediate Actions
1. ✅ Install testing dependencies
2. ✅ Set up Jest configuration
3. ✅ Create test folder structure
4. ✅ Write first unit test for LoginForm
5. ✅ Set up MSW for API mocking

### Short-term (1-2 weeks)
1. ✅ Achieve 50% unit test coverage
2. ✅ Write integration tests for auth flow
3. ✅ Set up CI/CD with basic tests

### Long-term (1-2 months)
1. ✅ Achieve 80% unit test coverage
2. ✅ Complete all integration tests
3. ✅ Set up E2E testing
4. ✅ Implement visual regression testing
5. ✅ Establish performance benchmarks

---

## 10. Testing Best Practices

1. **Follow AAA Pattern:** Arrange, Act, Assert
2. **Test Behavior, Not Implementation:** Focus on what users experience
3. **Keep Tests Independent:** No test should depend on another
4. **Use Descriptive Test Names:** Clearly state what is being tested
5. **Mock External Dependencies:** Don't make real API calls in unit tests
6. **Test Edge Cases:** Empty states, error states, boundary values
7. **Avoid Testing Third-Party Libraries:** Trust they work correctly
8. **Maintain Tests:** Update tests when features change
9. **Run Tests Frequently:** Don't let tests become stale
10. **Review Test Coverage Reports:** Identify untested code paths

---

## Summary

This testing plan provides a comprehensive strategy for ensuring the quality and reliability of the Lofberg application. By following this plan, you'll:

- ✅ Catch bugs early in development
- ✅ Prevent regressions when adding new features
- ✅ Improve code quality and maintainability
- ✅ Build confidence in deployments
- ✅ Ensure excellent user experience

**Remember:** Testing is an ongoing process, not a one-time task. Continuously update and improve your test suite as your application evolves.
