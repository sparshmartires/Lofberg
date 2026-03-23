import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseApi";

export interface RoleOption {
  id: string;
  name: string;
}

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  notes: string | null;
  roleId: string;
  roleName: string;
  isActive: boolean;
  reportsCount: number;
  lastLogin: string | null;
}

export interface GetUsersParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

export interface PaginatedUsersResponse {
  items: UserItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateUserRequest {
  firstName: string;
  lastName?: string | null;
  email: string;
  phoneNumber?: string | null;
  notes?: string | null;
  roleId: string;
}

export interface UpdateUserRequest extends CreateUserRequest {
  isActive: boolean;
  newPassword?: string | null;
}

type ApiObject = Record<string, unknown>;

const asObject = (value: unknown): ApiObject =>
  value && typeof value === "object" ? (value as ApiObject) : {};

const unwrapPayload = (payload: unknown): unknown => {
  let current: unknown = payload;

  for (let depth = 0; depth < 4; depth += 1) {
    const source = asObject(current);
    const candidate = source.data ?? source.result ?? source.payload ?? source.value;

    if (candidate === undefined || candidate === null || candidate === current) {
      return current;
    }

    current = candidate;
  }

  return current;
};

const toArray = (value: unknown): ApiObject[] => {
  const unwrapped = unwrapPayload(value);

  if (Array.isArray(unwrapped)) {
    return unwrapped as ApiObject[];
  }

  if (unwrapped && typeof unwrapped === "object") {
    const source = asObject(unwrapped);
    const candidates = [
      source.items,
      source.data,
      source.results,
      source.users,
      source.value,
      source.records,
      source.rows,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as ApiObject[];
      }

      if (candidate && typeof candidate === "object") {
        const nested = asObject(candidate);
        const nestedCandidates = [
          nested.items,
          nested.data,
          nested.results,
          nested.users,
          nested.value,
          nested.records,
          nested.rows,
        ];

        for (const nestedCandidate of nestedCandidates) {
          if (Array.isArray(nestedCandidate)) {
            return nestedCandidate as ApiObject[];
          }
        }
      }
    }
  }

  return [];
};

const mapUser = (item: ApiObject): UserItem => {
  const role = asObject(item.role);
  const firstName = String(item.firstName ?? item.firstname ?? "");
  const lastName = String(item.lastName ?? item.lastname ?? "");
  const fullName = item.name ?? item.fullName ?? `${firstName} ${lastName}`.trim();

  const [fallbackFirstName, ...rest] = String(fullName || "").split(" ");
  const fallbackLastName = rest.join(" ").trim();

  return {
    id: String(item.id ?? item.userId ?? ""),
    firstName: firstName || fallbackFirstName || "",
    lastName: lastName || fallbackLastName || "",
    email: String(item.email ?? ""),
    phoneNumber: (item.phoneNumber ?? item.phone ?? null) as string | null,
    notes: (item.notes ?? item.comment ?? null) as string | null,
    roleId: String(item.roleId ?? role.id ?? ""),
    roleName: String(item.roleName ?? role.name ?? item.role ?? "-"),
    isActive: Boolean(item.isActive ?? item.active ?? true),
    reportsCount: Number(item.reportsCount ?? item.reports ?? 0),
    lastLogin: (item.lastLogin ?? item.lastLoginAt ?? null) as string | null,
  };
};

const normalizeUsersResponse = (
  payload: unknown,
  pageNumber: number,
  pageSize: number
): PaginatedUsersResponse => {
  const root = asObject(payload);
  const unwrapped = unwrapPayload(payload);
  const source = asObject(unwrapped);
  const meta = asObject(root.meta ?? source.meta);
  const pagination = asObject(root.pagination ?? source.pagination ?? meta.pagination);

  const items = toArray(unwrapped).map(mapUser);

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
  );

  const responsePageNumber = Number(
    source.pageNumber ?? source.page ?? pagination.pageNumber ?? pagination.page ?? pageNumber
  );
  const responsePageSize = Number(
    source.pageSize ?? source.size ?? pagination.pageSize ?? pagination.size ?? pageSize
  );
  const totalPages = Number(
    source.totalPages ??
      source.pageCount ??
      pagination.totalPages ??
      pagination.pageCount ??
      (responsePageSize > 0 ? Math.max(1, Math.ceil(totalCount / responsePageSize)) : 1)
  );

  return {
    items,
    totalCount,
    pageNumber: responsePageNumber,
    pageSize: responsePageSize,
    totalPages,
  };
};

const normalizeRolesResponse = (payload: unknown): RoleOption[] => {
  const sourceItems = toArray(payload);

  return sourceItems
    .map((item) => ({
      id: String(item.id ?? item.roleId ?? ""),
      name: String(item.name ?? item.roleName ?? item.title ?? ""),
    }))
    .filter((role) => Boolean(role.id) && Boolean(role.name));
};

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Users", "Roles"],
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsersResponse, GetUsersParams>({
      query: ({ pageNumber, pageSize, searchTerm, isActive, sortBy, sortDirection }) => ({
        url: "/users",
        params: {
          pageNumber,
          pageSize,
          ...(searchTerm ? { searchTerm } : {}),
          ...(typeof isActive === "boolean" ? { isActive } : {}),
          ...(sortBy ? { sortBy } : {}),
          ...(sortBy ? { sortDirection } : {}),
        },
      }),
      transformResponse: (response: unknown, _meta, args) =>
        normalizeUsersResponse(response, args.pageNumber, args.pageSize),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((user) => ({ type: "Users" as const, id: user.id })),
              { type: "Users" as const, id: "LIST" },
            ]
          : [{ type: "Users" as const, id: "LIST" }],
    }),

    getRoles: builder.query<RoleOption[], void>({
      query: () => ({
        url: "/roles",
      }),
      transformResponse: (response: unknown) => normalizeRolesResponse(response),
      providesTags: [{ type: "Roles", id: "LIST" }],
    }),

    createUser: builder.mutation<unknown, CreateUserRequest>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    updateUser: builder.mutation<unknown, { id: string; body: UpdateUserRequest }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Users", id: arg.id },
        { type: "Users", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetRolesQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;