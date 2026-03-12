import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5215"

// ── Enums ────────────────────────────────────────────────────────────

export enum TemplateType {
  Report = 0,
  Receipt = 1,
  CompiledReceipt = 2,
}

export enum TemplateSize {
  A4 = 0,
  A3 = 1,
}

export enum VersionStatus {
  Draft = 0,
  Active = 1,
  Archived = 2,
}

export enum PageType {
  CoverPage = 0,
  TableOfContents = 1,
  AboutSustainability = 2,
  LofbergsUSPs = 3,
  IncreasingPositiveImpact = 4,
  CertificationsOverview = 5,
  ReceiptRAC = 6,
  ReceiptCO2 = 7,
  ReceiptFairtrade = 8,
  ReceiptOrganic = 9,
  CompiledReceiptSummary = 10,
}

// ── Response DTOs ────────────────────────────────────────────────────

export interface TemplateVersionSummaryDto {
  id: string
  versionNumber: number
  versionName: string
  status: VersionStatus
  createdByUserName: string
  publishedByUserName: string | null
  createdAt: string
  publishedAt: string | null
  changeNotes: string | null
}

export interface TemplateDto {
  id: string
  type: TemplateType
  size: TemplateSize
  name: string
  activeVersion: TemplateVersionSummaryDto | null
  createdAt: string
  updatedAt: string | null
}

export interface TemplatePageContentDto {
  id: string
  templatePageId: string
  pageType: PageType
  sortOrder: number
  contentJson: string | null
}

export interface TemplateVersionDto {
  id: string
  templateId: string
  versionNumber: number
  versionName: string
  status: VersionStatus
  createdByUserName: string
  publishedByUserName: string | null
  createdAt: string
  publishedAt: string | null
  updatedAt: string | null
  changeNotes: string | null
  pages: TemplatePageContentDto[]
}

// ── Request DTOs ─────────────────────────────────────────────────────

export interface UpdatePageContentRequest {
  templatePageId: string
  contentJson: string | null
}

export interface CreateDraftRequest {
  changeNotes?: string
}

export interface UpdateDraftRequest {
  changeNotes?: string
  pages: UpdatePageContentRequest[]
}

export interface SaveActiveChangesRequest {
  pages: UpdatePageContentRequest[]
}

// ── Helpers ──────────────────────────────────────────────────────────

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

// ── API ──────────────────────────────────────────────────────────────

export const templatesApi = createApi({
  reducerPath: "templatesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const tokenFromStorage =
        typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const tokenFromCookie =
        typeof document !== "undefined"
          ? document.cookie
              .split("; ")
              .find((entry) => entry.startsWith("auth_token="))
              ?.split("=")[1] ?? null
          : null

      const token = tokenFromStorage || tokenFromCookie

      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }

      headers.set("ngrok-skip-browser-warning", "true")
      return headers
    },
  }),
  tagTypes: ["Templates", "TemplateVersions", "TemplateVersion"],
  endpoints: (builder) => ({
    // ── Queries ────────────────────────────────────────────────────

    getTemplates: builder.query<TemplateDto[], void>({
      query: () => "/templates",
      transformResponse: (response: unknown) => {
        const unwrapped = unwrapPayload(response)
        return Array.isArray(unwrapped) ? (unwrapped as TemplateDto[]) : []
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Templates" as const, id: t.id })),
              { type: "Templates" as const, id: "LIST" },
            ]
          : [{ type: "Templates" as const, id: "LIST" }],
    }),

    getTemplateVersions: builder.query<TemplateVersionSummaryDto[], { templateId: string }>({
      query: ({ templateId }) => `/templates/${templateId}/versions`,
      transformResponse: (response: unknown) => {
        const unwrapped = unwrapPayload(response)
        return Array.isArray(unwrapped) ? (unwrapped as TemplateVersionSummaryDto[]) : []
      },
      providesTags: (_result, _error, arg) => [
        { type: "TemplateVersions" as const, id: arg.templateId },
      ],
    }),

    getTemplateVersion: builder.query<
      TemplateVersionDto,
      { templateId: string; versionId: string }
    >({
      query: ({ templateId, versionId }) =>
        `/templates/${templateId}/versions/${versionId}`,
      transformResponse: (response: unknown) =>
        unwrapPayload(response) as TemplateVersionDto,
      providesTags: (_result, _error, arg) => [
        { type: "TemplateVersion" as const, id: arg.versionId },
      ],
    }),

    // ── Mutations ──────────────────────────────────────────────────

    createDraft: builder.mutation<
      TemplateVersionDto,
      { templateId: string; body?: CreateDraftRequest }
    >({
      query: ({ templateId, body }) => ({
        url: `/templates/${templateId}/versions/draft`,
        method: "POST",
        body: body ?? {},
      }),
      transformResponse: (response: unknown) =>
        unwrapPayload(response) as TemplateVersionDto,
      invalidatesTags: (_result, _error, arg) => [
        { type: "TemplateVersions", id: arg.templateId },
        { type: "Templates", id: "LIST" },
      ],
    }),

    updateDraft: builder.mutation<
      TemplateVersionDto,
      { templateId: string; body: UpdateDraftRequest }
    >({
      query: ({ templateId, body }) => ({
        url: `/templates/${templateId}/versions/draft`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) =>
        unwrapPayload(response) as TemplateVersionDto,
      invalidatesTags: (_result, _error, arg) => [
        { type: "TemplateVersions", id: arg.templateId },
      ],
    }),

    deleteDraft: builder.mutation<void, { templateId: string }>({
      query: ({ templateId }) => ({
        url: `/templates/${templateId}/versions/draft`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "TemplateVersions", id: arg.templateId },
      ],
    }),

    publishDraft: builder.mutation<TemplateVersionDto, { templateId: string }>({
      query: ({ templateId }) => ({
        url: `/templates/${templateId}/versions/draft/publish`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        unwrapPayload(response) as TemplateVersionDto,
      invalidatesTags: (_result, _error, arg) => [
        { type: "TemplateVersions", id: arg.templateId },
        { type: "Templates", id: "LIST" },
      ],
    }),

    rollbackVersion: builder.mutation<
      TemplateVersionDto,
      { templateId: string; versionId: string }
    >({
      query: ({ templateId, versionId }) => ({
        url: `/templates/${templateId}/versions/${versionId}/rollback`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        unwrapPayload(response) as TemplateVersionDto,
      invalidatesTags: (_result, _error, arg) => [
        { type: "TemplateVersions", id: arg.templateId },
        { type: "Templates", id: "LIST" },
      ],
    }),

    saveActiveChanges: builder.mutation<
      TemplateVersionDto,
      { templateId: string; body: SaveActiveChangesRequest }
    >({
      query: ({ templateId, body }) => ({
        url: `/templates/${templateId}/versions/active/save`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) =>
        unwrapPayload(response) as TemplateVersionDto,
      invalidatesTags: (_result, _error, arg) => [
        { type: "TemplateVersions", id: arg.templateId },
        { type: "Templates", id: "LIST" },
      ],
    }),
  }),
})

export const {
  useGetTemplatesQuery,
  useGetTemplateVersionsQuery,
  useGetTemplateVersionQuery,
  useCreateDraftMutation,
  useUpdateDraftMutation,
  useDeleteDraftMutation,
  usePublishDraftMutation,
  useRollbackVersionMutation,
  useSaveActiveChangesMutation,
} = templatesApi
