"use client"

import { Badge } from "@/components/ui/badge"
import { Pencil, Archive, RotateCcw } from "lucide-react"
import Image from "next/image"
import { formatPhoneDisplay } from "@/lib/phone"

export interface UserMobileCardData {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: "Active" | "Archived"
  reports: number
  lastLogin: string | null
  createdAt: string | null
  createdByName: string | null
  avatar: string
  isActive: boolean
}

interface UserMobileCardProps {
  user: UserMobileCardData
  onEdit: () => void
  onDelete: () => void
  onCardClick?: () => void
}

const formatDateOnly = (value: string | null) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function UserMobileCard({ user, onEdit, onDelete, onCardClick }: UserMobileCardProps) {
  return (
    <div className="user-mobile-card">
      <div
        className="cursor-pointer"
        onClick={onCardClick}
      >
        <div className="user-mobile-header">
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src={user.avatar}
              alt={user.name}
              width={32}
              height={32}
              className="rounded-full object-cover shrink-0"
            />
            <span className="user-mobile-name truncate" title={user.name}>{user.name}</span>
          </div>

          <Badge
            className={
              user.status === "Active"
                ? "bg-[#7DB356] text-white rounded-full px-4 py-1 text-xs shrink-0"
                : "bg-[#E5E5E5] text-[#6B6B6B] rounded-full px-4 py-1 text-xs shrink-0"
            }
          >
            {user.status}
          </Badge>
        </div>

        <div className="user-mobile-divider" />

        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="user-mobile-label">Email</span>
            <span className="user-mobile-value text-right truncate ml-2">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="user-mobile-label">Phone</span>
            <span className="user-mobile-value">{user.phone ? formatPhoneDisplay(user.phone) : "\u2014"}</span>
          </div>
          <div className="flex justify-between">
            <span className="user-mobile-label">Role</span>
            <span className="user-mobile-value">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="user-mobile-label">Reports</span>
            <span className="user-mobile-value">
              {user.role === "Salesperson" ? (
                <a
                  href={`/historical-reports?salesRepresentativeId=${user.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5B2D91] underline"
                >
                  {user.reports}
                </a>
              ) : (
                <span className="text-[#747474]">&mdash;</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="user-mobile-label">Created at</span>
            <span className="user-mobile-value">{formatDateOnly(user.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="user-mobile-label">Created by</span>
            <span className="user-mobile-value">{user.createdByName || "\u2014"}</span>
          </div>
          <div className="flex justify-between">
            <span className="user-mobile-label">Last login</span>
            <span className="user-mobile-value">{formatDateOnly(user.lastLogin)}</span>
          </div>
        </div>
      </div>

      <div className="user-mobile-divider" />

      <div className="user-mobile-actions">
        <button onClick={onEdit} className="mobile-edit">
          Edit <Pencil className="h-3 w-3 inline ml-1" />
        </button>

        {user.isActive ? (
          <button onClick={onDelete} className="mobile-delete">
            Archive <Archive className="h-3 w-3 inline ml-1" />
          </button>
        ) : (
          <button onClick={onDelete} className="mobile-edit">
            Restore <RotateCcw className="h-3 w-3 inline ml-1" />
          </button>
        )}
      </div>
    </div>
  )
}
