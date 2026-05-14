import { describe, it, expect } from "vitest"
import { slugify } from "./slugify.js"

describe("slugify", () => {
  it("converts 'Hello World' to 'hello-world'", () => {
    expect(slugify("Hello World")).toBe("hello-world")
  })

  it("handles special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world")
    expect(slugify("What's Up?")).toBe("whats-up")
  })

  it("handles multiple spaces and underscores", () => {
    expect(slugify("Hello    World")).toBe("hello-world")
    expect(slugify("Hello__World")).toBe("hello-world")
  })

  it("trims whitespace", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world")
  })
})
