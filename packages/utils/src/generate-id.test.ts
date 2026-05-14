import { describe, it, expect } from "vitest"
import { generateId } from "./generate-id.js"

describe("generateId", () => {
  it("returns a 32-character hex string", () => {
    const id = generateId()
    expect(id).toHaveLength(32)
    expect(/^[0-9a-f]{32}$/.test(id)).toBe(true)
  })

  it("returns unique values on each call", () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })
})
