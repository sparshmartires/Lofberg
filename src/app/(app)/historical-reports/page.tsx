import { Suspense } from "react"
import { HistoricalReportsPage } from "@/features/historical-reports/pages/HistoricalReportsPage"

export default function Page() {
  return (
    <Suspense>
      <HistoricalReportsPage />
    </Suspense>
  )
}
