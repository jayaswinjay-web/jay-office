import { describe, it, expect } from "vitest"
import { formatFileSize } from "./format-file-size.js"

describe("formatFileSize", () => {
  it("formats 0 bytes as '0 B'", () => {
    expect(formatFileSize(0)).toBe("0 B")
  })

  it("formats 1024 bytes as '1 KB'", () => {
    expect(formatFileSize(1024)).toBe("1 KB")
  })

  it("formats 1048576 bytes as '1 MB'", () => {
    expect(formatFileSize(1048576)).toBe("1 MB")
  })

  it("formats 1073741824 bytes as '1 GB'", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB")
  })
})
