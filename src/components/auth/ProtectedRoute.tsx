import { ReactNode } from "react"
import { useAuth } from "@/store/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: "user" | "admin"
}

/**
 * Wrapper component for protecting routes that require authentication
 * Usage: <ProtectedRoute><YourComponent /></ProtectedRoute>
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth state to load
    if (loading) return

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push("/login")
      return
    }

    // Add role-based access control here if needed
    // if (requiredRole && user?.role !== requiredRole) {
    //   router.push("/unauthorized")
    //   return
    // }
  }, [isAuthenticated, loading, router, user, requiredRole])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
