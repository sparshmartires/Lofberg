/** Format number per EU conventions (dot thousands separator, comma decimal) */
export function formatEuNumber(value: number | null | undefined, decimals = 0): string {
  if (value == null || isNaN(value)) return "\u2014"
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Compact format: 1.234 → "1,2k", 12.345 → "12,3k", 123.456 → "123k" */
export function formatEuCompact(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "\u2014"
  if (Math.abs(value) >= 1000) {
    const k = value / 1000
    return k >= 100
      ? `${Math.round(k).toLocaleString("de-DE")}k`
      : `${k.toLocaleString("de-DE", { maximumFractionDigits: 1 })}k`
  }
  return value.toLocaleString("de-DE", { maximumFractionDigits: 1 })
}
