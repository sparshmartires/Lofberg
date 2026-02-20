import { useAppSelector } from "../hooks"
import type { RootState } from "../index"

/**
 * Custom hook to access authentication state
 * Usage: const { user, isAuthenticated, token } = useAuth()
 */
export const useAuth = () => {
  const user = useAppSelector((state: RootState) => state.auth.user)
  const token = useAppSelector((state: RootState) => state.auth.token)
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated)
  const loading = useAppSelector((state: RootState) => state.auth.loading)
  const error = useAppSelector((state: RootState) => state.auth.error)

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
  };
};
