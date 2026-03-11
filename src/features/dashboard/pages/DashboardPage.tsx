import DashboardHeader from "../components/DashboardHeader"
import { ReportsByMarkets } from "../components/ReportsByMarkets"
import { ReportsByMarketSegments } from "../components/ReportsBySegments"
import { TopCustomers } from "../components/TopCustomers"
import { SalesRepPerformance } from "../components/SalesRepPerformance"
import ReportTypeDistribution from "../components/ReportTypeDistribution"

export function DashboardPage() {
  return (
    <>
      <DashboardHeader />

      <div className="grid lg:grid-cols-2 gap-[20px] mt-[20px]">
        <ReportsByMarkets />

        <ReportsByMarketSegments />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-[20px]">
        <TopCustomers />

        <SalesRepPerformance />
      </div>
      <div className="mt-6">
  <ReportTypeDistribution />
</div>
    </>
  )
}
