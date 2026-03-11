"use client"

import type { ReactNode } from "react"
import { FileText, CalendarDays, PieChart, Users } from "lucide-react"

export default function DashboardHeader() {
  return (
    <div className="w-full rounded-[12px] flex items-center justify-between">
      <div>
        <h1 className="text-[40px] font-normal leading-[120%] tracking-[-0.04em] text-[#1F1F1F] pb-[4px]">
          Dashboard
        </h1>

        <p className="text-[14px] font-normal leading-[120%] tracking-[-0.04em] text-[#4E4E4E]">
          Overview of all sustainability reports and performance metrics
        </p>
      </div>

      <div className="flex items-center gap-[40px] mr-[40px]">
        <StatCard
          icon={<FileText className="w-5 h-5 text-[#3C1053]" />}
          title="Total reports"
          value="156"
          subtitle="All time"
        />

        <StatCard
          icon={<CalendarDays className="w-5 h-5 text-[#3C1053]" />}
          title="This month"
          value="48"
          subtitle="+12% from last month"
        />

        <StatCard
          icon={<PieChart className="w-5 h-5 text-[#3C1053]" />}
          title="This quarter"
          value="67"
          subtitle="Q4 2025"
        />

        <StatCard
          icon={<Users className="w-5 h-5 text-[#3C1053]" />}
          title="Active customers"
          value="47"
          subtitle="With reports"
        />
      </div>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: ReactNode
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-[40px] h-[40px] rounded-lg bg-white flex items-center justify-center align-center">
        {icon}
      </div>

      <div className="flex flex-col">
        <span className="text-[14px] text-[#747474] weight-[400px]">
          {title}
        </span>

        <span className="text-[28px] font-semibold text-[#4E4E4E]">
          {value}
        </span>

        <span className="text-[12px] text-[#59187B]">
          {subtitle}
        </span>
      </div>
    </div>
  )
}