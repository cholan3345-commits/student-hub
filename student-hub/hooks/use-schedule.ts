"use client"

import { createId } from "@/lib/storage"
import { STORAGE_KEYS, type ScheduleItem } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type ScheduleInput = Omit<ScheduleItem, "createdAt" | "id" | "updatedAt">

export function useSchedule() {
  const [schedules, setSchedules, clearSchedules, isReady] = useLocalStorage<
    ScheduleItem[]
  >(STORAGE_KEYS.schedule, [])

  function addSchedule(input: ScheduleInput) {
    const now = new Date().toISOString()
    const item: ScheduleItem = {
      ...input,
      createdAt: now,
      id: createId(),
      updatedAt: now,
    }

    setSchedules((current) => [...current, item])
    return item
  }

  function updateSchedule(id: string, updates: Partial<ScheduleInput>) {
    setSchedules((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    )
  }

  function deleteSchedule(id: string) {
    setSchedules((current) => current.filter((item) => item.id !== id))
  }

  function duplicateSchedule(id: string) {
    const source = schedules.find((item) => item.id === id)

    if (!source) {
      return null
    }

    return addSchedule({
      color: source.color,
      day: source.day,
      endTime: source.endTime,
      instructor: source.instructor,
      notes: source.notes,
      room: source.room,
      startTime: source.startTime,
      subject: `${source.subject} Copy`,
    })
  }

  return {
    addSchedule,
    clearSchedules,
    deleteSchedule,
    duplicateSchedule,
    isReady,
    schedules,
    updateSchedule,
  }
}

