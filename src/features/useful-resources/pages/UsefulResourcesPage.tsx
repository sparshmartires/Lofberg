"use client"

import { useState, useEffect } from "react"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { AppPagination } from "@/components/ui/app-pagination"
import { SearchInput } from "@/components/ui/search-input"
import { useDebounce } from "@/hooks/useDebounce"
import { UsefulResourcesTable } from "../components/UsefulResourcesTable"
import AddNewResourceDialog from "../components/AddResourceDialog"
import EditResourceDialog from "../components/EditResourceDialog"
import {
  useGetResourcesQuery,
  useDeleteResourceMutation,
  type ResourceDto,
} from "@/store/services/resourcesApi"
import { useAuth } from "@/store/hooks/useAuth"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button as DialogButton } from "@/components/ui/button"

export function UsefulResourcesPage() {
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes("Administrator") ?? false

  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("")
  const [sortDirection, setSortDirection] = useState("")
  const debouncedSearch = useDebounce(searchInput)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<ResourceDto | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<ResourceDto | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const { data, isLoading } = useGetResourcesQuery({
    pageNumber,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    sortBy: sortBy || undefined,
    sortDirection: sortDirection || undefined,
  })
  const [deleteResource] = useDeleteResourceMutation()

  const resources = data?.items ?? []
  const totalCount = data?.totalCount ?? 0

  // Client-side type filter (BE doesn't support type filter)
  const filteredResources = typeFilter === "all"
    ? resources
    : resources.filter((r) =>
        typeFilter === "file" ? r.resourceType === 1 : r.resourceType === 2
      )

  useEffect(() => { setPageNumber(1) }, [debouncedSearch, typeFilter])

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPageNumber(1)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const handleEditResource = (resource: ResourceDto) => {
    setSelectedResource(resource)
    setEditDialogOpen(true)
  }

  const handleDeleteResource = (resource: ResourceDto) => {
    setResourceToDelete(resource)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!resourceToDelete) return
    try {
      await deleteResource(resourceToDelete.id).unwrap()
    } catch {
      // Error handled by RTK Query
    }
    setDeleteDialogOpen(false)
    setResourceToDelete(null)
  }

  const handleView = (resource: ResourceDto) => {
    const url = resource.resourceType === 2 ? resource.externalUrl : resource.fileUrl
    if (url) window.open(url, "_blank")
  }

  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm focus:outline-none"

  return (
    <>
      <div className="min-h-screen bg-background py-10">
        <PageHeaderWithAction
          title="Useful resources"
          actionLabel={isAdmin ? "Add resource" : undefined}
          onActionClick={isAdmin ? () => setAddDialogOpen(true) : undefined}
        />

        {/* Filters */}
        <div className="filters-card !flex !flex-col !w-full">
          {/* Desktop */}
          <div className="hidden md:flex flex-wrap gap-4 items-end">
            <div className="filter-field flex-1">
              <label>Search</label>
              <SearchInput
                placeholder="Search by title"
                value={searchInput}
                onChange={setSearchInput}
                className={fieldClass}
              />
            </div>
            <div className="filter-field flex-1">
              <label>Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className={fieldClass} showClear={typeFilter !== "all"} onClear={() => setTypeFilter("all")}>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile */}
          <div className="block md:hidden">
            <div className="filter-field w-full">
              <label>Search</label>
              <SearchInput
                placeholder="Search by title"
                value={searchInput}
                onChange={setSearchInput}
                className={fieldClass}
              />
            </div>
            <div className={`mobile-advanced ${isFiltersOpen ? "open" : ""}`}>
              <div className="flex flex-col gap-4 pt-4">
                <div className="filter-field w-full">
                  <label>Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className={fieldClass} showClear={typeFilter !== "all"} onClear={() => setTypeFilter("all")}>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mobile-toggle" onClick={() => setIsFiltersOpen((p) => !p)}>
              <span>Filters</span>
              {isFiltersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-white shadow-sm py-[32px] px-[24px] max-[649px]:p-[12px]">
          {isLoading ? (
            <div className="text-center py-8 text-sm text-[#8A8A8A]">Loading resources...</div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#8A8A8A]">No resources found</div>
          ) : (
            <UsefulResourcesTable
              resources={filteredResources}
              isAdmin={isAdmin}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
              onView={handleView}
              onEditResource={handleEditResource}
              onDeleteResource={handleDeleteResource}
            />
          )}
        </div>

        <AppPagination
          currentPage={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPageNumber}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <AddNewResourceDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditResourceDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setSelectedResource(null)
        }}
        resource={selectedResource}
      />

      {/* Delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[420px] rounded-[24px] p-8 bg-white border-none">
          <DialogTitle className="text-[18px] font-medium text-[#1F1F1F]">Delete resource</DialogTitle>
          <p className="text-[14px] text-[#747474] mt-2">
            Are you sure you want to delete &quot;{resourceToDelete?.title}&quot;? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4 mt-6">
            <DialogButton
              variant="outlineBrand"
              className="rounded-full px-6"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </DialogButton>
            <DialogButton
              className="rounded-full px-6 bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
            >
              Delete
            </DialogButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
