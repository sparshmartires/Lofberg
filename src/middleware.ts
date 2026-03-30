import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/** Routes that require the Administrator role. */
const adminOnlyRoutes = ["/users", "/customers", "/template", "/conversion-logic"]

/**
 * Decode the JWT payload and extract the user's role claim.
 * Returns `null` when the token is missing, malformed, or the role cannot be
 * determined — callers should treat `null` as "unknown / let the backend decide".
 */
function extractRoleFromToken(token: string): string | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const json = atob(base64)
    const payload = JSON.parse(json)

    // The claim key varies between Identity Server and custom JWT setups
    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      payload.role ??
      null

    return typeof role === "string" ? role : null
  } catch {
    // Defence-in-depth: if parsing fails, allow through — backend still enforces.
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const { pathname } = request.nextUrl

  // Define public routes here
  const publicRoutes = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/verify-code",
    "/change-password",
  ]

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // If NOT logged in and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If logged in and trying to access login page
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Role-based route protection for authenticated users
  if (token) {
    const role = extractRoleFromToken(token)
    const isAdminRoute = adminOnlyRoutes.some((route) =>
      pathname.startsWith(route)
    )

    if (isAdminRoute && role !== null && role !== "Administrator") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg).*)"],
}
