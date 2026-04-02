"use client"

import * as React from "react"
import { FileText } from "lucide-react"
import AppSidebar from "@/components/layout/AppSideBar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"
import { authApi, useLogoutMutation } from "@/store/services/authApi"
import { useAuth } from "@/store/hooks/useAuth"

import { UserProfileDropdown } from "./UserProfileDropdown"


export default function AppHeader() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const roles = user?.roles ?? []
  const isAdmin = roles.includes("Administrator")
  const isSales = roles.includes("Salesperson")

  const [triggerLogout] = useLogoutMutation()

  const handleLogout = React.useCallback(async () => {
    try {
      await triggerLogout().unwrap()
    } catch {
      // Even if the API call fails, clear local state
    }
    dispatch(logout())
    dispatch(authApi.util.resetApiState())
    router.replace("/login")
  }, [dispatch, router, triggerLogout])

  return (
    <header className="w-full bg-primary text-primary-foreground px-4 md:px-10 flex items-center justify-between py-4">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-6">
        <AppSidebar />

        <img
          src="/coffee.png"
          alt="Löfbergs Logo"
          width={125}
          height={40}
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">

        {/* Generate button — visible to Admin and Salesperson only, hidden on mobile */}
        {(isAdmin || isSales) && (
          <Button
            variant="accent"
            size="md"
            className="hidden md:flex gap-2 font-medium px-5 py-3"
            onClick={() => router.push("/report-generation")}
          >
            <FileText className="w-4 h-4" />
            Generate
          </Button>
        )}

        {/* User menu — visible on all screen sizes */}
        <UserProfileDropdown onLogout={handleLogout} />

      </div>
    </header>
  )
}
