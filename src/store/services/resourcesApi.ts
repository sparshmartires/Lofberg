import { createApi } from "@reduxjs/toolkit/query/react"
import { createBaseQuery } from "./baseApi"

export interface ResourceDto {
  id: string
  title: string
  description?: string
  resourceType: number // 1=DocumentUpload, 2=ExternalLink
  externalUrl?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
  createdBy?: string
  createdByName?: string
  updatedAt?: string
  updatedBy?: string
  updatedByName?: string
}

interface PaginatedResourcesResponse {
  items: ResourceDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

interface GetResourcesParams {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  sortBy?: string
  sortDirection?: string
}

const unwrapData = (response: unknown): unknown => {
  if (response && typeof response === "object" && "data" in response) {
    return (response as Record<string, unknown>).data
  }
  return response
}

export const resourcesApi = createApi({
  reducerPath: "resourcesApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Resources"],
  endpoints: (builder) => ({
    getResources: builder.query<PaginatedResourcesResponse, GetResourcesParams>({
      query: ({ pageNumber, pageSize, searchTerm, sortBy, sortDirection }) => {
        const params = new URLSearchParams({
          pageNumber: String(pageNumber),
          pageSize: String(pageSize),
        })
        if (searchTerm) params.set("searchTerm", searchTerm)
        if (sortBy) params.set("sortBy", sortBy)
        if (sortDirection) params.set("sortDirection", sortDirection)
        return `/resources?${params.toString()}`
      },
      transformResponse: (response: unknown) =>
        unwrapData(response) as PaginatedResourcesResponse,
      providesTags: [{ type: "Resources", id: "LIST" }],
    }),

    getResource: builder.query<ResourceDto, string>({
      query: (id) => `/resources/${id}`,
      transformResponse: (response: unknown) =>
        unwrapData(response) as ResourceDto,
      providesTags: (_result, _error, id) => [{ type: "Resources", id }],
    }),

    createResource: builder.mutation<ResourceDto, FormData>({
      query: (formData) => ({
        url: "/resources",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: unknown) =>
        unwrapData(response) as ResourceDto,
      invalidatesTags: [{ type: "Resources", id: "LIST" }],
    }),

    updateResource: builder.mutation<ResourceDto, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/resources/${id}`,
        method: "PUT",
        body: formData,
      }),
      transformResponse: (response: unknown) =>
        unwrapData(response) as ResourceDto,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Resources", id: "LIST" },
        { type: "Resources", id },
      ],
    }),

    deleteResource: builder.mutation<void, string>({
      query: (id) => ({
        url: `/resources/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Resources", id: "LIST" }],
    }),
  }),
})

export const {
  useGetResourcesQuery,
  useGetResourceQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} = resourcesApi
