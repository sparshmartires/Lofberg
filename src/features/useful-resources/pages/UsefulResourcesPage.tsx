"use client"

import { useMemo, useState } from "react"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
import { AppPagination } from "@/components/ui/app-pagination"
import {
  UsefulResourceItem,
  UsefulResourcesTable,
} from "../components/UsefulResourcesTable"
import AddNewResourceDialog from "../components/AddResourceDialog"
import EditResourceDialog from "../components/EditResourceDialog"

const resourcesData: UsefulResourceItem[] = [
  {
    id: 1,
    title: "Sustainability handbook",
    description: "Guidelines for preparing customer sustainability reports.",
    dateCreated: "03/01/2026",
    attachmentsCount: 3,
  },
  {
    id: 2,
    title: "CO₂ conversion cheatsheet",
    description: "Quick reference for product-to-emission conversion values.",
    dateCreated: "02/27/2026",
    attachmentsCount: 2,
  },
  {
    id: 3,
    title: "Customer onboarding kit",
    description: "Template documents and welcome material for new customers.",
    dateCreated: "02/24/2026",
    attachmentsCount: 5,
  },
  {
    id: 4,
    title: "Sales script v2",
    description: "Updated script for sustainability-focused customer calls.",
    dateCreated: "02/20/2026",
    attachmentsCount: 1,
  },
  {
    id: 5,
    title: "Report submission checklist",
    description: "Checklist used before report finalization and delivery.",
    dateCreated: "02/18/2026",
    attachmentsCount: 4,
  },
  {
    id: 6,
    title: "FAQ: carbon accounting",
    description: "Common questions and answers for carbon impact metrics.",
    dateCreated: "02/14/2026",
    attachmentsCount: 2,
  },
  {
    id: 7,
    title: "Regional regulations summary",
    description: "Summary of regulations impacting sustainability reporting.",
    dateCreated: "02/11/2026",
    attachmentsCount: 6,
  },
  {
    id: 8,
    title: "Data collection template",
    description: "Spreadsheet template for monthly customer data intake.",
    dateCreated: "02/07/2026",
    attachmentsCount: 3,
  },
  {
    id: 9,
    title: "Reporting tone guide",
    description: "Tone and language recommendations for final reports.",
    dateCreated: "02/03/2026",
    attachmentsCount: 1,
  },
  {
    id: 10,
    title: "Receipt policy",
    description: "Rules and standards for digital sustainability receipts.",
    dateCreated: "01/30/2026",
    attachmentsCount: 2,
  },
  {
    id: 11,
    title: "Brand asset package",
    description: "Approved logos and visual assets for report templates.",
    dateCreated: "01/25/2026",
    attachmentsCount: 8,
  },
  {
    id: 12,
    title: "Training recording index",
    description: "Catalog of internal training sessions and reference links.",
    dateCreated: "01/20/2026",
    attachmentsCount: 7,
  },
]

export function UsefulResourcesPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(11)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<UsefulResourceItem | null>(null)

  const paginatedResources = useMemo(() => {
    const startIndex = (pageNumber - 1) * pageSize
    const endIndex = startIndex + pageSize
    return resourcesData.slice(startIndex, endIndex)
  }, [pageNumber, pageSize])

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPageNumber(1)
  }

  const handleEditResource = (resource: UsefulResourceItem) => {
    setSelectedResource(resource)
    setEditDialogOpen(true)
  }

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditDialogOpen(open)

    if (!open) {
      setSelectedResource(null)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-background py-10">
        <PageHeaderWithAction
          title="Useful Resources"
          description="Browse shared documents and materials"
          actionLabel="Add Resource"
          onActionClick={() => setAddDialogOpen(true)}
        />

        <div className="rounded-[24px] bg-white shadow-sm py-[32px] px-[24px] max-[649px]:p-[12px]">
          <div className="flex items-center justify-between mb-[28px] max-[649px]:mb-[16px] gap-6">
            <PageSectionTitle title="Resources Library" />
          </div>

          <UsefulResourcesTable
            resources={paginatedResources}
            onEditResource={handleEditResource}
          />
        </div>

        <AppPagination
          currentPage={pageNumber}
          pageSize={pageSize}
          totalCount={resourcesData.length}
          onPageChange={setPageNumber}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <AddNewResourceDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditResourceDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
        resource={selectedResource}
      />
    </>
  )
}