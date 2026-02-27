"use client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, User } from "lucide-react"

interface UserProfileDropdownProps {
  currentRole?: string
  onRoleChange?: (role: string) => void
  onLogout?: () => void
}

export function UserProfileDropdown({
  currentRole = "Administrator",
  onRoleChange,
  onLogout,
}: UserProfileDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="
            flex items-center gap-2
            h-[48px]
            px-[20px]
            rounded-[99px]
            bg-white
            text-[#1F1F1F]
            shadow-[0px_2px_4px_0px_#0000000A]
            border border-[#F0F0F0]
            hover:bg-gray-50
            transition
          "
        >
          <User size={18} />
          <span className="text-sm font-medium">Admin User</span>
          <ChevronDown size={16} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          w-[190px]
          rounded-[20px]
          p-4
          bg-white
          shadow-lg
        "
      >
        {/* My Profile */}
        <DropdownMenuItem className="text-sm cursor-pointer">
          My Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="text-sm text-muted-foreground px-2 py-1">
          Switch role
        </div>

        {/* Administrator */}
        <DropdownMenuItem
          onClick={() => onRoleChange?.("Administrator")}
          className={`text-sm cursor-pointer ${
            currentRole === "Administrator"
              ? "bg-purple-100 text-purple-700 rounded-lg"
              : ""
          }`}
        >
          Administrator
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onRoleChange?.("Sales Representative")}
          className="text-sm cursor-pointer"
        >
          Sales Representative
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onRoleChange?.("Translator")}
          className="text-sm cursor-pointer"
        >
          Translator
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={onLogout}
          className="text-sm cursor-pointer"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}