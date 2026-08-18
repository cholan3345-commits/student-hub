"use client"

import type { ReactNode } from "react"

import { PomodoroProvider } from "@/components/providers/pomodoro-provider"
import { ToastProvider } from "@/components/ui/toast"
import { useTheme } from "@/hooks/use-theme"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PomodoroProvider>
        <ThemeBridge />
        {children}
      </PomodoroProvider>
    </ToastProvider>
  )
}

function ThemeBridge() {
  useTheme()
  return null
}
