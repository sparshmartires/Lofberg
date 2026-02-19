"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { EditUserDialog } from "./EditUserDialog"

interface User {
  id: number
  name: string
  email: string
  role: string
  status: "Active" | "Inactive"
  reports: number
  lastLogin: string
  avatar: string
}

const users: User[] = [
  {
    id: 1,
    name: "Karin Bergström",
    email: "karin.bergstrom@acme.com",
    role: "Salesperson",
    status: "Active",
    reports: 92,
    lastLogin: "02/02/2026",
    avatar: "/avatars/1.jpg",
  },
  {
    id: 2,
    name: "Anna Svensson",
    email: "anna.svensson@lofbergs.se",
    role: "Salesperson",
    status: "Inactive",
    reports: 29,
    lastLogin: "01/27/2025",
    avatar: "/avatars/2.jpg",
  },
   {
    id: 3,
    name: "Karin Bergström",
    email: "karin.bergstrom@acme.com",
    role: "Salesperson",
    status: "Active",
    reports: 92,
    lastLogin: "02/02/2026",
    avatar: "/avatars/1.jpg",
  },
  {
    id: 4,
    name: "Anna Svensson",
    email: "anna.svensson@lofbergs.se",
    role: "Salesperson",
    status: "Inactive",
    reports: 29,
    lastLogin: "01/27/2025",
    avatar: "/avatars/2.jpg",
  },
   {
    id: 5,
    name: "Karin Bergström",
    email: "karin.bergstrom@acme.com",
    role: "Salesperson",
    status: "Active",
    reports: 92,
    lastLogin: "02/02/2026",
    avatar: "/avatars/1.jpg",
  },
  {
    id: 6,
    name: "Anna Svensson",
    email: "anna.svensson@lofbergs.se",
    role: "Salesperson",
    status: "Inactive",
    reports: 29,
    lastLogin: "01/27/2025",
    avatar: "/avatars/2.jpg",
  },
   {
    id: 7,
    name: "Karin Bergström",
    email: "karin.bergstrom@acme.com",
    role: "Salesperson",
    status: "Active",
    reports: 92,
    lastLogin: "02/02/2026",
    avatar: "/avatars/1.jpg",
  },
  {
    id: 8,
    name: "Anna Svensson",
    email: "anna.svensson@lofbergs.se",
    role: "Salesperson",
    status: "Inactive",
    reports: 29,
    lastLogin: "01/27/2025",
    avatar: "/avatars/2.jpg",
  },
]

export function UsersTable() {
    const [editOpen, setEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditOpen(true)
  }
  return (
    <>
    <div className="rounded-[24px]  border-[#EDEDED] bg-white overflow-hidden">

      <Table>

        {/* TABLE HEADER */}
        <TableHeader>
          <TableRow className="border-b border-[#E0E0E0] h-[64px]">
            <TableHead className="text-[#1F1F1F] text-[14px] font-normal">
              Name
            </TableHead>
            <TableHead className="text-[#1F1F1F] text-[14px] font-normal">
              Email
            </TableHead>
            <TableHead className="text-[#1F1F1F] text-[14px] font-normal">
              Role
            </TableHead>
            <TableHead className="text-[#1F1F1F] text-[14px] font-normal">
              Status
            </TableHead>
            <TableHead className="text-[#1F1F1F] text-[14px] font-normal">
              Reports
            </TableHead>
            <TableHead className="text-[#1F1F1F] text-[14px] font-normal">
              Last login
            </TableHead>
            <TableHead className="text-right text-[#1F1F1F] text-[14px] font-normal">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* TABLE BODY */}
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="h-[72px] border-b border-[#EDEDED] hover:bg-[#FAFAFA] transition-colors"
            >
              {/* NAME */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                  <span className="text-[14px] text-[#1F1F1F]">
                    {user.name}
                  </span>
                </div>
              </TableCell>

              {/* EMAIL */}
              <TableCell className="text-[14px] text-[#4E4E4E]">
                {user.email}
              </TableCell>

              {/* ROLE */}
              <TableCell>
                <Badge
                  className="
                    bg-[#EADCF6]
                    text-[#7B3EBE]
                    rounded-full
                    px-4
                    py-1
                    text-[12px]
                    font-normal
                  "
                >
                  {user.role}
                </Badge>
              </TableCell>

              {/* STATUS */}
              <TableCell>
                <Badge
                  className={`
                    rounded-full
                    px-4
                    py-1
                    text-[12px]
                    font-normal
                    ${
                      user.status === "Active"
                        ? "bg-[#7DB356] text-white"
                        : "bg-[#E5E5E5] text-[#6B6B6B]"
                    }
                  `}
                >
                  {user.status}
                </Badge>
              </TableCell>

              {/* REPORTS */}
              <TableCell className="text-[14px] text-[#1F1F1F]">
                {user.reports}
              </TableCell>

              {/* LAST LOGIN */}
              <TableCell className="text-[14px] text-[#4E4E4E]">
                {user.lastLogin}
              </TableCell>

              {/* ACTIONS */}
              <TableCell className="text-right">
                <div className="flex justify-end gap-4">
                  <Pencil className="h-4 w-4 text-[#7B3EBE] cursor-pointer" 
                   onClick={() => handleEdit(user)}/>
                  <Trash2 className="h-4 w-4 text-[#7B3EBE] cursor-pointer" />
                </div>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>

      </Table>

    </div>
    {selectedUser && (
        <EditUserDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          defaultValues={{
            //@ts-ignore
            firstName: selectedUser.firstName,
            //@ts-ignore
            lastName: selectedUser.lastName,
            email: selectedUser.email,
            role: selectedUser.role,
            //@ts-ignore
            phone: selectedUser.phone || "",
            //@ts-ignore
            language: selectedUser.language || "",
            password: "",
            //@ts-ignore
            notes: selectedUser.notes || "",
          }}
        />
      )}
      </>
  )
}
