"use client"

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

import { FileText } from "lucide-react"

export default function ReportTypeDistribution() {
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

      {/* FILTERS */}
      <div className="grid md:grid-cols-3 gap-4">

        <div>
          <p className="text-[12px] text-[#6B6B6B] mb-1">
            Date range
          </p>

          <Select defaultValue="all">
            <SelectTrigger className="rounded-full h-[40px]">
              <SelectValue placeholder="All time" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
            </SelectContent>
          </Select>

        </div>

        <div>
          <p className="text-[12px] text-[#6B6B6B] mb-1">
            Market
          </p>

          <Select defaultValue="all">
            <SelectTrigger className="rounded-full h-[40px]">
              <SelectValue placeholder="All markets" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All markets</SelectItem>
              <SelectItem value="sweden">Sweden</SelectItem>
              <SelectItem value="norway">Norway</SelectItem>
            </SelectContent>
          </Select>

        </div>

        <div>
          <p className="text-[12px] text-[#6B6B6B] mb-1">
            Segment
          </p>

          <Select defaultValue="all">
            <SelectTrigger className="rounded-full h-[40px]">
              <SelectValue placeholder="All segments" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All segments</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
            </SelectContent>
          </Select>

        </div>

      </div>

      {/* STAT CARDS */}
      <div className="grid md:grid-cols-3 gap-4">

        <StatCard
          title="Full report"
          subtitle="(Report + Receipt)"
          percent="45%"
          reports="70 reports"
        />

        <StatCard
          title="Receipt only"
          subtitle="(Standalone)"
          percent="35%"
          reports="55 reports"
        />

        <StatCard
          title="Compiled report"
          subtitle=""
          percent="20%"
          reports="31 reports"
        />

      </div>

      {/* INSIGHT */}
      <div className="flex items-start gap-3 bg-[#FAFAFA] rounded-lg p-3 border-l-[4px] border-[#7B3EBE] text-sm text-[#4E4E4E]">
        <span className="font-medium">Insight:</span>
        <span>
          Full reports: 45% | Receipt only: 35% | Compiled receipt: 20%
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