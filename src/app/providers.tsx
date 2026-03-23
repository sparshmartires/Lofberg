"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { initializeAuth } from "@/store/slices/authSlice";
import { useGetMeQuery } from "@/store/services/authApi";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Hydrate auth state from localStorage on first mount
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  // Refresh user data (including roles) from server on app load
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  useGetMeQuery(undefined, { skip: !isAuthenticated });

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
