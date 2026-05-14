import { randomUUID } from "node:crypto"

/** Generate a URL-safe random ID */
export function generateId(): string {
  return randomUUID().replace(/-/g, "")
}
