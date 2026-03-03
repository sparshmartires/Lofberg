import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ascribable-goatishly-curtis.ngrok-free.dev";

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

const toArray = (value: unknown): ApiObject[] => {
  if (Array.isArray(value)) {
    return value as ApiObject[];
  }

  if (value && typeof value === "object") {
    const source = asObject(value);
    const candidates = [source.items, source.data, source.results, source.users, source.value];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as ApiObject[];
      }
    }
  }

  return [];
};

const mapUser = (item: ApiObject): UserItem => {
  const role = asObject(item.role);
  const firstName = item.firstName ?? item.firstname ?? "";
  const lastName = item.lastName ?? item.lastname ?? "";
  const fullName = item.name ?? item.fullName ?? `${firstName} ${lastName}`.trim();

  const [fallbackFirstName, ...rest] = String(fullName || "").split(" ");
  const fallbackLastName = rest.join(" ").trim();

  return {
    id: String(item.id ?? item.userId ?? ""),
    firstName: firstName || fallbackFirstName || "",
    lastName: lastName || fallbackLastName || "",
    email: String(item.email ?? ""),
    phoneNumber: item.phoneNumber ?? item.phone ?? null,
    notes: item.notes ?? item.comment ?? null,
    roleId: String(item.roleId ?? role.id ?? ""),
    roleName: String(item.roleName ?? role.name ?? item.role ?? "-"),
    isActive: Boolean(item.isActive ?? item.active ?? true),
    reportsCount: Number(item.reportsCount ?? item.reports ?? 0),
    lastLogin: item.lastLogin ?? item.lastLoginAt ?? null,
  };
};

const normalizeUsersResponse = (
  payload: unknown,
  pageNumber: number,
  pageSize: number
): PaginatedUsersResponse => {
  const source = asObject(payload);
  const items = toArray(payload).map(mapUser);

  const totalCount = Number(
    source.totalCount ?? source.totalItems ?? source.count ?? source.total ?? items.length
  );

  const responsePageNumber = Number(source.pageNumber ?? source.page ?? pageNumber);
  const responsePageSize = Number(source.pageSize ?? source.size ?? pageSize);
  const totalPages = Number(
    source.totalPages ??
      source.pageCount ??
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
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const tokenFromStorage =
        typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const tokenFromCookie =
        typeof document !== "undefined"
          ? document.cookie
              .split("; ")
              .find((entry) => entry.startsWith("auth_token="))
              ?.split("=")[1] ?? null
          : null;

      const token = tokenFromStorage || tokenFromCookie;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      headers.set("ngrok-skip-browser-warning", "true");
      return headers;
    },
  }),
  tagTypes: ["Users", "Roles"],
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsersResponse, GetUsersParams>({
      query: ({ pageNumber, pageSize, searchTerm, isActive }) => ({
        url: "/users",
        params: {
          pageNumber,
          pageSize,
          ...(searchTerm ? { searchTerm } : {}),
          ...(typeof isActive === "boolean" ? { isActive } : {}),
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