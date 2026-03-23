import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const FALLBACK_API_BASE_URL = "http://localhost:5215";

const normalizeApiBaseUrl = (value: string | undefined): string => {
  const raw = (value || "").trim();
  const candidate = raw || FALLBACK_API_BASE_URL;

  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate.replace(/\/+$/, "");
  }

  return `https://${candidate.replace(/^\/+/, "").replace(/\/+$/, "")}`;
};

export const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

/**
 * Shared base query factory for all RTK Query API services.
 * Uses `credentials: "include"` so the browser sends the HttpOnly auth_token
 * cookie automatically. No manual token handling is needed.
 */
export const createBaseQuery = () =>
  fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      // Add ngrok bypass header for development tunneling
      headers.set("ngrok-skip-browser-warning", "true");
      return headers;
    },
  });
