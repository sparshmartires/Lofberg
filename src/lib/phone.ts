/**
 * Format a phone number for display as +XX XXXXX XXXXX.
 * Does not modify the stored value — display only.
 */
export function formatPhoneDisplay(value: string | null | undefined): string {
  if (!value) return ""
  const digits = value.replace(/\D/g, "")
  if (!digits) return value
  const parts: string[] = []
  if (digits.length > 0) parts.push("+" + digits.slice(0, 2))
  if (digits.length > 2) parts.push(digits.slice(2, 7))
  if (digits.length > 7) parts.push(digits.slice(7, 12))
  return parts.join(" ")
}
