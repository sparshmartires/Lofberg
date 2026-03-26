"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExternalLink, Eye, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import type { ResourceDto } from "@/store/services/resourcesApi"

interface UsefulResourcesTableProps {
  resources: ResourceDto[]
  isAdmin: boolean
  sortBy: string
  sortDirection: string
  onSort: (column: string) => void
  onView: (resource: ResourceDto) => void
  onEditResource: (resource: ResourceDto) => void
  onDeleteResource: (resource: ResourceDto) => void
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-"
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return "-"
  }
}

function getTypeLabel(resourceType: number): string {
  return resourceType === 2 ? "Link" : "File"
}

export function UsefulResourcesTable({
  resources,
  isAdmin,
  sortBy,
  sortDirection,
  onSort,
  onView,
  onEditResource,
  onDeleteResource,
}: UsefulResourcesTableProps) {

  const SortableHeader = ({ column, children, className }: { column: string; children: React.ReactNode; className?: string }) => (
    <TableHead
      className={`table-header-cell cursor-pointer select-none ${className ?? ""}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortBy === column ? "text-[#5B2D91]" : "text-[#B0B0B0]"}`} />
      </div>
    </TableHead>
  )

  return (
    <div className="table-card border-[#EDEDED]">
      {/* Desktop */}
      <div className="users-table-desktop">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="table-header-row-bordered">
              <SortableHeader column="title">Title</SortableHeader>
              <TableHead className="table-header-cell">Description</TableHead>
              <SortableHeader column="resourcetype">Type</SortableHeader>
              <SortableHeader column="updatedat">Updated at</SortableHeader>
              <SortableHeader column="createdat">Created at</SortableHeader>
              <TableHead className="table-header-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id} className="table-body-row">
                <TableCell className="table-name-text max-w-[200px]" title={resource.title}>
                  <span className="block truncate">{resource.title}</span>
                </TableCell>
                <TableCell className="table-muted-text max-w-[280px]" title={resource.description}>
                  <span className="block truncate">{resource.description || "-"}</span>
                </TableCell>
                <TableCell className="table-muted-text">
                  <span className="flex items-center gap-1">
                    {resource.resourceType === 2 && <ExternalLink className="h-3.5 w-3.5" />}
                    {getTypeLabel(resource.resourceType)}
                  </span>
                </TableCell>
                <TableCell className="table-muted-text">
                  {formatDate(resource.updatedAt)}
                </TableCell>
                <TableCell className="table-muted-text">
                  {formatDate(resource.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="table-actions-wrap">
                    <button
                      className="table-action-btn"
                      aria-label={`View ${resource.title}`}
                      title="View"
                      onClick={() => onView(resource)}
                    >
                      <Eye className="table-action-icon" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          className="table-action-btn"
                          aria-label={`Edit ${resource.title}`}
                          title="Edit"
                          onClick={() => onEditResource(resource)}
                        >
                          <Pencil className="table-action-icon" />
                        </button>
                        <button
                          className="table-action-btn"
                          aria-label={`Delete ${resource.title}`}
                          title="Archive"
                          onClick={() => onDeleteResource(resource)}
                        >
                          <Trash2 className="table-action-icon" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="users-list-mobile">
        {resources.map((resource) => (
          <div key={resource.id} className="user-mobile-card">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-[#1F1F1F] truncate">{resource.title}</div>
                <div className="text-[13px] text-[#747474]">{getTypeLabel(resource.resourceType)}</div>
              </div>
              <div className="text-right shrink-0 text-[13px] text-[#747474]">
                {formatDate(resource.createdAt)}
              </div>
            </div>

            {resource.description && (
              <>
                <div className="user-mobile-divider" />
                <div className="text-[13px] text-[#4E4E4E] line-clamp-2">
                  {resource.description}
                </div>
              </>
            )}

            <div className="border-t border-[#EDEDED] mt-3 pt-3 flex justify-end gap-4 text-[#5B2D91] text-[13px]">
              <button className="flex items-center gap-1" onClick={() => onView(resource)}>
                View <Eye className="h-4 w-4" />
              </button>
              {isAdmin && (
                <>
                  <button className="flex items-center gap-1" onClick={() => onEditResource(resource)}>
                    Edit <Pencil className="h-4 w-4" />
                  </button>
                  <button className="flex items-center gap-1" onClick={() => onDeleteResource(resource)}>
                    Archive <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
