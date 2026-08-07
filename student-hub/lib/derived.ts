import { compareTimes, getWeekday } from "@/lib/date"
import type { Assignment, CalendarEvent, ScheduleItem } from "@/lib/types"

export type DayAgendaItem = {
  category: string
  color: string
  date: string
  description: string
  endTime: string
  id: string
  source: "assignment" | "event" | "schedule"
  startTime: string
  title: string
}

export function getAgendaForDate({
  assignments,
  date,
  events,
  schedules,
}: {
  assignments: Assignment[]
  date: Date
  events: CalendarEvent[]
  schedules: ScheduleItem[]
}) {
  const dateKey = toLocalDateKey(date)
  const weekday = getWeekday(date)

  const scheduleItems: DayAgendaItem[] = schedules
    .filter((schedule) => schedule.day === weekday)
    .map((schedule) => ({
      category: "Class",
      color: schedule.color,
      date: dateKey,
      description: [schedule.room, schedule.instructor].filter(Boolean).join(" - "),
      endTime: schedule.endTime,
      id: `schedule-${schedule.id}-${dateKey}`,
      source: "schedule",
      startTime: schedule.startTime,
      title: schedule.subject,
    }))

  const assignmentItems: DayAgendaItem[] = assignments
    .filter((assignment) => assignment.dueDate === dateKey)
    .map((assignment) => ({
      category: "Assignment",
      color: assignment.status === "Completed" ? "#10b981" : "#f59e0b",
      date: dateKey,
      description: assignment.subject,
      endTime: "",
      id: `assignment-${assignment.id}`,
      source: "assignment",
      startTime: "",
      title: assignment.title,
    }))

  const eventItems: DayAgendaItem[] = events
    .filter((event) => event.date === dateKey)
    .map((event) => ({
      category: event.category,
      color: event.color,
      date: dateKey,
      description: event.description,
      endTime: event.endTime,
      id: `event-${event.id}`,
      source: "event",
      startTime: event.startTime,
      title: event.title,
    }))

  return [...scheduleItems, ...assignmentItems, ...eventItems].sort((a, b) =>
    compareTimes(a.startTime, b.startTime)
  )
}

export function toLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
