"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, Pencil, Trash2 } from "lucide-react"

export interface UsefulResourceItem {
  id: number
  title: string
  description: string
  dateCreated: string
  attachmentsCount: number
}

interface UsefulResourcesTableProps {
  resources: UsefulResourceItem[]
  onEditResource: (resource: UsefulResourceItem) => void
}

export function UsefulResourcesTable({ resources, onEditResource }: UsefulResourcesTableProps) {
  return (
    <div className="table-card border-[#EDEDED]">
      <div className="users-table-desktop overflow-x-auto">
        <Table className="table-fixed min-w-[980px]">
          <TableHeader>
            <TableRow className="table-header-row-bordered">
              <TableHead className="table-header-cell w-[220px]">Title</TableHead>
              <TableHead className="table-header-cell w-[330px]">Description</TableHead>
              <TableHead className="table-header-cell w-[170px]">Date created</TableHead>
              <TableHead className="table-header-cell w-[190px]">Number of attachments</TableHead>
              <TableHead className="table-header-cell w-[130px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id} className="table-body-row">
                <TableCell className="table-name-text pl-[12px]" data-label="Title" title={resource.title}>
                  <span className="block truncate">{resource.title}</span>
                </TableCell>
                <TableCell className="table-muted-text" data-label="Description" title={resource.description}>
                  <span className="block truncate">{resource.description}</span>
                </TableCell>
                <TableCell className="table-muted-text" data-label="Date created">
                  {resource.dateCreated}
                </TableCell>
                <TableCell className="table-muted-text" data-label="Number of attachments">
                  {resource.attachmentsCount}
                </TableCell>
                <TableCell data-label="Actions">
                  <div className="table-actions-wrap">
                    <button className="table-action-btn" aria-label={`Download ${resource.title}`}>
                      <Download className="table-action-icon" />
                    </button>
                    <button
                      className="table-action-btn"
                      aria-label={`Edit ${resource.title}`}
                      onClick={() => onEditResource(resource)}
                    >
                      <Pencil className="table-action-icon" />
                    </button>
                    <button className="table-action-btn" aria-label={`Delete ${resource.title}`}>
                      <Trash2 className="table-action-icon" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

     <div className="users-list-mobile">
  {resources.map((resource) => (
    <div key={resource.id} className="user-mobile-card">

      {/* TITLE + DATE */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="text-[14px] text-[#6B6B6B]">Title</div>
          <div className="text-[14px] text-[#1F1F1F]">{resource.title}</div>
        </div>

        <div className="text-right">
          <div className="text-[14px] text-[#6B6B6B]">Last report date</div>
          <div className="text-[14px] text-[#1F1F1F]">{resource.dateCreated}</div>
        </div>
      </div>

      <div className="user-mobile-divider" />

      {/* DESCRIPTION */}
      <div>
        <div className="text-[14px] text-[#6B6B6B] mb-1">Description</div>
        <div className="text-[14px] text-[#4E4E4E] leading-relaxed">
          {resource.description}
        </div>
      </div>

      <div className="user-mobile-divider" />

      {/* ACTIONS */}
      <div className="flex justify-between text-[#5B2D91] text-[14px]">
        <button className="flex items-center gap-1">
          Save <Download className="h-4 w-4" />
        </button>

        <button
          className="flex items-center gap-1"
          onClick={() => onEditResource(resource)}
        >
          Edit <Pencil className="h-4 w-4" />
        </button>

        <button className="flex items-center gap-1">
          Delete <Trash2 className="h-4 w-4" />
        </button>
      </div>

    </div>
  ))}
</div>
    </div>
  )
}