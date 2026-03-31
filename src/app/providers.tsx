"use client";

import { useEffect, useRef, useCallback } from "react";
import { Provider } from "react-redux";
import { useRouter } from "next/navigation";
import { store } from "@/store";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { initializeAuth, logout } from "@/store/slices/authSlice";
import { useGetMeQuery, useRefreshTokenMutation } from "@/store/services/authApi";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const REFRESH_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const lastActivityRef = useRef<number>(0);

  // Initialize activity timestamp after mount to avoid calling Date.now() during render
  useEffect(() => {
    lastActivityRef.current = Date.now();
  }, []);
  const [refreshToken] = useRefreshTokenMutation();

  // Hydrate auth state from localStorage on first mount
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  // Refresh user data (including roles) from server on app load
  useGetMeQuery(undefined, { skip: !isAuthenticated });

  // Track user activity
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, updateActivity, { passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActivity));
    };
  }, [isAuthenticated, updateActivity]);

  // Periodic check: refresh token if active, logout if idle
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;

      if (idleTime >= INACTIVITY_TIMEOUT) {
        // Inactive for 30+ minutes — log out
        dispatch(logout());
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        router.push("/login");
      } else {
        // User was active — refresh the token to extend the session
        refreshToken().catch(() => {
          // Refresh failed (e.g., token already expired) — log out
          dispatch(logout());
          router.push("/login");
        });
      }
    }, REFRESH_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, dispatch, router, refreshToken]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
