/** Create a throttled function that invokes at most once per `wait` ms */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    const now = Date.now()
    const remaining = wait - (now - lastCall)

    if (remaining <= 0) {
      if (timeout !== null) {
        clearTimeout(timeout)
        timeout = null
      }
      lastCall = now
      fn(...args)
    } else if (timeout === null) {
      timeout = setTimeout(() => {
        lastCall = Date.now()
        timeout = null
        fn(...args)
      }, remaining)
    }
  }
}
