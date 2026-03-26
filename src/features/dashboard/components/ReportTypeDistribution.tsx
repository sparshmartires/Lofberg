"use client"

import { FileText } from "lucide-react"

interface ReportTypeDistributionProps {
  data: { fullReport: number; receiptOnly: number; compiledReceipt: number; total: number }
}

export default function ReportTypeDistribution({ data }: ReportTypeDistributionProps) {
  const fullReportPct = data.total > 0 ? Math.round((data.fullReport / data.total) * 100) : 0
  const receiptOnlyPct = data.total > 0 ? Math.round((data.receiptOnly / data.total) * 100) : 0
  const compiledReceiptPct = data.total > 0 ? Math.round((data.compiledReceipt / data.total) * 100) : 0

  return (
    <div className="w-full bg-white border border-[#EDEDED] rounded-[28px] p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h3 className="text-[18px] text-[#1F1F1F]">
          Report type distribution
        </h3>

        <p className="text-[14px] text-[#747474]">
          Illustrates the percentage breakdown of report types generated
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid md:grid-cols-3 gap-4">

        <StatCard
          title="Full report"
          subtitle="(Report + Receipt)"
          percent={`${fullReportPct}%`}
          reports={`${data.fullReport} reports`}
        />

        <StatCard
          title="Receipt only"
          subtitle="(Standalone)"
          percent={`${receiptOnlyPct}%`}
          reports={`${data.receiptOnly} reports`}
        />

        <StatCard
          title="Compiled report"
          subtitle=""
          percent={`${compiledReceiptPct}%`}
          reports={`${data.compiledReceipt} reports`}
        />

      </div>

      {/* INSIGHT */}
      <div className="flex items-start gap-3 bg-[#FAFAFA] rounded-lg p-3 border-l-[4px] border-[#7B3EBE] text-sm text-[#4E4E4E]">
        <span className="font-medium">Insight:</span>
        <span>
          Full reports: {fullReportPct}% | Receipt only: {receiptOnlyPct}% | Compiled receipt: {compiledReceiptPct}%
        </span>
      </div>

    </div>
  )
}

function StatCard({
  title,
  subtitle,
  percent,
  reports,
}: {
  title: string
  subtitle?: string
  percent: string
  reports: string
}) {
  return (
    <div className="border border-[#EDEDED] rounded-[20px] p-4 flex justify-between items-start">

      <div>

        <p className="text-[14px] text-[#1F1F1F]">
          {title}
        </p>

        {subtitle && (
          <p className="text-[12px] text-[#747474]">
            {subtitle}
          </p>
        )}

        <p className="text-[24px] text-[#5B2D91] font-semibold mt-3">
          {percent}
        </p>

        <p className="text-[12px] text-[#7B3EBE]">
          {reports}
        </p>

      </div>

      <div className="w-[36px] h-[36px] bg-[#F4ECFB] rounded-lg flex items-center justify-center">
        <FileText className="w-5 h-5 text-[#5B2D91]" />
      </div>

    </div>
  )
}