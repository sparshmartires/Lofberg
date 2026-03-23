import { createApi } from "@reduxjs/toolkit/query/react"
import { createBaseQuery } from "./baseApi"

export interface SalesRoleOption {
  id: string
  name: string
}

export interface SalesFilterOption {
  id: string
  name: string
}

export interface SalesRepresentativeItem {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  notes: string | null
  roleId: string
  roleName: string
  isActive: boolean
  reportsCount: number
  lastLogin: string | null
}

export interface GetSalesRepresentativesParams {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  isActive?: boolean
  segmentId?: string
  regionId?: string
  sortBy?: string
  sortDirection?: string
}

export interface PaginatedSalesRepresentativesResponse {
  items: SalesRepresentativeItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface CreateSalesRepresentativeRequest {
  firstName: string
  lastName?: string | null
  email: string
  phoneNumber?: string | null
  notes?: string | null
  roleId: string
  isActive?: boolean
}

export type UpdateSalesRepresentativeRequest = CreateSalesRepresentativeRequest

type ApiObject = Record<string, unknown>

const asObject = (value: unknown): ApiObject =>
  value && typeof value === "object" ? (value as ApiObject) : {}

const unwrapPayload = (payload: unknown): unknown => {
  let current: unknown = payload

  for (let depth = 0; depth < 4; depth += 1) {
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
      source.users,
      source.salesRepresentatives,
      source.value,
      source.records,
      source.rows,
    ]

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as ApiObject[]
      }

      if (candidate && typeof candidate === "object") {
        const nested = asObject(candidate)
        const nestedCandidates = [
          nested.items,
          nested.data,
          nested.results,
          nested.users,
          nested.salesRepresentatives,
          nested.value,
          nested.records,
          nested.rows,
        ]

        for (const nestedCandidate of nestedCandidates) {
          if (Array.isArray(nestedCandidate)) {
            return nestedCandidate as ApiObject[]
          }
        }
      }
    }
  }

  return []
}

const mapSalesRepresentative = (item: ApiObject): SalesRepresentativeItem => {
  const role = asObject(item.role)
  const firstName = item.firstName ?? item.firstname ?? ""
  const lastName = item.lastName ?? item.lastname ?? ""
  const fullName = item.name ?? item.fullName ?? `${firstName} ${lastName}`.trim()

  const [fallbackFirstName, ...rest] = String(fullName || "").split(" ")
  const fallbackLastName = rest.join(" ").trim()

  return {
    id: String(item.id ?? item.salesRepresentativeId ?? item.userId ?? ""),
    firstName: String(firstName || fallbackFirstName || ""),
    lastName: String(lastName || fallbackLastName || ""),
    email: String(item.email ?? ""),
    phoneNumber: (item.phoneNumber ?? item.phone ?? null) as string | null,
    notes: (item.notes ?? item.comment ?? null) as string | null,
    roleId: String(item.roleId ?? role.id ?? ""),
    roleName: String(item.roleName ?? role.name ?? item.role ?? "-"),
    isActive: Boolean(item.isActive ?? item.active ?? true),
    reportsCount: Number(item.reportsCount ?? item.reports ?? 0),
    lastLogin: (item.lastLogin ?? item.lastLoginAt ?? null) as string | null,
  }
}

const normalizeSalesRepresentativesResponse = (
  payload: unknown,
  pageNumber: number,
  pageSize: number
): PaginatedSalesRepresentativesResponse => {
  const root = asObject(payload)
  const unwrapped = unwrapPayload(payload)
  const source = asObject(unwrapped)
  const meta = asObject(root.meta ?? source.meta)
  const pagination = asObject(root.pagination ?? source.pagination ?? meta.pagination)

  const items = toArray(unwrapped).map(mapSalesRepresentative)

  const totalCount = Number(
    source.totalCount ??
      source.totalItems ??
      source.count ??
      source.total ??
      pagination.totalCount ??
      pagination.totalItems ??
      pagination.count ??
      pagination.total ??
      items.length
  )

  const responsePageNumber = Number(
    source.pageNumber ?? source.page ?? pagination.pageNumber ?? pagination.page ?? pageNumber
  )
  const responsePageSize = Number(
    source.pageSize ?? source.size ?? pagination.pageSize ?? pagination.size ?? pageSize
  )
  const totalPages = Number(
    source.totalPages ??
      source.pageCount ??
      pagination.totalPages ??
      pagination.pageCount ??
      (responsePageSize > 0 ? Math.max(1, Math.ceil(totalCount / responsePageSize)) : 1)
  )

  return {
    items,
    totalCount,
    pageNumber: responsePageNumber,
    pageSize: responsePageSize,
    totalPages,
  }
}

const normalizeRolesResponse = (payload: unknown): SalesRoleOption[] => {
  const sourceItems = toArray(payload)

  return sourceItems
    .map((item) => ({
      id: String(item.id ?? item.roleId ?? ""),
      name: String(item.name ?? item.roleName ?? item.title ?? ""),
    }))
    .filter((role) => Boolean(role.id) && Boolean(role.name))
}

const normalizeFilterOptionsResponse = (payload: unknown): SalesFilterOption[] => {
  const sourceItems = toArray(payload)

  return sourceItems
    .map((item) => ({
      id: String(item.id ?? item.segmentId ?? item.regionId ?? item.value ?? item.code ?? ""),
      name: String(item.name ?? item.segmentName ?? item.regionName ?? item.label ?? item.title ?? ""),
    }))
    .filter((option) => Boolean(option.id) && Boolean(option.name))
}

export const salesRepresentativesApi = createApi({
  reducerPath: "salesRepresentativesApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["SalesRepresentatives", "SalesRoles"],
  endpoints: (builder) => ({
    getSalesRepresentatives: builder.query<
      PaginatedSalesRepresentativesResponse,
      GetSalesRepresentativesParams
    >({
      query: ({ pageNumber, pageSize, searchTerm, isActive, segmentId, regionId, sortBy, sortDirection }) => ({
        url: "/sales-representatives",
        params: {
          pageNumber,
          pageSize,
          ...(searchTerm ? { searchTerm } : {}),
          ...(typeof isActive === "boolean" ? { isActive } : {}),
          ...(segmentId ? { segmentId } : {}),
          ...(regionId ? { regionId } : {}),
          ...(sortBy ? { sortBy } : {}),
          ...(sortBy ? { sortDirection } : {}),
        },
      }),
      transformResponse: (response: unknown, _meta, args) =>
        normalizeSalesRepresentativesResponse(response, args.pageNumber, args.pageSize),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((salesRep) => ({
                type: "SalesRepresentatives" as const,
                id: salesRep.id,
              })),
              { type: "SalesRepresentatives" as const, id: "LIST" },
            ]
          : [{ type: "SalesRepresentatives" as const, id: "LIST" }],
    }),

    getSalesRoles: builder.query<SalesRoleOption[], void>({
      query: () => ({
        url: "/roles/sales",
      }),
      transformResponse: (response: unknown) => normalizeRolesResponse(response),
      providesTags: [{ type: "SalesRoles", id: "LIST" }],
    }),

    getSalesSegments: builder.query<SalesFilterOption[], string>({
      query: (languageId) => ({
        url: "/segments",
        params: {
          languageId,
        },
      }),
      transformResponse: (response: unknown) => normalizeFilterOptionsResponse(response),
    }),

    getLanguages: builder.query<SalesFilterOption[], void>({
      query: () => ({
        url: "/languages",
      }),
      transformResponse: (response: unknown) => normalizeFilterOptionsResponse(response),
    }),

    getSalesRegions: builder.query<SalesFilterOption[], void>({
      query: () => ({
        url: "/regions",
      }),
      transformResponse: (response: unknown) => normalizeFilterOptionsResponse(response),
    }),

    createSalesRepresentative: builder.mutation<unknown, CreateSalesRepresentativeRequest>({
      query: (body) => ({
        url: "/sales-representatives",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SalesRepresentatives", id: "LIST" }],
    }),

    updateSalesRepresentative: builder.mutation<
      unknown,
      { id: string; body: UpdateSalesRepresentativeRequest }
    >({
      query: ({ id, body }) => ({
        url: `/sales-representatives/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "SalesRepresentatives", id: arg.id },
        { type: "SalesRepresentatives", id: "LIST" },
      ],
    }),

    deleteSalesRepresentative: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/sales-representatives/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "SalesRepresentatives", id },
        { type: "SalesRepresentatives", id: "LIST" },
      ],
    }),
  }),
})

export const {
  useGetSalesRepresentativesQuery,
  useGetSalesRolesQuery,
  useGetSalesSegmentsQuery,
  useGetLanguagesQuery,
  useGetSalesRegionsQuery,
  useCreateSalesRepresentativeMutation,
  useUpdateSalesRepresentativeMutation,
  useDeleteSalesRepresentativeMutation,
} = salesRepresentativesApi