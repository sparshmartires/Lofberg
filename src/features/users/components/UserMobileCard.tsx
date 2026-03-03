"use client"

import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import Image from "next/image"

export interface UserMobileCardData {
  id: string
  name: string
  email: string
  role: string
  status: "Active" | "Inactive"
  reports: number
  lastLogin: string | null
  avatar: string
}

interface UserMobileCardProps {
  user: UserMobileCardData
  onEdit: () => void
  onDelete: () => void
}

export function UserMobileCard({ user, onEdit, onDelete }: UserMobileCardProps) {
  return (
    <div className="user-mobile-card">
      <div className="user-mobile-header">
        <div className="flex items-center gap-3">
          <Image
            src={user.avatar}
            alt={user.name}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="user-mobile-name">{user.name}</span>
        </div>

        <Badge
          className={
            user.status === "Active"
              ? "bg-[#7DB356] text-white rounded-full px-4 py-1 text-xs"
              : "bg-[#E5E5E5] text-[#6B6B6B] rounded-full px-4 py-1 text-xs"
          }
        >
          {user.status}
        </Badge>
      </div>

      <div className="user-mobile-divider" />

      <div className="user-mobile-split-row">
        <div>
          <div className="user-mobile-label">Email : {user.email}</div>
          <span className="user-mobile-label">Role : {user.role}</span>
        </div>

        <div className="text-right">
          <div className="user-mobile-label">Last login</div>
          <div className="user-mobile-value">{user.lastLogin}</div>
        </div>
      </div>

      <div className="user-mobile-stacked">
        <span className="user-mobile-label">Reports : {user.reports}</span>
        <span className="user-mobile-value"></span>
      </div>

      <div className="user-mobile-divider" />

      <div className="user-mobile-actions">
        <button onClick={onEdit} className="mobile-edit">
          Edit <Pencil className="h-3 w-3 inline ml-1" />
        </button>

        <button onClick={onDelete} className="mobile-delete">
          Delete <Trash2 className="h-3 w-3 inline ml-1" />
        </button>
      </div>
    </div>
  )
}