import { useEffect, useCallback } from "react"

/**
 * Auto-dismiss a value after `ms` milliseconds or on any click outside.
 * Useful for error messages and toasts.
 */
export function useAutoDismiss(
  value: string | null | undefined,
  clear: () => void,
  ms = 10000
) {
  const stableClear = useCallback(clear, [clear])

  useEffect(() => {
    if (!value) return

    const timer = setTimeout(stableClear, ms)

    // Dismiss on next click anywhere
    const handleClick = () => stableClear()
    // Use setTimeout to avoid immediately dismissing from the same click that caused the error
    const clickTimer = setTimeout(() => {
      document.addEventListener("click", handleClick, { once: true })
    }, 100)

    return () => {
      clearTimeout(timer)
      clearTimeout(clickTimer)
      document.removeEventListener("click", handleClick)
    }
  }, [value, stableClear, ms])
}
