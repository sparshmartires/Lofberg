"use client"

import Image from "next/image"
import { useAppSelector } from "@/store/hooks"
import { CertificationType, FT_PREMIER_TYPES } from "../types"
import { useGetSegmentConversionsBySegmentQuery, useGetCO2ConversionsQuery } from "@/store/services/conversionLogicApi"

export function ReportSummary() {
  const { step1, step2, step4, currentStep } = useAppSelector((state) => state.reportWizard)

  const segmentId = step1.customerSegmentId
  const { data: segmentConversions = [] } = useGetSegmentConversionsBySegmentQuery(
    segmentId!, { skip: !segmentId }
  )
  const { data: co2Conversions = [] } = useGetCO2ConversionsQuery()

  const hasCustomer = Boolean(step1.customerId)
  const hasData = step2.rows.some((r) => r.quantityKg !== null || r.currencyAmount !== null)

  return (
    <div className="rounded-[24px] bg-white border-l-4 border-primary shadow-sm p-6 sticky top-6">
      <h3 className="text-lg font-semibold text-[#1F1F1F] mb-4">Report summary</h3>

      {!hasCustomer ? (
        <p className="text-sm text-[#9CA3AF]">Select a customer to view report summary</p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[#747474]">Client information</p>

          {step1.customerLogoUrl && (
            <Image
              src={step1.customerLogoUrl}
              alt="Customer logo"
              width={160}
              height={60}
              className="h-12 w-auto object-contain"
              unoptimized
            />
          )}

          <div className="space-y-1 text-sm">
            <p>
              <span className="text-[#747474]">Customer name: </span>
              <span className="text-[#1F1F1F]">{step1.customerName}</span>
            </p>
            {step1.customerAccountCode && (
              <p>
                <span className="text-[#747474]">Customer ID: </span>
                <span className="text-[#1F1F1F]">{step1.customerAccountCode}</span>
              </p>
            )}
            {step1.customerEmail && (
              <p>
                <span className="text-[#747474]">Email: </span>
                <span className="text-[#1F1F1F]">{step1.customerEmail}</span>
              </p>
            )}
            {step1.customerPhone && (
              <p>
                <span className="text-[#747474]">Phone: </span>
                <span className="text-[#1F1F1F]">{step1.customerPhone}</span>
              </p>
            )}
            {step1.customerSegment && (
              <p>
                <span className="text-[#747474]">Segment: </span>
                <span className="text-[#1F1F1F]">{step1.customerSegment}</span>
              </p>
            )}
            {step1.customerType && (
              <p>
                <span className="text-[#747474]">Type: </span>
                <span className="text-[#1F1F1F]">{step1.customerType}</span>
              </p>
            )}
          </div>

          {/* Conversion selections (from step 4+) */}
          {currentStep >= 4 && (
            <div className="space-y-1 text-sm">
              <p className="text-sm font-medium text-[#747474] mt-2">Conversion settings</p>
              <p>
                <span className="text-[#747474]">Quantity: </span>
                <span className="text-[#1F1F1F]">
                  {step4.quantityUnit === "kilograms" ? "Kilograms" : "Cups of coffee"}
                </span>
              </p>
              <p>
                <span className="text-[#747474]">Area: </span>
                <span className="text-[#1F1F1F]">
                  {step4.selectedSegmentConversionId
                    ? segmentConversions.find((sc) => sc.id === step4.selectedSegmentConversionId)?.metricName ?? "Custom"
                    : "Football pitches"}
                </span>
              </p>
              <p>
                <span className="text-[#747474]">CO2: </span>
                <span className="text-[#1F1F1F]">
                  {step4.selectedCO2ConversionId
                    ? co2Conversions.find((c) => c.id === step4.selectedCO2ConversionId)?.name ?? "Custom"
                    : "Kilograms"}
                </span>
              </p>
            </div>
          )}

          {/* Data table preview (from step 2+) */}
          {hasData && currentStep >= 2 && (
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#F0F0F0]">
                      <th className="text-left py-1 px-1 font-medium">Name</th>
                      <th className="text-center py-1 px-1 font-medium">Qty</th>
                      <th className="text-center py-1 px-1 font-medium">FF</th>
                      <th className="text-center py-1 px-1 font-medium">Cups</th>
                      <th className="text-center py-1 px-1 font-medium">(&euro;)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {step2.rows.map((row) => {
                      const isFT = FT_PREMIER_TYPES.includes(row.certificationType)
                      const isCO2 = row.certificationType === CertificationType.CO2

                      // Short label for summary
                      const shortName = getShortName(row.certificationType)

                      return (
                        <tr key={row.certificationType} className="border-b border-[#F0F0F0]">
                          <td className="py-1 px-1">
                            {isFT && <span className="text-[#9CA3AF] mr-1">&#x251C;</span>}
                            {shortName}
                          </td>
                          <td className="text-center py-1 px-1">
                            {isFT ? "\u2014" : row.quantityKg ?? "\u2014"}
                          </td>
                          <td className="text-center py-1 px-1">
                            {isFT || isCO2
                              ? isCO2 ? "N/A" : "\u2014"
                              : row.footballFields ?? "\u2014"}
                          </td>
                          <td className="text-center py-1 px-1">
                            {isFT || isCO2
                              ? isCO2 ? "N/A" : "\u2014"
                              : row.cupsOfCoffee ? `${(row.cupsOfCoffee / 1000).toFixed(0)}k` : "\u2014"}
                          </td>
                          <td className="text-center py-1 px-1">
                            {isFT
                              ? row.currencyAmount?.toLocaleString() ?? "\u2014"
                              : "N/A"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] text-[#9CA3AF] mt-2">
                FT Premier values represent financial impact: premiums paid to cooperatives and
                increased income for organic farming.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getShortName(type: CertificationType): string {
  const map: Record<CertificationType, string> = {
    [CertificationType.RainforestAlliance]: "RA",
    [CertificationType.Fairtrade]: "FT",
    [CertificationType.FTPremierCooperativePremium]: "Coop",
    [CertificationType.FTPremierOrganicFarming]: "Org",
    [CertificationType.Organic]: "Org",
    [CertificationType.CO2]: "CO2",
  }
  return map[type] ?? String(type)
}
