import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

  const rawRoles = userSource.roles ?? userSource.roleNames ?? userSource.permissions ?? [];
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
      id: String(userSource.id ?? userSource.userId ?? ""),
      email: String(userSource.email ?? userSource.userEmail ?? ""),
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ascribable-goatishly-curtis.ngrok-free.dev";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      // Add ngrok bypass header
      headers.set("ngrok-skip-browser-warning", "true");
      return headers;
    },
  }),
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
          if (data.token) {
            const expires = new Date(Date.now() + data.expiresIn * 1000);
            document.cookie = `auth_token=${data.token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
            localStorage.setItem("auth_token", data.token);
          }

          localStorage.setItem("user", JSON.stringify(data.user));
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
          // Clear stored data
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
        } catch {
          // Error handling
        }
      },
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
} = authApi;
