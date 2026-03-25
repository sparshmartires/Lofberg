import { Suspense } from "react"
import { ReportGenerationPage } from "@/features/report-generation/pages/ReportGenerationPage"

export default function Page() {
  return (
    <Suspense>
      <ReportGenerationPage />
    </Suspense>
  )
}
