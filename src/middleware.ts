import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const { pathname } = request.nextUrl

  // Define public routes here
  const publicRoutes = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/verify-code",
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

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg).*)"],
}
