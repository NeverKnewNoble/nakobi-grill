/**
 * Extracts up to two initials from a full name.
 * e.g. "Larry Noble" → "LN", "Ama" → "A"
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

/**
 * Returns true if the string is a valid email address.
 */
export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email)
}
