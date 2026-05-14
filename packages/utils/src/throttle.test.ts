import { describe, it, expect, vi, beforeEach } from "vitest"
import { throttle } from "./throttle.js"

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it("limits calls to once per interval", () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledOnce()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
