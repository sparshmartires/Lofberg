import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseApi";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    preferredLanguageId: string | null;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  token: string;
  resetToken: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface MeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  preferredLanguageId: string | null;
  phoneNumber: string;
  avatarUrl: string;
  isActive: boolean;
  lastLoginAt: string;
}

export interface UpdateMeRequest {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
}

export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
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

const normalizeLoginResponse = (payload: unknown): LoginResponse => {
  const root = asObject(payload);
  const data = asObject(unwrapPayload(payload));
  const userSource = asObject(
    data.user ?? data.profile ?? data.account ?? root.user ?? root.profile ?? root.account
  );

  const firstName = String(userSource.firstName ?? userSource.firstname ?? "");
  const lastName = String(userSource.lastName ?? userSource.lastname ?? "");
  const fullName = String(userSource.fullName ?? userSource.name ?? "").trim();
  const [fallbackFirstName, ...restNames] = fullName.split(" ");

  // Roles may be at the top level (data.roles) or nested under user (userSource.roles)
  const rawRoles = userSource.roles ?? data.roles ?? userSource.roleNames ?? data.roleNames ?? userSource.permissions ?? [];
  const roles = Array.isArray(rawRoles)
    ? rawRoles.map((role) => String(role)).filter(Boolean)
    : typeof rawRoles === "string"
      ? [rawRoles]
      : [];

  const expiresInValue = Number(
    data.expiresIn ??
      data.expiresInSeconds ??
      data.expiresInSec ??
      root.expiresIn ??
      root.expiresInSeconds ??
      root.expiresInSec
  );

  return {
    token: String(data.token ?? data.accessToken ?? data.jwt ?? root.token ?? root.accessToken ?? ""),
    expiresIn: Number.isFinite(expiresInValue) && expiresInValue > 0 ? expiresInValue : 1800,
    user: {
      id: String(userSource.id ?? userSource.userId ?? data.id ?? ""),
      email: String(userSource.email ?? userSource.userEmail ?? data.email ?? ""),
      firstName: firstName || fallbackFirstName || "",
      lastName: lastName || restNames.join(" ").trim(),
      roles,
      preferredLanguageId:
        (userSource.preferredLanguageId ?? userSource.languageId ?? null) as string | null,
    },
  };
};

const normalizeMessageResponse = (payload: unknown): ForgotPasswordResponse => {
  const root = asObject(payload);
  const data = asObject(unwrapPayload(payload));

  return {
    message: String(
      data.message ??
        data.detail ??
        data.title ??
        root.message ??
        root.detail ??
        root.title ??
        "Request completed successfully."
    ),
  };
};

const normalizeVerifyCodeResponse = (payload: unknown): VerifyCodeResponse => {
  const root = asObject(payload);
  const data = asObject(unwrapPayload(payload));

  return {
    token: String(data.token ?? data.accessToken ?? root.token ?? root.accessToken ?? ""),
    resetToken: String(data.resetToken ?? data.token ?? root.resetToken ?? root.token ?? ""),
  };
};

const normalizeMeResponse = (payload: unknown): MeResponse => {
  const root = asObject(payload);
  const data = asObject(unwrapPayload(payload));
  const userSource = asObject(data.user ?? data.profile ?? data.account ?? data);

  const firstName = String(userSource.firstName ?? userSource.firstname ?? "").trim();
  const lastName = String(userSource.lastName ?? userSource.lastname ?? "").trim();
  const fullNameSource = String(userSource.fullName ?? userSource.name ?? "").trim();
  const [fallbackFirstName, ...restNames] = fullNameSource.split(" ").filter(Boolean);

  const rolesSource = userSource.roles ?? userSource.roleNames ?? userSource.permissions ?? [];
  const roles = Array.isArray(rolesSource)
    ? rolesSource.map((role) => String(role)).filter(Boolean)
    : typeof rolesSource === "string"
      ? [rolesSource]
      : [];

  const normalizedFirstName = firstName || fallbackFirstName || "";
  const normalizedLastName = lastName || restNames.join(" ").trim();

  return {
    id: String(userSource.id ?? userSource.userId ?? root.id ?? ""),
    email: String(userSource.email ?? userSource.userEmail ?? root.email ?? ""),
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    fullName:
      fullNameSource ||
      `${normalizedFirstName} ${normalizedLastName}`.trim() ||
      String(userSource.email ?? root.email ?? ""),
    roles,
    preferredLanguageId:
      (userSource.preferredLanguageId ?? userSource.languageId ?? null) as string | null,
    phoneNumber: String(userSource.phoneNumber ?? userSource.phone ?? root.phoneNumber ?? ""),
    avatarUrl: String(
      userSource.avatarUrl ??
        userSource.profileImageUrl ??
        userSource.imageUrl ??
        userSource.photoUrl ??
        ""
    ),
    isActive: Boolean(userSource.isActive ?? userSource.active ?? true),
    lastLoginAt: String(userSource.lastLoginAt ?? userSource.lastLogin ?? root.lastLoginAt ?? ""),
  };
};

export const authApi = createApi({
  reducerPath: "authApi",
  tagTypes: ["Me"],
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: unknown) => normalizeLoginResponse(response),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Token is now set as an HttpOnly cookie by the backend.
          // Only store user metadata in localStorage for UI hydration.
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch {
          // Error handling is done in the component
        }
      },
    }),

    // Forgot password endpoint
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: unknown) => normalizeMessageResponse(response),
    }),

    // Verify OTP code endpoint
    verifyCode: builder.mutation<VerifyCodeResponse, VerifyCodeRequest>({
      query: (data) => ({
        url: "/auth/verify-code",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: unknown) => normalizeVerifyCodeResponse(response),
    }),

    // Reset password endpoint
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: unknown) => normalizeMessageResponse(response),
    }),

    // Resend OTP code
    resendCode: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: "/auth/resend-code",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: unknown) => normalizeMessageResponse(response),
    }),

    // Logout endpoint
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // HttpOnly cookie is cleared by the backend.
          // Only clear user metadata from localStorage.
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
          }
        } catch {
          // Error handling
        }
      },
    }),

    // Refresh token — extends session for active users
    refreshToken: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),

    getMe: builder.query<MeResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Me"],
      transformResponse: (response: unknown) => normalizeMeResponse(response),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const cachedUser = {
            id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            roles: data.roles,
            preferredLanguageId: data.preferredLanguageId,
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(cachedUser));
          }
        } catch {
          // Error handling is done in the component
        }
      },
    }),

    updateMe: builder.mutation<MeResponse, UpdateMeRequest>({
      query: (body) => ({
        url: "/auth/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Me"],
      transformResponse: (response: unknown) => normalizeMeResponse(response),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const cachedUser = {
            id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            roles: data.roles,
            preferredLanguageId: data.preferredLanguageId,
          };

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(cachedUser));
          }
        } catch {
          // Error handling is done in the component
        }
      },
    }),

    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeMessageResponse(response),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyCodeMutation,
  useResetPasswordMutation,
  useResendCodeMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
} = authApi;
