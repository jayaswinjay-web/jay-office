import { describe, it, expect } from "vitest"
import { validateEmail } from "./validate-email.js"

describe("validateEmail", () => {
  it("returns true for valid email", () => {
    expect(validateEmail("test@example.com")).toBe(true)
  })

  it("returns false for invalid emails", () => {
    expect(validateEmail("test")).toBe(false)
    expect(validateEmail("test@")).toBe(false)
    expect(validateEmail("@example.com")).toBe(false)
  })
})
