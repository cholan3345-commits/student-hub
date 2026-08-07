"use client"

import type { ReactNode } from "react"

import { ToastProvider } from "@/components/ui/toast"
import { useTheme } from "@/hooks/use-theme"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ThemeBridge />
      {children}
    </ToastProvider>
  )
}

function ThemeBridge() {
  useTheme()
  return null
}

