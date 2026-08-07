"use client"

import { useCallback } from "react"

import type {
  DashboardWidget,
  DashboardWidgetSettings,
  DashboardWidgetSize,
} from "@/lib/types"

type UseWidgetSettingsOptions = {
  setWidgetSize: (widgetId: string, size: DashboardWidgetSize) => void
  updateWidgetSettings: (widgetId: string, settings: DashboardWidgetSettings) => void
  widget: DashboardWidget
}

export function useWidgetSettings({
  setWidgetSize,
  updateWidgetSettings,
  widget,
}: UseWidgetSettingsOptions) {
  const updateSettings = useCallback(
    (settings: DashboardWidgetSettings) => {
      updateWidgetSettings(widget.id, settings)
    },
    [updateWidgetSettings, widget.id]
  )

  const setSize = useCallback(
    (size: DashboardWidgetSize) => {
      setWidgetSize(widget.id, size)
    },
    [setWidgetSize, widget.id]
  )

  return {
    setSize,
    updateSettings,
  }
}
