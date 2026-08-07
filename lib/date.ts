import { WEEKDAYS, type Weekday } from "@/lib/types"

export function getDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function getWeekday(date = new Date()): Weekday {
  return WEEKDAYS[date.getDay()]
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function startOfWeek(date: Date) {
  const next = new Date(date)
  const diff = (next.getDay() + 6) % 7
  next.setDate(next.getDate() - diff)
  next.setHours(0, 0, 0, 0)
  return next
}

export function getMonthDays(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const start = startOfWeek(first)

  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}

export function formatDateLabel(dateKey: string, options?: Intl.DateTimeFormatOptions) {
  return parseDateKey(dateKey).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  })
}

export function formatTime(time: string) {
  if (!time) {
    return "Any time"
  }

  const [hour, minute] = time.split(":").map(Number)
  const date = new Date()
  date.setHours(hour, minute, 0, 0)

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function compareDateKeys(a: string, b: string) {
  return parseDateKey(a).getTime() - parseDateKey(b).getTime()
}

export function compareTimes(a: string, b: string) {
  return a.localeCompare(b)
}

export function isPastDate(dateKey: string) {
  return compareDateKeys(dateKey, getDateKey()) < 0
}

export function isWithinNextDays(dateKey: string, days: number) {
  const today = parseDateKey(getDateKey()).getTime()
  const target = parseDateKey(dateKey).getTime()
  const diff = Math.ceil((target - today) / 86400000)

  return diff >= 0 && diff <= days
}

export function getCurrentMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
}
