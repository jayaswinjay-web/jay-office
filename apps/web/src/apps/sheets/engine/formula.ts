type Value = string | number | boolean | null

function coerceToString(v: Value): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function coerceToNumber(v: Value): number {
  if (typeof v === 'number') return v
  if (v === null || v === undefined || v === '') return 0
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

function coerceToDate(v: Value): Date {
  if (typeof v === 'object' && v !== null && (v as unknown) instanceof Date) return v as unknown as Date
  if (typeof v === 'number') return new Date(v)
  return new Date(String(v))
}

const FUNCTIONS: Record<string, (...args: Value[]) => Value> = {
  SUM: (...args) => args.reduce((a: number, b: Value) => a + coerceToNumber(b), 0),
  AVERAGE: (...args) =>
    args.reduce((a: number, b: Value) => a + coerceToNumber(b), 0) / args.length,
  COUNT: (...args) => args.filter((v) => v !== null && v !== '').length,
  COUNTA: (...args) => args.filter((v) => v !== null && v !== '').length,
  COUNTBLANK: (...args) => args.filter((v) => v === null || v === '').length,
  COUNTIF: () => 0,
  SUMIF: () => 0,
  MAX: (...args) => Math.max(...args.map(coerceToNumber)),
  MIN: (...args) => Math.min(...args.map(coerceToNumber)),
  MEDIAN: (...args) => {
    const s = args.map(coerceToNumber).sort((a, b) => a - b)
    const m = Math.floor(s.length / 2)
    return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
  },
  STDEV: (...args) => {
    const nums = args.map(coerceToNumber)
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length
    return Math.sqrt(nums.reduce((a, b) => a + (b - mean) ** 2, 0) / (nums.length - 1))
  },
  VAR: (...args) => {
    const nums = args.map(coerceToNumber)
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length
    return nums.reduce((a, b) => a + (b - mean) ** 2, 0) / (nums.length - 1)
  },
  LARGE: (...args) => {
    const nums = args
      .slice(1)
      .map(coerceToNumber)
      .sort((a, b) => b - a)
    const k = coerceToNumber(args[0]!) - 1
    return nums[k] ?? 0
  },
  SMALL: (...args) => {
    const nums = args
      .slice(1)
      .map(coerceToNumber)
      .sort((a, b) => a - b)
    const k = coerceToNumber(args[0]!) - 1
    return nums[k] ?? 0
  },
  RANK: (...args) => {
    const val = coerceToNumber(args[0]!)
    const nums = args.slice(1).map(coerceToNumber)
    return nums.filter((n) => n > val).length + 1
  },
  PERCENTILE: (...args) => {
    const k = coerceToNumber(args[0]!)
    const nums = args
      .slice(1)
      .map(coerceToNumber)
      .sort((a, b) => a - b)
    const pos = k * (nums.length - 1)
    const i = Math.floor(pos)
    return (nums[i] ?? 0) + ((nums[i + 1] ?? 0) - (nums[i] ?? 0)) * (pos - i)
  },
  QUARTILE: (...args) => {
    const k = coerceToNumber(args[0]!)
    const nums = args
      .slice(1)
      .map(coerceToNumber)
      .sort((a, b) => a - b)
    const q = [0, 0.25, 0.5, 0.75, 1][k] ?? 0
    const pos = q * (nums.length - 1)
    const i = Math.floor(pos)
    return (nums[i] ?? 0) + ((nums[i + 1] ?? 0) - (nums[i] ?? 0)) * (pos - i)
  },
  AVERAGEIF: () => 0,
  SUMPRODUCT: (...args) => {
    const arrays = args.map((a) => (Array.isArray(a) ? a.map(coerceToNumber) : [coerceToNumber(a)]))
    const len = Math.min(...arrays.map((a) => a.length))
    let sum = 0
    for (let i = 0; i < len; i++) {
      let prod = 1
      for (const arr of arrays) prod *= arr[i]!
      sum += prod
    }
    return sum
  },
  PRODUCT: (...args) => args.map(coerceToNumber).reduce((a, b) => a * b, 1),
  ABS: (v) => Math.abs(coerceToNumber(v)),
  ROUND: (v, d) => {
    const f = Math.pow(10, coerceToNumber(d ?? 0))
    return Math.round(coerceToNumber(v) * f) / f
  },
  CEILING: (v) => Math.ceil(coerceToNumber(v)),
  FLOOR: (v) => Math.floor(coerceToNumber(v)),
  INT: (v) => Math.floor(coerceToNumber(v)),
  TRUNC: (v) => Math.trunc(coerceToNumber(v)),
  MOD: (a, b) => coerceToNumber(a) % coerceToNumber(b),
  POWER: (base, exp) => Math.pow(coerceToNumber(base), coerceToNumber(exp)),
  SQRT: (v) => Math.sqrt(coerceToNumber(v)),
  EXP: (v) => Math.exp(coerceToNumber(v)),
  LN: (v) => Math.log(coerceToNumber(v)),
  LOG: (v) => Math.log10(coerceToNumber(v)),
  LOG10: (v) => Math.log10(coerceToNumber(v)),
  FACT: (v) => {
    let n = Math.floor(Math.abs(coerceToNumber(v)))
    let r = 1
    while (n > 1) r *= n--
    return r
  },
  GCD: (...args) => {
    const nums = args.map((v) => Math.abs(coerceToNumber(v)) | 0)
    const gcd2 = (a: number, b: number): number => (b === 0 ? a : gcd2(b, a % b))
    return nums.reduce((a, b) => gcd2(a, b), nums[0]!)
  },
  LCM: (...args) => {
    const nums = args.map((v) => Math.abs(coerceToNumber(v)) | 0)
    const gcd2 = (a: number, b: number): number => (b === 0 ? a : gcd2(b, a % b))
    return nums.reduce((a, b) => (a * b) / gcd2(a, b), nums[0]!)
  },
  DEGREES: (v) => coerceToNumber(v) * (180 / Math.PI),
  RADIANS: (v) => coerceToNumber(v) * (Math.PI / 180),
  COS: (v) => Math.cos(coerceToNumber(v)),
  SIN: (v) => Math.sin(coerceToNumber(v)),
  TAN: (v) => Math.tan(coerceToNumber(v)),
  SIGN: (v) => {
    const n = coerceToNumber(v)
    return n > 0 ? 1 : n < 0 ? -1 : 0
  },
  PI: () => Math.PI,
  RAND: () => Math.random(),
  RANDBETWEEN: (min, max) => {
    const mn = coerceToNumber(min)
    const mx = coerceToNumber(max)
    return Math.floor(Math.random() * (mx - mn + 1)) + mn
  },
  NPV: (...args) => {
    const rate = coerceToNumber(args[0]!)
    const values = args.slice(1).map(coerceToNumber)
    return values.reduce((sum, v, i) => sum + v / Math.pow(1 + rate, i + 1), 0)
  },
  IRR: () => 0,
  FV: (rate, nper, pmt) => {
    const r = coerceToNumber(rate)
    const n = coerceToNumber(nper)
    const p = coerceToNumber(pmt)
    return p * ((Math.pow(1 + r, n) - 1) / r)
  },
  PV: (rate, nper, pmt) => {
    const r = coerceToNumber(rate)
    const n = coerceToNumber(nper)
    const p = coerceToNumber(pmt)
    return p * ((1 - Math.pow(1 + r, -n)) / r)
  },
  PMT: (rate, nper, pv) => {
    const r = coerceToNumber(rate)
    const n = coerceToNumber(nper)
    const p = coerceToNumber(pv)
    return (p * r) / (1 - Math.pow(1 + r, -n))
  },
  RATE: () => 0,
  NPER: (rate, pmt, pv) => {
    const r = coerceToNumber(rate)
    const p = coerceToNumber(pmt)
    const v = coerceToNumber(pv)
    return -Math.log(1 - (v * r) / p) / Math.log(1 + r)
  },
  IF: (cond, trueVal, falseVal) => (cond ? trueVal : falseVal),
  AND: (...args) => (args.map(coerceToNumber).every(Boolean) ? 1 : 0),
  OR: (...args) => (args.map(coerceToNumber).some(Boolean) ? 1 : 0),
  NOT: (v) => (!coerceToNumber(v) ? 1 : 0),
  TRUE: () => 1,
  FALSE: () => 0,
  ISBLANK: (v) => (v === '' || v === null ? 1 : 0),
  ISNUMBER: (v) => (typeof v === 'number' ? 1 : 0),
  ISTEXT: (v) => (typeof v === 'string' ? 1 : 0),
  EXACT: (a, b) => (coerceToString(a) === coerceToString(b) ? 1 : 0),
  CONCATENATE: (...args) => args.map(coerceToString).join(''),
  CONCAT: (...args) => args.map(coerceToString).join(''),
  TEXT: (v, format) => {
    const val = coerceToNumber(v)
    const fmt = coerceToString(format)
    if (fmt.includes('0') || fmt.includes('#')) {
      const decimals = (fmt.split('.')[1]?.match(/0/g) || []).length
      return val.toFixed(decimals)
    }
    return String(val)
  },
  VALUE: (v) => {
    const s = coerceToString(v)
    const n = Number(s)
    return isNaN(n) ? 0 : n
  },
  SUBSTITUTE: (text, oldText, newText, instance) => {
    const t = coerceToString(text)
    const o = coerceToString(oldText)
    const n = coerceToString(newText)
    const i = instance !== undefined ? coerceToNumber(instance) | 0 : 0
    if (i <= 0) return t.replaceAll(o, n)
    let count = 0
    return t.replace(o, (match) => (++count === i ? n : match))
  },
  FIND: (findText, withinText, start) => {
    const f = coerceToString(findText)
    const w = coerceToString(withinText)
    const s = coerceToNumber(start) - 1 || 0
    const pos = w.indexOf(f, s)
    return pos >= 0 ? pos + 1 : '#VALUE'
  },
  SEARCH: (findText, withinText, start) => {
    const f = coerceToString(findText).toLowerCase()
    const w = coerceToString(withinText).toLowerCase()
    const s = coerceToNumber(start) - 1 || 0
    const pos = w.indexOf(f, s)
    return pos >= 0 ? pos + 1 : '#VALUE'
  },
  MID: (text, start, count) => {
    const t = coerceToString(text)
    const s = (coerceToNumber(start) | 0) - 1
    const c = coerceToNumber(count) | 0
    return t.slice(s, s + c)
  },
  REPLACE: (oldText, start, count, newText) => {
    const t = coerceToString(oldText)
    const s = (coerceToNumber(start) | 0) - 1
    const c = coerceToNumber(count) | 0
    const n = coerceToString(newText)
    return t.slice(0, s) + n + t.slice(s + c)
  },
  REPT: (text, count) => {
    const t = coerceToString(text)
    const n = coerceToNumber(count) | 0
    return t.repeat(Math.max(0, n))
  },
  PROPER: (text) => {
    return coerceToString(text).replace(/\b\w/g, (c) => c.toUpperCase())
  },
  CHAR: (code) => String.fromCharCode(coerceToNumber(code) | 0),
  CODE: (text) => {
    const t = coerceToString(text)
    return t.length > 0 ? t.charCodeAt(0) : 0
  },
  LEFT: (s, n) => coerceToString(s).slice(0, n === null || n === undefined || typeof n !== 'number' ? 1 : n),
  RIGHT: (s, n) => coerceToString(s).slice(-(n === null || n === undefined || typeof n !== 'number' ? 1 : n)),
  LEN: (s) => coerceToString(s).length,
  UPPER: (s) => coerceToString(s).toUpperCase(),
  LOWER: (s) => coerceToString(s).toLowerCase(),
  TRIM: (s) => coerceToString(s).replace(/\s+/g, ' ').trim(),
  TODAY: () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  },
  NOW: () => Date.now(),
  DATE: (year, month, day) => {
    const y = coerceToNumber(year) | 0
    const m = (coerceToNumber(month) | 0) - 1
    const d = coerceToNumber(day) | 0
    return new Date(y, m, d).getTime()
  },
  TIME: (hour, minute, second) => {
    const h = coerceToNumber(hour) | 0
    const m = coerceToNumber(minute) | 0
    const s = coerceToNumber(second) | 0
    return (h * 3600 + m * 60 + s) / 86400
  },
  YEAR: (d) => coerceToDate(d).getFullYear(),
  MONTH: (d) => coerceToDate(d).getMonth() + 1,
  DAY: (d) => coerceToDate(d).getDate(),
  HOUR: (t) => {
    const d = coerceToDate(t)
    return d.getHours()
  },
  MINUTE: (t) => {
    const d = coerceToDate(t)
    return d.getMinutes()
  },
  SECOND: (t) => {
    const d = coerceToDate(t)
    return d.getSeconds()
  },
  WEEKDAY: (d, type) => {
    const date = coerceToDate(d)
    const t = coerceToNumber(type) | 0
    const day = date.getDay()
    if (t === 2) return day === 0 ? 7 : day
    if (t === 3) return day === 0 ? 6 : day - 1
    return day === 0 ? 1 : day + 1
  },
  WEEKNUM: (d) => {
    const date = coerceToDate(d)
    const start = new Date(date.getFullYear(), 0, 1)
    const diff = date.getTime() - start.getTime()
    return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
  },
  EDATE: (start, months) => {
    const d = coerceToDate(start)
    const m = coerceToNumber(months) | 0
    return new Date(d.getFullYear(), d.getMonth() + m, d.getDate()).getTime()
  },
  EOMONTH: (start, months) => {
    const d = coerceToDate(start)
    const m = coerceToNumber(months) | 0
    return new Date(d.getFullYear(), d.getMonth() + m + 1, 0).getTime()
  },
  DATEDIF: (start, end, unit) => {
    const s = coerceToDate(start)
    const e = coerceToDate(end)
    const u = coerceToString(unit).toUpperCase()
    const diffMs = e.getTime() - s.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (u === 'D') return diffDays
    if (u === 'M') return (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth()
    if (u === 'Y') return e.getFullYear() - s.getFullYear()
    return diffDays
  },
  NETWORKDAYS: (start, end) => {
    const s = coerceToDate(start)
    const e = coerceToDate(end)
    let count = 0
    const cur = new Date(s)
    while (cur <= e) {
      const day = cur.getDay()
      if (day !== 0 && day !== 6) count++
      cur.setDate(cur.getDate() + 1)
    }
    return count
  },
  WORKDAY: (start, days) => {
    const d = coerceToDate(start)
    let remaining = coerceToNumber(days) | 0
    const cur = new Date(d)
    while (remaining !== 0) {
      cur.setDate(cur.getDate() + (remaining > 0 ? 1 : -1))
      const day = cur.getDay()
      if (day !== 0 && day !== 6) remaining += remaining > 0 ? -1 : 1
    }
    return cur.getTime()
  },
  VLOOKUP: () => 0,
  HLOOKUP: () => 0,
  INDEX: () => 0,
  MATCH: () => 0,
  XLOOKUP: () => 0,
  FILTER: () => 0,
  SORT: () => 0,
  UNIQUE: () => 0,
}

export function parseCellRef(ref: string): { col: number; row: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/)
  if (!match) return null
  const colStr = match[1]!
  let col = 0
  for (const char of colStr) {
    col = col * 26 + (char.charCodeAt(0) - 64)
  }
  return { col: col - 1, row: parseInt(match[2]!) - 1 }
}

export function evaluateFormula(
  formula: string,
  getCellValue: (col: number, row: number) => unknown,
): string | number {
  if (!formula.startsWith('=')) return formula
  const expr = formula.slice(1).trim()
  try {
    const result = evalExpression(expr, getCellValue)
    return typeof result === 'number'
      ? Number.isInteger(result)
        ? result
        : parseFloat(result.toFixed(10))
      : String(result)
  } catch {
    return '#ERROR'
  }
}

function evalExpression(
  expr: string,
  getCellValue: (col: number, row: number) => unknown,
): unknown {
  let parsed = expr.replace(/([A-Z]+)(\d+)/g, (_, col, row) => {
    const ref = parseCellRef(`${col}${row}`)
    if (!ref) return '0'
    const val = getCellValue(ref.col, ref.row)
    return typeof val === 'number' ? String(val) : `"${val}"`
  })
  for (const [name, fn] of Object.entries(FUNCTIONS)) {
    const regex = new RegExp(`${name}\\(([^)]+)\\)`, 'g')
    parsed = parsed.replace(regex, (_, args) => {
      const evaluated = args.split(',').map((a: string) => {
        const trimmed = a.trim()
        const num = Number(trimmed)
        return isNaN(num) ? trimmed : num
      })
      return String(fn(...evaluated))
    })
  }
  try {
    return Function(`"use strict"; return (${parsed})`)()
  } catch {
    return parsed
  }
}
