"use client"

import { useGetDashboardStatisticsQuery } from "@/store/services/dashboardApi"
import DashboardHeader from "../components/DashboardHeader"
import { ReportsByMarkets } from "../components/ReportsByMarkets"
import { ReportsByMarketSegments } from "../components/ReportsBySegments"
import { TopCustomers } from "../components/TopCustomers"
import { SalesRepPerformance } from "../components/SalesRepPerformance"
import ReportTypeDistribution from "../components/ReportTypeDistribution"

export function DashboardPage() {
  const { data, isLoading } = useGetDashboardStatisticsQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[16px] text-[#747474]">Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[16px] text-[#747474]">No dashboard data available</p>
      </div>
    )
  }

  return (
    <>
      <DashboardHeader
        totalReports={data.totalReports}
        reportsThisMonth={data.reportsThisMonth}
        reportsThisQuarter={data.reportsThisQuarter}
        activeCustomers={data.activeCustomers}
      />

      <div className="grid lg:grid-cols-2 gap-[20px] mt-[20px]">
        <ReportsByMarkets data={data.reportsByRegion} />

        <ReportsByMarketSegments data={data.reportsBySegment} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-[20px]">
        <TopCustomers data={data.topCustomers} />

        <SalesRepPerformance data={data.salesRepPerformance} />
      </div>
      <div className="mt-6">
        <ReportTypeDistribution data={data.reportTypeDistribution} />
      </div>
    </>
  )
}
