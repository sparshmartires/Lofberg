"use client"

import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import SegmentBasedConversions from "@/features/conversion-logic/components/SegmentBasedConversions"
import CO2Conversions from "@/features/conversion-logic/components/CO2Conversions"
import { useAuth } from "@/store/hooks/useAuth"

export function ConversionLogicPage() {
  const { user } = useAuth()
  const isAdmin = (user?.roles ?? []).includes("Administrator")

  return (
    <div className="min-h-screen bg-background py-10">
      <PageHeaderWithAction
        title="Conversions and units"
        description="Manage segment-based area and CO2 quantity conversions"
      />

      <div className="mt-8">
        <SegmentBasedConversions isAdmin={isAdmin} />
      </div>

      <div className="mt-8">
        <CO2Conversions isAdmin={isAdmin} />
      </div>
    </div>
  )
}
