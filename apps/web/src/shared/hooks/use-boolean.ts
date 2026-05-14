import { useState, useCallback } from "react"

export function useBoolean(initial = false): [boolean, { setTrue: () => void; setFalse: () => void; toggle: () => void; set: (v: boolean) => void }] {
  const [value, setValue] = useState(initial)

  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  const toggle = useCallback(() => setValue((prev) => !prev), [])
  const set = useCallback((v: boolean) => setValue(v), [])

  return [value, { setTrue, setFalse, toggle, set }]
}
