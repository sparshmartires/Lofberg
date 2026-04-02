"use client"

import { AddUserDialog } from "@/features/users/components/AddUserDialog"
import { useMemo, useState } from "react"
import { AppPagination } from "@/components/ui/app-pagination"
import { UsersTable } from "../components/UsersTable"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { SearchInput } from "@/components/ui/search-input"
import { useDebounce } from "@/hooks/useDebounce"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
import { useGetUsersQuery, useGetRolesQuery } from "@/store/services/usersApi"
import { UsersEmptyState } from "../components/UsersEmptyState"
import { Loader2 } from "lucide-react"

export function UsersPage() {
  const [open, setOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const search = useDebounce(searchInput, 300)
  const [status, setStatus] = useState("all")
  const [roleId, setRoleId] = useState("all")
  const [createdAfter, setCreatedAfter] = useState("")
  const [createdBefore, setCreatedBefore] = useState("")
  const [lastLoginAfter, setLastLoginAfter] = useState("")
  const [lastLoginBefore, setLastLoginBefore] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState("")
  const [sortDirection, setSortDirection] = useState("asc")

  const isActiveFilter = useMemo(() => {
    if (status === "active") return true
    if (status === "inactive") return false
    return undefined
  }, [status])

  const { data: roles = [] } = useGetRolesQuery()

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
    ...(roleId !== "all" ? { roleId } : {}),
    ...(createdAfter ? { createdAfter } : {}),
    ...(createdBefore ? { createdBefore } : {}),
    ...(lastLoginAfter ? { lastLoginAfter } : {}),
    ...(lastLoginBefore ? { lastLoginBefore } : {}),
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

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value)
    setPageNumber(1)
  }

  const fieldClass = "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-[#1F1F1F] focus:ring-0 focus:outline-none"

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
          actionLabel="Add user"
          onActionClick={() => setOpen(true)}
        />


        {/* Filters */}
        <div className="filters-card">
          {/* Row 1: Search + Status + Role */}
          <div className="flex flex-wrap gap-4 items-end max-[649px]:flex-col">
            <div className="filter-field flex-[2] min-w-[280px] max-[649px]:min-w-0 max-[649px]:w-full">
              <label>Search</label>
              <SearchInput
                placeholder="Search by name or email"
                value={searchInput}
                onChange={setSearchInput}
                className={fieldClass}
              />
            </div>
            <div className="filter-field flex-1 min-w-[150px] max-[649px]:w-full">
              <label>Status</label>
              <Select value={status} onValueChange={handleFilterChange(setStatus)}>
                <SelectTrigger className={fieldClass} showClear={status !== "all"} onClear={() => handleFilterChange(setStatus)("all")}>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="filter-field flex-1 min-w-[150px] max-[649px]:w-full">
              <label>Role</label>
              <Select value={roleId} onValueChange={handleFilterChange(setRoleId)}>
                <SelectTrigger className={fieldClass} showClear={roleId !== "all"} onClear={() => handleFilterChange(setRoleId)("all")}>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Row 2: Created at range + Last logged in range */}
          <div className="flex flex-wrap gap-4 items-end mt-4 max-[649px]:flex-col">
            <div className="filter-field flex-1 min-w-[150px] max-[649px]:w-full">
              <label>Created from</label>
              <input type="date" value={createdAfter} onChange={(e) => { setCreatedAfter(e.target.value); setPageNumber(1) }} className={fieldClass} />
            </div>
            <div className="filter-field flex-1 min-w-[150px] max-[649px]:w-full">
              <label>Created to</label>
              <input type="date" value={createdBefore} onChange={(e) => { setCreatedBefore(e.target.value); setPageNumber(1) }} className={fieldClass} />
            </div>
            <div className="filter-field flex-1 min-w-[150px] max-[649px]:w-full">
              <label>Last login from</label>
              <input type="date" value={lastLoginAfter} onChange={(e) => { setLastLoginAfter(e.target.value); setPageNumber(1) }} className={fieldClass} />
            </div>
            <div className="filter-field flex-1 min-w-[150px] max-[649px]:w-full">
              <label>Last login to</label>
              <input type="date" value={lastLoginBefore} onChange={(e) => { setLastLoginBefore(e.target.value); setPageNumber(1) }} className={fieldClass} />
            </div>
          </div>
        </div>

        {/* Card Container */}
        <div className="rounded-[24px] bg-white shadow-sm py-[32px] px-[24px] max-[649px]:p-[12px]">

          <div className="mb-[28px] max-[649px]:mb-[16px]">
            <PageSectionTitle title="Users" />
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
