"use client"

import { getDateKey } from "@/lib/date"
import { createId } from "@/lib/storage"
import { STORAGE_KEYS, type Habit } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type HabitInput = Omit<Habit, "createdAt" | "id" | "updatedAt">

export function useHabits() {
  const [habits, setHabits, clearHabits, isReady] = useLocalStorage<Habit[]>(
    STORAGE_KEYS.habits,
    []
  )

  function addHabit(input: HabitInput) {
    const now = new Date().toISOString()
    const habit: Habit = {
      ...input,
      createdAt: now,
      id: createId(),
      updatedAt: now,
    }

    setHabits((current) => [...current, habit])
    return habit
  }

  function updateHabit(id: string, updates: Partial<HabitInput>) {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === id
          ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
          : habit
      )
    )
  }

  function deleteHabit(id: string) {
    setHabits((current) => current.filter((habit) => habit.id !== id))
  }

  function toggleToday(id: string) {
    const today = getDateKey()
    const habit = habits.find((item) => item.id === id)

    if (!habit) {
      return
    }

    updateHabit(id, {
      completionDates: habit.completionDates.includes(today)
        ? habit.completionDates.filter((date) => date !== today)
        : [...habit.completionDates, today].sort(),
    })
  }

  return {
    addHabit,
    clearHabits,
    deleteHabit,
    habits,
    isReady,
    toggleToday,
    updateHabit,
  }
}

