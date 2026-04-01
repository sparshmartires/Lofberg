"use client"

import type { ReactNode } from "react"
import { FileText, CalendarDays, PieChart, Users } from "lucide-react"

interface DashboardHeaderProps {
  totalReports: number
  reportsThisMonth: number
  reportsThisQuarter: number
  activeCustomers: number
}

export default function DashboardHeader({
  totalReports,
  reportsThisMonth,
  reportsThisQuarter,
  activeCustomers,
}: DashboardHeaderProps) {
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

      <div className="hidden lg:flex items-center gap-[40px] mr-[40px]">
        <StatCard
          icon={<FileText className="w-5 h-5 text-[#3C1053]" />}
          title="Total reports"
          value={String(totalReports)}
          subtitle="All time"
        />

        <StatCard
          icon={<CalendarDays className="w-5 h-5 text-[#3C1053]" />}
          title="This month"
          value={String(reportsThisMonth)}
          subtitle="Current month"
        />

        <StatCard
          icon={<PieChart className="w-5 h-5 text-[#3C1053]" />}
          title="This quarter"
          value={String(reportsThisQuarter)}
          subtitle="Current quarter"
        />

        <StatCard
          icon={<Users className="w-5 h-5 text-[#3C1053]" />}
          title="Active customers"
          value={String(activeCustomers)}
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