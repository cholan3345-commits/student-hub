"use client"

import { STORAGE_KEYS, type StudentHubSettings } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export const defaultSettings: StudentHubSettings = {
  accentColor: "#3b82f6",
  defaultCalendarView: "Monthly",
  defaultDashboardPage: "/",
  theme: "dark",
}

export function useSettings() {
  const [settings, setSettings, clearSettings, isReady] =
    useLocalStorage<StudentHubSettings>(STORAGE_KEYS.settings, defaultSettings)

  function updateSettings(updates: Partial<StudentHubSettings>) {
    setSettings((current) => ({ ...current, ...updates }))
  }

  return {
    clearSettings,
    isReady,
    settings,
    updateSettings,
  }
}

