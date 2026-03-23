import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi, LoginResponse, MeResponse } from "../services/authApi";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  preferredLanguageId: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type RejectedAction = {
  payload?: {
    status?: number;
  };
  error?: {
    status?: number;
    message?: string;
  };
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    initializeAuth: (state) => {
      // Initialize from localStorage and cookies on app load
      if (typeof window !== "undefined") {
        // Check for auth token in cookies
        const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
          const [key, value] = cookie.split("=");
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        const token = cookies["auth_token"];
        const userStr = localStorage.getItem("user");
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;
          } catch {
            // Invalid stored data
            localStorage.removeItem("user");
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addMatcher(
        authApi.endpoints.login.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = (action as unknown as RejectedAction).error?.message || "Login failed";
          state.isAuthenticated = false;
        }
      )
      // Logout cases
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action: PayloadAction<MeResponse>) => {
        state.user = {
          id: action.payload.id,
          email: action.payload.email,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          roles: action.payload.roles,
          preferredLanguageId: action.payload.preferredLanguageId,
        };
        state.isAuthenticated = true;
      })
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state, action) => {
        const rejected = action as unknown as RejectedAction;
        const status = rejected?.payload?.status ?? rejected?.error?.status;
        if (status === 401 || status === 403) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      });
  },
});

export const {
  setUser,
  setToken,
  logout,
  clearError,
  setError,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;
