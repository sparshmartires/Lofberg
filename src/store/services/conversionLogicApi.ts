import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5215"

export interface SegmentConversionItem {
  id: string
  segmentId: string
  segmentName: string
  metricId: string
  metricName: string
  conversionValue: number
  createdAt: string
  updatedAt: string | null
}

export interface CO2ConversionItem {
  id: string
  name: string
  conversionValue: number
  createdAt: string
  updatedAt: string | null
}

export interface CreateSegmentConversionRequest {
  segmentId: string
  metricLabel: string
  conversionValue: number
}

export interface UpdateSegmentConversionRequest {
  metricLabel: string
  conversionValue: number
}

export interface CreateCO2ConversionRequest {
  name: string
  conversionValue: number
}

export interface UpdateCO2ConversionRequest {
  name: string
  conversionValue: number
}

export interface ConversionTranslationItem {
  id: string
  languageId: string
  languageName: string
  metricText: string
}

export interface SaveConversionTranslationsRequest {
  translations: { languageId: string; metricText: string }[]
}

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
      source.conversions,
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

const mapSegmentConversion = (item: ApiObject): SegmentConversionItem => ({
  id: String(item.id ?? ""),
  segmentId: String(item.segmentId ?? ""),
  segmentName: String(item.segmentName ?? "-"),
  metricId: String(item.metricId ?? ""),
  metricName: String(item.metricName ?? "-"),
  conversionValue: Number(item.conversionValue ?? 0),
  createdAt: String(item.createdAt ?? ""),
  updatedAt: toNullableString(item.updatedAt),
})

const mapConversionTranslation = (item: ApiObject): ConversionTranslationItem => ({
  id: String(item.id ?? ""),
  languageId: String(item.languageId ?? ""),
  languageName: String(item.languageName ?? ""),
  metricText: String(item.metricText ?? ""),
})

const mapCO2Conversion = (item: ApiObject): CO2ConversionItem => ({
  id: String(item.id ?? ""),
  name: String(item.name ?? ""),
  conversionValue: Number(item.conversionValue ?? 0),
  createdAt: String(item.createdAt ?? ""),
  updatedAt: toNullableString(item.updatedAt),
})

export const conversionLogicApi = createApi({
  reducerPath: "conversionLogicApi",
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
  tagTypes: ["SegmentConversions", "CO2Conversions", "ConversionTranslations"],
  endpoints: (builder) => ({
    // ==================== SEGMENT CONVERSIONS ====================

    getSegmentConversions: builder.query<SegmentConversionItem[], void>({
      query: () => "/segment-conversions",
      transformResponse: (response: unknown) =>
        toArray(response).map(mapSegmentConversion),
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: "SegmentConversions" as const, id: item.id })),
              { type: "SegmentConversions" as const, id: "LIST" },
            ]
          : [{ type: "SegmentConversions" as const, id: "LIST" }],
    }),

    getSegmentConversionsBySegment: builder.query<SegmentConversionItem[], string>({
      query: (segmentId) => `/segment-conversions/by-segment/${segmentId}`,
      transformResponse: (response: unknown) =>
        toArray(response).map(mapSegmentConversion),
      providesTags: (result, _error, segmentId) =>
        result
          ? [
              ...result.map((item) => ({ type: "SegmentConversions" as const, id: item.id })),
              { type: "SegmentConversions" as const, id: `SEGMENT_${segmentId}` },
            ]
          : [{ type: "SegmentConversions" as const, id: `SEGMENT_${segmentId}` }],
    }),

    createSegmentConversion: builder.mutation<unknown, CreateSegmentConversionRequest>({
      query: (body) => ({
        url: "/segment-conversions",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SegmentConversions", id: "LIST" }],
    }),

    updateSegmentConversion: builder.mutation<
      unknown,
      { id: string; body: UpdateSegmentConversionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/segment-conversions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "SegmentConversions", id: arg.id },
        { type: "SegmentConversions", id: "LIST" },
      ],
    }),

    deleteSegmentConversion: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/segment-conversions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "SegmentConversions", id },
        { type: "SegmentConversions", id: "LIST" },
      ],
    }),

    // ==================== CO2 CONVERSIONS ====================

    getCO2Conversions: builder.query<CO2ConversionItem[], void>({
      query: () => "/co2-conversions",
      transformResponse: (response: unknown) =>
        toArray(response).map(mapCO2Conversion),
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: "CO2Conversions" as const, id: item.id })),
              { type: "CO2Conversions" as const, id: "LIST" },
            ]
          : [{ type: "CO2Conversions" as const, id: "LIST" }],
    }),

    createCO2Conversion: builder.mutation<unknown, CreateCO2ConversionRequest>({
      query: (body) => ({
        url: "/co2-conversions",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "CO2Conversions", id: "LIST" }],
    }),

    updateCO2Conversion: builder.mutation<
      unknown,
      { id: string; body: UpdateCO2ConversionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/co2-conversions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "CO2Conversions", id: arg.id },
        { type: "CO2Conversions", id: "LIST" },
      ],
    }),

    deleteCO2Conversion: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/co2-conversions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "CO2Conversions", id },
        { type: "CO2Conversions", id: "LIST" },
      ],
    }),

    // ==================== CONVERSION TRANSLATIONS ====================

    getSegmentConversionTranslations: builder.query<ConversionTranslationItem[], string>({
      query: (id) => `/segment-conversions/${id}/translations`,
      transformResponse: (response: unknown) =>
        toArray(response).map(mapConversionTranslation),
      providesTags: (_result, _error, id) => [
        { type: "ConversionTranslations" as const, id: `segment_${id}` },
      ],
    }),

    saveSegmentConversionTranslations: builder.mutation<
      unknown,
      { id: string; body: SaveConversionTranslationsRequest }
    >({
      query: ({ id, body }) => ({
        url: `/segment-conversions/${id}/translations`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ConversionTranslations", id: `segment_${arg.id}` },
      ],
    }),

    getCO2ConversionTranslations: builder.query<ConversionTranslationItem[], string>({
      query: (id) => `/co2-conversions/${id}/translations`,
      transformResponse: (response: unknown) =>
        toArray(response).map(mapConversionTranslation),
      providesTags: (_result, _error, id) => [
        { type: "ConversionTranslations" as const, id: `co2_${id}` },
      ],
    }),

    saveCO2ConversionTranslations: builder.mutation<
      unknown,
      { id: string; body: SaveConversionTranslationsRequest }
    >({
      query: ({ id, body }) => ({
        url: `/co2-conversions/${id}/translations`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ConversionTranslations", id: `co2_${arg.id}` },
      ],
    }),
  }),
})

export const {
  useGetSegmentConversionsQuery,
  useGetSegmentConversionsBySegmentQuery,
  useCreateSegmentConversionMutation,
  useUpdateSegmentConversionMutation,
  useDeleteSegmentConversionMutation,
  useGetCO2ConversionsQuery,
  useCreateCO2ConversionMutation,
  useUpdateCO2ConversionMutation,
  useDeleteCO2ConversionMutation,
  useGetSegmentConversionTranslationsQuery,
  useSaveSegmentConversionTranslationsMutation,
  useGetCO2ConversionTranslationsQuery,
  useSaveCO2ConversionTranslationsMutation,
} = conversionLogicApi
