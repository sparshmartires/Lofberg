import { createApi } from "@reduxjs/toolkit/query/react"
import { createBaseQuery } from "./baseApi"

export interface RegionReportCount {
  regionName: string
  count: number
}

export interface SegmentReportCount {
  segmentName: string
  count: number
  percentage: number
}

export interface TopCustomerDto {
  name: string
  logoUrl?: string
  segment: string
  reportCount: number
}

export interface SalesRepPerformanceDto {
  name: string
  profileImageUrl?: string
  region?: string
  reportCount: number
}

export interface ReportTypeDistributionDto {
  fullReport: number
  receiptOnly: number
  compiledReceipt: number
  total: number
}

export interface DashboardStatisticsDto {
  totalReports: number
  reportsThisMonth: number
  reportsThisQuarter: number
  activeCustomers: number
  reportsByRegion: RegionReportCount[]
  reportsBySegment: SegmentReportCount[]
  topCustomers: TopCustomerDto[]
  salesRepPerformance: SalesRepPerformanceDto[]
  reportTypeDistribution: ReportTypeDistributionDto
}

const unwrapData = (response: unknown): unknown => {
  if (response && typeof response === "object" && "data" in response) {
    return (response as Record<string, unknown>).data
  }
  return response
}

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboardStatistics: builder.query<DashboardStatisticsDto, void>({
      query: () => "/dashboard/statistics",
      transformResponse: (response: unknown) =>
        unwrapData(response) as DashboardStatisticsDto,
      providesTags: ["Dashboard"],
    }),
  }),
})

export const { useGetDashboardStatisticsQuery } = dashboardApi
