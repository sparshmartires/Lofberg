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
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Set token in secure httpOnly cookie
          const expiresIn = data.expiresIn || 1800; // 30 minutes default
          const expires = new Date(Date.now() + expiresIn * 1000);
          document.cookie = `auth_token=${data.token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
          // Store user data in localStorage for Redux state
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
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
    }),

    // Verify OTP code endpoint
    verifyCode: builder.mutation<VerifyCodeResponse, VerifyCodeRequest>({
      query: (data) => ({
        url: "/auth/verify-code",
        method: "POST",
        body: data,
      }),
    }),

    // Reset password endpoint
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    // Resend OTP code
    resendCode: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: "/auth/resend-code",
        method: "POST",
        body: data,
      }),
    }),

    // Logout endpoint
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Clear stored data
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
        } catch (err) {
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
