import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5215"

export interface CustomerOption {
  id: string
  name: string
}

export interface CustomerItem {
  id: string
  name: string
  accountCode: string | null
  segmentId: string | null
  segmentName: string
  serviceTier: number | null
  regionId: string | null
  regionName: string
  isSubCustomer: boolean
  parentCustomerId: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  isActive: boolean
  notes: string | null
  logoUrl: string | null
  lastReportDate: string | null
}

export interface GetCustomersParams {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  segmentId?: string
  regionId?: string
  isActive?: boolean
}

export interface PaginatedCustomersResponse {
  items: CustomerItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface CreateCustomerRequest {
  name: string
  accountCode?: string | null
  segmentId: string
  serviceTier: number
  regionId: string
  isSubCustomer?: boolean
  parentCustomerId?: string | null
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  address?: string | null
  isActive?: boolean
  notes?: string | null
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  isActive: boolean
}

/** Convert a request object to FormData with PascalCase keys for [FromForm] binding */
const toFormData = (obj: Record<string, unknown>): FormData => {
  const formData = new FormData()
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1)
    formData.append(pascalKey, String(value))
  }
  return formData
}

type ApiObject = Record<string, unknown>

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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
      source.customers,
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
          nested.customers,
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

const toNullableString = (value: unknown): string | null => {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text ? text : null
}

const resolveCustomerId = (item: ApiObject): string => {
  const nestedCustomer = asObject(item.customer)

  const candidates = [
    item.id,
    item.customerId,
    item.customerUuid,
    item.uuid,
    item.guid,
    nestedCustomer.id,
    nestedCustomer.customerId,
    nestedCustomer.customerUuid,
    nestedCustomer.uuid,
    nestedCustomer.guid,
  ]
    .map((value) => toNullableString(value))
    .filter((value): value is string => Boolean(value))

  const uuidCandidate = candidates.find((value) => UUID_REGEX.test(value))
  if (uuidCandidate) {
    return uuidCandidate
  }

  return candidates[0] ?? ""
}

const toNullableNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "") return null

  if (typeof value === "number" && !Number.isNaN(value)) {
    return value
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()

    if (normalized === "typea" || normalized === "type a") return 1
    if (normalized === "typeb" || normalized === "type b") return 2

    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }

  return null
}

const mapCustomer = (item: ApiObject): CustomerItem => {
  const segment = asObject(item.segment)
  const region = asObject(item.region)
  const contact = asObject(item.contact)

  return {
    id: resolveCustomerId(item),
    name: String(item.name ?? item.customerName ?? item.fullName ?? ""),
    accountCode: toNullableString(item.accountCode ?? item.erpId),
    segmentId: toNullableString(item.segmentId ?? item.industryId ?? segment.id ?? segment.segmentId),
    segmentName: String(item.segmentName ?? item.industryName ?? segment.name ?? item.segment ?? "-"),
    serviceTier: toNullableNumber(item.serviceTier ?? item.tier ?? item.serviceType),
    regionId: toNullableString(item.regionId ?? region.id ?? region.regionId),
    regionName: String(item.regionName ?? region.name ?? item.region ?? "-"),
    isSubCustomer: Boolean(item.isSubCustomer ?? false),
    parentCustomerId: toNullableString(item.parentCustomerId),
    contactName: toNullableString(item.contactName ?? item.contactPerson ?? contact.name),
    contactEmail: toNullableString(item.contactEmail ?? contact.email),
    contactPhone: toNullableString(item.contactPhone ?? contact.phone),
    address: toNullableString(item.address),
    isActive: Boolean(item.isActive ?? item.active ?? true),
    notes: toNullableString(item.notes),
    logoUrl: toNullableString(item.logoUrl ?? item.logo),
    lastReportDate: toNullableString(item.lastReportDate ?? item.lastReportAt),
  }
}

const extractCustomerObject = (payload: unknown): ApiObject => {
  const unwrapped = asObject(unwrapPayload(payload))

  if (unwrapped.id || unwrapped.customerId || unwrapped.name || unwrapped.customerName) {
    return unwrapped
  }

  const candidates = [
    unwrapped.customer,
    unwrapped.item,
    unwrapped.entity,
    unwrapped.details,
  ]

  for (const candidate of candidates) {
    const objectCandidate = asObject(candidate)
    if (
      objectCandidate.id ||
      objectCandidate.customerId ||
      objectCandidate.name ||
      objectCandidate.customerName
    ) {
      return objectCandidate
    }
  }

  return unwrapped
}

const normalizeCustomersResponse = (
  payload: unknown,
  pageNumber: number,
  pageSize: number
): PaginatedCustomersResponse => {
  const root = asObject(payload)
  const unwrapped = unwrapPayload(payload)
  const source = asObject(unwrapped)
  const meta = asObject(root.meta ?? source.meta)
  const pagination = asObject(root.pagination ?? source.pagination ?? meta.pagination)

  const items = toArray(unwrapped).map(mapCustomer)

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

const normalizeCustomerOptions = (payload: unknown): CustomerOption[] =>
  toArray(payload)
    .map((item) => ({
      id: String(item.id ?? item.value ?? item.code ?? ""),
      name: String(item.name ?? item.label ?? item.title ?? ""),
    }))
    .filter((option) => Boolean(option.id) && Boolean(option.name))

export const customersApi = createApi({
  reducerPath: "customersApi",
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
  tagTypes: ["Customers"],
  endpoints: (builder) => ({
    getCustomers: builder.query<PaginatedCustomersResponse, GetCustomersParams>({
      query: ({ pageNumber, pageSize, searchTerm, segmentId, regionId, isActive }) => ({
        url: "/customers",
        params: {
          pageNumber,
          pageSize,
          ...(searchTerm ? { searchTerm } : {}),
          ...(segmentId ? { segmentId } : {}),
          ...(regionId ? { regionId } : {}),
          ...(typeof isActive === "boolean" ? { isActive } : {}),
        },
      }),
      transformResponse: (response: unknown, _meta, args) =>
        normalizeCustomersResponse(response, args.pageNumber, args.pageSize),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((customer) => ({ type: "Customers" as const, id: customer.id })),
              { type: "Customers" as const, id: "LIST" },
            ]
          : [{ type: "Customers" as const, id: "LIST" }],
    }),

    getCustomerById: builder.query<CustomerItem | null, { id: string; includeHierarchy?: boolean }>({
      query: ({ id, includeHierarchy = true }) => ({
        url: `/customers/${id}`,
        params: { includeHierarchy },
      }),
      transformResponse: (response: unknown) => {
        const source = extractCustomerObject(response)

        if (!Object.keys(source).length) {
          return null
        }

        return mapCustomer(source)
      },
      providesTags: (_result, _error, arg) => [{ type: "Customers", id: arg.id }],
    }),

    getCustomerSegments: builder.query<CustomerOption[], void>({
      query: () => ({
        url: "/segments",
      }),
      transformResponse: (response: unknown) => normalizeCustomerOptions(response),
    }),

    getCustomerRegions: builder.query<CustomerOption[], void>({
      query: () => ({
        url: "/regions",
      }),
      transformResponse: (response: unknown) => normalizeCustomerOptions(response),
    }),

    createCustomer: builder.mutation<unknown, CreateCustomerRequest>({
      query: (body) => {
        const formData = toFormData(body as unknown as Record<string, unknown>)
        return { url: "/customers", method: "POST", body: formData }
      },
      invalidatesTags: [{ type: "Customers", id: "LIST" }],
    }),

    updateCustomer: builder.mutation<unknown, { id: string; body: UpdateCustomerRequest }>({
      query: ({ id, body }) => {
        const formData = toFormData(body as unknown as Record<string, unknown>)
        return { url: `/customers/${id}`, method: "PUT", body: formData }
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Customers", id: arg.id },
        { type: "Customers", id: "LIST" },
      ],
    }),

    uploadCustomerLogo: builder.mutation<unknown, { id: string; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData()
        formData.append("file", file)

        return {
          url: `/customers/${id}/logo`,
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Customers", id: arg.id },
        { type: "Customers", id: "LIST" },
      ],
    }),

    deleteCustomer: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Customers", id },
        { type: "Customers", id: "LIST" },
      ],
    }),
  }),
})

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomerSegmentsQuery,
  useGetCustomerRegionsQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useUploadCustomerLogoMutation,
  useDeleteCustomerMutation,
} = customersApi
