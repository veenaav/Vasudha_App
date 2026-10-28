export { cn } from "cn"

/**
 * Safe, cross-context unique ID generator.
 * Works seamlessly in non-secure HTTP / local IP preview contexts where crypto.randomUUID() is unavailable.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`
}
