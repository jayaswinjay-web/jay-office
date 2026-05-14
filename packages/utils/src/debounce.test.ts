import { describe, it, expect, vi, beforeEach } from "vitest"
import { debounce } from "./debounce.js"

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it("delays execution", () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
  })

  it("only calls once after multiple rapid calls", () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced()
    debounced()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
  })
})
