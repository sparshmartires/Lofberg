"use client"

import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import SegmentBasedConversions from "@/features/conversion-logic/components/SegmentBasedConversions"
import CO2Conversions from "@/features/conversion-logic/components/CO2Conversions"

export function ConversionLogicPage() {
  return (
    <div className="min-h-screen bg-background py-10">
      <PageHeaderWithAction
        title="Conversion Logic"
        description="Manage and configure conversion logic settings"
      />

      <div className="mt-8">
        <SegmentBasedConversions />
      </div>

      <div className="mt-8">
        <CO2Conversions />
      </div>
    </div>
  )
}
