"use client"

import { AddUserDialog } from "@/features/users/components/AddUserDialog"
import { useMemo, useState } from "react"
import { AppPagination } from "@/components/ui/app-pagination"
import { UsersTable } from "../components/UsersTable"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { UsersHeaderActions } from "../components/UsersHeaderActions"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
import { useGetUsersQuery } from "@/store/services/usersApi"
import { UsersEmptyState } from "../components/UsersEmptyState"
import { Loader2 } from "lucide-react"

export function UsersPage() {
  const [open, setOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState("")
  const [sortDirection, setSortDirection] = useState("asc")

  const isActiveFilter = useMemo(() => {
    if (status === "active") return true
    if (status === "inactive") return false
    return undefined
  }, [status])

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    error,
  } = useGetUsersQuery({
    pageNumber,
    pageSize,
    ...(search.trim() ? { searchTerm: search.trim() } : {}),
    ...(typeof isActiveFilter === "boolean" ? { isActive: isActiveFilter } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(sortBy ? { sortDirection } : {}),
  })

  const users = usersResponse?.items ?? []
  const totalCount = usersResponse?.totalCount ?? 0

  const handleUserCreated = () => {
    setOpen(false)

    setTimeout(() => {
      setSuccessOpen(true)
    }, 200)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPageNumber(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPageNumber(1)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
    setPageNumber(1)
  }

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPageNumber(1)
  }

  return (
    <>
      <div className="min-h-screen bg-background py-10">

        {/* Header */}
        <PageHeaderWithAction
          title="User management"
          description="Manage system administrators and users"
          actionLabel="Add user"
          onActionClick={() => setOpen(true)}
        />


        {/* Card Container */}
        <div className="rounded-[24px] bg-white shadow-sm py-[32px] px-[24px] max-[649px]:p-[12px]">

          <div className="flex items-center justify-between mb-[28px] max-[649px]:mb-[16px] gap-6">
            <PageSectionTitle title="System Users" />
            <div className="max-[649px]:hidden">
              <UsersHeaderActions
                search={search}
                status={status}
                isLoading={isFetching}
                onSearchChange={handleSearchChange}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>

          {error ? (
            <div className="text-sm text-destructive">Failed to load users.</div>
          ) : !isLoading && !isFetching && users.length === 0 ? (
            <UsersEmptyState />
          ) : (
            <div className="relative">
              {isFetching ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-[16px]">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : null}
              <div className={isLoading || isFetching ? "opacity-70" : ""}>
                <UsersTable users={users} sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
              </div>
            </div>
          )}

        </div>
        <AppPagination
          currentPage={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPageNumber}
          onPageSizeChange={handlePageSizeChange}
          disabled={isFetching}
        />
      </div>
      <AddUserDialog open={open} onOpenChange={setOpen}
        onUserCreated={handleUserCreated}
      />
      <UserFeedbackDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        type="success"
        title="User created successfully. "
        description=""
      />
    </>
  )
}
