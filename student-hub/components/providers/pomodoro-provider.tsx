"use client"

import { createContext, useContext, type ReactNode } from "react"

import { usePomodoro } from "@/hooks/use-pomodoro"

type PomodoroController = ReturnType<typeof usePomodoro>

const PomodoroContext = createContext<PomodoroController | null>(null)

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const pomodoro = usePomodoro()

  return (
    <PomodoroContext.Provider value={pomodoro}>
      {children}
    </PomodoroContext.Provider>
  )
}

export function useSharedPomodoro() {
  const pomodoro = useContext(PomodoroContext)

  if (!pomodoro) {
    throw new Error("useSharedPomodoro must be used within PomodoroProvider")
  }

  return pomodoro
}
