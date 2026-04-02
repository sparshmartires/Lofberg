import { createApi } from "@reduxjs/toolkit/query/react"
import { createBaseQuery } from "./baseApi"
import type {
  ReportDto,
  StatusLabel,
  GetReportsParams,
  PaginatedReportsResponse,
  SaveDraftRequest,
  GenerateReportRequest,
  ReportWizardState,
} from "@/features/report-generation/types"

type ApiObject = Record<string, unknown>

const asObject = (value: unknown): ApiObject =>
  value && typeof value === "object" ? (value as ApiObject) : {}

const unwrapPayload = (payload: unknown): unknown => {
  let current: unknown = payload

  for (let depth = 0; depth < 5; depth += 1) {
    const source = asObject(current)
    const candidate = source.data ?? source.result ?? source.payload ?? source.value

    if (candidate === undefined || candidate === null || candidate === current) {
      return current
    }

    current = candidate
  }

  return current
}

const toArray = (value: unknown): ApiObject[] => {
  const unwrapped = unwrapPayload(value)

  if (Array.isArray(unwrapped)) {
    return unwrapped as ApiObject[]
  }

  if (unwrapped && typeof unwrapped === "object") {
    const source = asObject(unwrapped)
    const candidates = [
      source.items,
      source.data,
      source.results,
      source.reports,
      source.value,
      source.records,
      source.rows,
    ]

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as ApiObject[]
      }
    }
  }

  return []
}

const toNullableString = (value: unknown): string | null => {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text ? text : null
}

const mapReport = (item: ApiObject): ReportDto => ({
  id: String(item.id ?? item.reportId ?? ""),
  title: String(item.title ?? item.reportName ?? item.name ?? ""),
  customerName: String(item.customerName ?? item.customer ?? ""),
  customerId: String(item.customerId ?? ""),
  salesRepresentativeId: String(item.salesRepresentativeId ?? ""),
  salesRepresentative: String(item.salesRepresentative ?? item.salesRep ?? ""),
  reportDate: String(item.reportDate ?? item.createdAt ?? ""),
  reportType: Number(item.reportType ?? 0),
  status: Number(item.status ?? 0),
  statusLabel: String(item.statusLabel ?? "Draft") as StatusLabel,
  outputFormat: Number(item.outputFormat ?? 0),
  outputSize: Number(item.outputSize ?? 0),
  customerSegment: toNullableString(item.customerSegment),
  customerLogoUrl: toNullableString(item.customerLogoUrl),
  salesRepProfileImageUrl: toNullableString(item.salesRepProfileImageUrl),
  generatedFileUrl: toNullableString(item.generatedFileUrl ?? item.fileUrl),
  createdAt: String(item.createdAt ?? ""),
  updatedAt: String(item.updatedAt ?? ""),
})

const normalizeReportsResponse = (
  payload: unknown,
  pageNumber: number,
  pageSize: number
): PaginatedReportsResponse => {
  const unwrapped = unwrapPayload(payload)
  const source = asObject(unwrapped)

  const items = toArray(unwrapped).map(mapReport)

  const totalCount = Number(source.totalCount ?? source.total ?? items.length)
  const responsePageNumber = Number(source.pageNumber ?? source.page ?? pageNumber)
  const responsePageSize = Number(source.pageSize ?? source.size ?? pageSize)
  const totalPages = Number(
    source.totalPages ??
      (responsePageSize > 0 ? Math.max(1, Math.ceil(totalCount / responsePageSize)) : 1)
  )

  return { items, totalCount, pageNumber: responsePageNumber, pageSize: responsePageSize, totalPages }
}

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Reports", "ReportDrafts"],
  endpoints: (builder) => ({
    getReports: builder.query<PaginatedReportsResponse, GetReportsParams>({
      query: ({ pageNumber, pageSize, searchTerm, customerId, salesRepresentativeId, status, type, dateFrom, dateTo, segmentId, createdFrom, createdTo, sortBy, sortDirection }) => ({
        url: "/reports",
        params: {
          pageNumber,
          pageSize,
          ...(searchTerm ? { searchTerm } : {}),
          ...(customerId ? { customerId } : {}),
          ...(salesRepresentativeId ? { salesRepresentativeId } : {}),
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
          ...(segmentId ? { segmentId } : {}),
          ...(createdFrom ? { createdFrom } : {}),
          ...(createdTo ? { createdTo } : {}),
          ...(sortBy ? { sortBy } : {}),
          ...(sortDirection ? { sortDirection } : {}),
        },
      }),
      transformResponse: (response: unknown, _meta, args) =>
        normalizeReportsResponse(response, args.pageNumber, args.pageSize),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((report) => ({ type: "Reports" as const, id: report.id })),
              { type: "Reports" as const, id: "LIST" },
            ]
          : [{ type: "Reports" as const, id: "LIST" }],
    }),

    getReport: builder.query<ReportDto, { id: string }>({
      query: ({ id }) => `/reports/${id}`,
      transformResponse: (response: unknown) => mapReport(asObject(unwrapPayload(response))),
      providesTags: (_result, _error, arg) => [{ type: "Reports", id: arg.id }],
    }),

    getDrafts: builder.query<ReportDto[], void>({
      query: () => "/reports/drafts",
      transformResponse: (response: unknown) => toArray(response).map(mapReport),
      providesTags: [{ type: "ReportDrafts", id: "LIST" }],
    }),

    getDraft: builder.query<{ wizardState: ReportWizardState }, { id: string }>({
      query: ({ id }) => `/reports/drafts/${id}`,
      transformResponse: (response: unknown) => {
        const unwrapped = asObject(unwrapPayload(response))
        return { wizardState: unwrapped.wizardState as ReportWizardState }
      },
      providesTags: (_result, _error, arg) => [{ type: "ReportDrafts", id: arg.id }],
    }),

    getReportWizardState: builder.query<{ wizardState: ReportWizardState }, { id: string }>({
      query: ({ id }) => `/reports/${id}/wizard-state`,
      transformResponse: (response: unknown) => {
        const unwrapped = asObject(unwrapPayload(response))
        return { wizardState: unwrapped.wizardState as ReportWizardState }
      },
      providesTags: (_result, _error, arg) => [{ type: "Reports", id: arg.id }],
    }),

    saveDraft: builder.mutation<{ draftId: string }, SaveDraftRequest>({
      query: (body) => ({
        url: "/reports/drafts",
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) => {
        const unwrapped = asObject(unwrapPayload(response))
        return { draftId: String(unwrapped.id ?? unwrapped.draftId ?? "") }
      },
      invalidatesTags: [{ type: "ReportDrafts", id: "LIST" }],
    }),

    deleteDraft: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/reports/drafts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ReportDrafts", id: arg.id },
        { type: "ReportDrafts", id: "LIST" },
      ],
    }),

    generateReport: builder.mutation<{ reportId: string; generatedFileUrl: string | null; jpegZipUrl?: string | null }, GenerateReportRequest>({
      query: (body) => ({
        url: "/reports/generate",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => {
        const unwrapped = asObject(unwrapPayload(response))
        return {
          reportId: String(unwrapped.id ?? unwrapped.reportId ?? ""),
          generatedFileUrl: (unwrapped.generatedFileUrl as string) ?? null,
          jpegZipUrl: (unwrapped.jpegZipUrl as string) ?? null,
        }
      },
      invalidatesTags: [
        { type: "Reports", id: "LIST" },
        { type: "ReportDrafts", id: "LIST" },
      ],
    }),

    previewReport: builder.mutation<{ previewPdfBase64: string }, GenerateReportRequest>({
      query: (body) => ({
        url: "/reports/preview",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => {
        const unwrapped = asObject(unwrapPayload(response))
        return {
          previewPdfBase64: String(unwrapped.previewPdfBase64 ?? ""),
        }
      },
    }),

    archiveReport: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/reports/${id}/archive`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Reports", id: arg.id },
        { type: "Reports", id: "LIST" },
      ],
    }),

    restoreReport: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/reports/${id}/restore`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Reports", id: arg.id },
        { type: "Reports", id: "LIST" },
      ],
    }),

    getSegments: builder.query<{ id: string; name: string }[], void>({
      query: () => "/segments",
      transformResponse: (response: unknown) =>
        toArray(response).map((item) => ({
          id: String(item.id ?? ""),
          name: String(item.name ?? ""),
        })),
    }),

    uploadDataFile: builder.mutation<{ url: string }, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("fileCategory", "Document")

        return {
          url: "/files/upload",
          method: "POST",
          body: formData,
        }
      },
      transformResponse: (response: unknown) => {
        const unwrapped = asObject(unwrapPayload(response))
        return { url: String(unwrapped.fileUrl ?? unwrapped.url ?? "") }
      },
    }),

    uploadImage: builder.mutation<{ url: string }, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("fileCategory", "Image")

        return {
          url: "/files/upload",
          method: "POST",
          body: formData,
        }
      },
      transformResponse: (response: unknown) => {
        const unwrapped = asObject(unwrapPayload(response))
        return { url: String(unwrapped.fileUrl ?? unwrapped.url ?? "") }
      },
    }),
  }),
})

export const {
  useGetReportsQuery,
  useGetReportQuery,
  useGetDraftsQuery,
  useGetDraftQuery,
  useGetReportWizardStateQuery,
  useSaveDraftMutation,
  useDeleteDraftMutation,
  useGenerateReportMutation,
  usePreviewReportMutation,
  useArchiveReportMutation,
  useRestoreReportMutation,
  useGetSegmentsQuery,
  useUploadDataFileMutation,
  useUploadImageMutation,
} = reportsApi
