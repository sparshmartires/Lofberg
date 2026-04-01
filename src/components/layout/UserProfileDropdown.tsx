"use client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface UserProfileDropdownProps {
  onLogout?: () => void
}

export function UserProfileDropdown({ onLogout }: UserProfileDropdownProps) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-testid="user-menu"
          className={cn(
            "flex items-center gap-1.5",
            "h-[40px]",
            "px-[12px]",
            "rounded-full",
            "bg-white",
            "text-[#1F1F1F]",
            "shadow-[0px_2px_4px_0px_#0000000A]",
            "border border-[#F0F0F0]",
            "hover:bg-gray-50",
            "transition"
          )}
        >
          <User size={18} />
          <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-[160px]",
          "rounded-[16px]",
          "p-2",
          "bg-white",
          "shadow-lg",
          "z-50"
        )}
      >
        <DropdownMenuItem
          className="text-sm cursor-pointer rounded-lg"
          onClick={() => router.push("/profile")}
        >
          My profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          data-testid="logout-button"
          onClick={onLogout}
          className="text-sm cursor-pointer rounded-lg"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
