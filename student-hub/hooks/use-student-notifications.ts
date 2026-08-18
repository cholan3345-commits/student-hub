"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { defaultPomodoroState } from "@/hooks/use-pomodoro"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  formatDateLabel,
  formatTime,
  getDateKey,
  getWeekday,
  parseDateKey,
} from "@/lib/date"
import {
  STORAGE_KEYS,
  type Assignment,
  type PomodoroState,
  type ScheduleItem,
} from "@/lib/types"

export type StudentNotificationKind = "class" | "deadline" | "overdue" | "timer"

export type StudentNotification = {
  description: string
  href: string
  id: string
  kind: StudentNotificationKind
  read: boolean
  title: string
}

type RankedNotification = Omit<StudentNotification, "read"> & {
  rank: number
  sortAt: number
}

export function useStudentNotifications(
  assignments: Assignment[],
  schedules: ScheduleItem[]
) {
  const [storedReadIds, setReadIds] = useLocalStorage<string[]>(
    STORAGE_KEYS.notificationReadIds,
    []
  )
  const [pomodoroState] = useLocalStorage<PomodoroState>(
    STORAGE_KEYS.pomodoroState,
    defaultPomodoroState
  )
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    const timeout = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 60_000)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  const readIds = useMemo(
    () => (Array.isArray(storedReadIds) ? storedReadIds : []),
    [storedReadIds]
  )
  const notificationData = useMemo<RankedNotification[]>(() => {
    if (!now) {
      return []
    }

    const todayKey = getDateKey(now)
    const todayStart = parseDateKey(todayKey).getTime()
    const notifications: RankedNotification[] = []

    assignments.forEach((assignment) => {
      if (
        assignment.status === "Completed" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(assignment.dueDate)
      ) {
        return
      }

      const dueAt = parseDateKey(assignment.dueDate).getTime()
      const daysUntilDue = Math.round((dueAt - todayStart) / 86_400_000)
      const subject = assignment.subject ? ` - ${assignment.subject}` : ""

      if (daysUntilDue < 0) {
        notifications.push({
          description: `Was due ${formatDateLabel(assignment.dueDate)}${subject}`,
          href: "/assignments",
          id: `assignment-overdue-${assignment.id}-${assignment.dueDate}`,
          kind: "overdue",
          rank: 0,
          sortAt: dueAt,
          title: `${assignment.title} is overdue`,
        })
        return
      }

      if (daysUntilDue <= 3) {
        const dueLabel =
          daysUntilDue === 0
            ? "Due today"
            : daysUntilDue === 1
              ? "Due tomorrow"
              : `Due in ${daysUntilDue} days`

        notifications.push({
          description: `${dueLabel}${subject}`,
          href: "/assignments",
          id: `assignment-due-${assignment.id}-${assignment.dueDate}`,
          kind: "deadline",
          rank: 2,
          sortAt: dueAt,
          title: assignment.title,
        })
      }
    })

    const today = getWeekday(now)

    schedules.forEach((schedule) => {
      if (schedule.day !== today || !/^\d{1,2}:\d{2}$/.test(schedule.startTime)) {
        return
      }

      const [hour, minute] = schedule.startTime.split(":").map(Number)
      const startsAt = new Date(now)
      startsAt.setHours(hour, minute, 0, 0)
      const minutesUntil = Math.ceil((startsAt.getTime() - now.getTime()) / 60_000)

      if (minutesUntil < 0 || minutesUntil > 120) {
        return
      }

      const timing =
        minutesUntil <= 1
          ? "Starting now"
          : `Starts in ${minutesUntil} minutes`
      const location = schedule.room ? ` - ${schedule.room}` : ""

      notifications.push({
        description: `${timing} at ${formatTime(schedule.startTime)}${location}`,
        href: "/schedule",
        id: `class-${todayKey}-${schedule.id}-${schedule.startTime}`,
        kind: "class",
        rank: 1,
        sortAt: startsAt.getTime(),
        title: schedule.subject,
      })
    })

    if (pomodoroState.sessionCount > 0) {
      const count = pomodoroState.sessionCount

      notifications.push({
        description: `${count} focus ${count === 1 ? "session" : "sessions"} completed.`,
        href: "/study-timer",
        id: `pomodoro-sessions-${count}`,
        kind: "timer",
        rank: 3,
        sortAt: Number.MAX_SAFE_INTEGER,
        title: "Focus progress updated",
      })
    }

    return notifications
      .sort((a, b) => a.rank - b.rank || a.sortAt - b.sortAt)
      .slice(0, 24)
  }, [assignments, now, pomodoroState.sessionCount, schedules])

  const notifications = useMemo<StudentNotification[]>(
    () =>
      notificationData.map((notification) => ({
        description: notification.description,
        href: notification.href,
        id: notification.id,
        kind: notification.kind,
        read: readIds.includes(notification.id),
        title: notification.title,
      })),
    [notificationData, readIds]
  )
  const unreadCount = notifications.filter((notification) => !notification.read).length

  const markRead = useCallback(
    (notificationId: string) => {
      setReadIds((current) => {
        const currentIds = Array.isArray(current) ? current : []

        return currentIds.includes(notificationId)
          ? currentIds
          : [...currentIds, notificationId]
      })
    },
    [setReadIds]
  )

  const markAllRead = useCallback(() => {
    const notificationIds = notificationData.map((notification) => notification.id)

    setReadIds((current) => {
      const currentIds = Array.isArray(current) ? current : []

      return Array.from(new Set([...currentIds, ...notificationIds]))
    })
  }, [notificationData, setReadIds])

  return {
    markAllRead,
    markRead,
    notifications,
    unreadCount,
  }
}
