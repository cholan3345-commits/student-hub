"use client"

import { createId } from "@/lib/storage"
import { STORAGE_KEYS, type CalendarEvent } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type CalendarEventInput = Omit<
  CalendarEvent,
  "createdAt" | "id" | "updatedAt"
>

export function useCalendarEvents() {
  const [events, setEvents, clearEvents, isReady] = useLocalStorage<
    CalendarEvent[]
  >(STORAGE_KEYS.calendarEvents, [])

  function addEvent(input: CalendarEventInput) {
    const now = new Date().toISOString()
    const event: CalendarEvent = {
      ...input,
      createdAt: now,
      id: createId(),
      updatedAt: now,
    }

    setEvents((current) => [...current, event])
    return event
  }

  function updateEvent(id: string, updates: Partial<CalendarEventInput>) {
    setEvents((current) =>
      current.map((event) =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      )
    )
  }

  function deleteEvent(id: string) {
    setEvents((current) => current.filter((event) => event.id !== id))
  }

  return {
    addEvent,
    clearEvents,
    deleteEvent,
    events,
    isReady,
    updateEvent,
  }
}

