"use client"

import { useCallback, useMemo, useState } from "react"

import {
  createDashboardWidget,
  createDefaultDashboardState,
  normalizeDashboardState,
  resizeDashboardWidget,
} from "@/lib/dashboard"
import { createId } from "@/lib/storage"
import {
  STORAGE_KEYS,
  type DashboardLayoutPreset,
  type DashboardLayoutsState,
  type DashboardWidget,
  type DashboardWidgetSettings,
  type DashboardWidgetSize,
  type QuickActionId,
} from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function useDashboardLayout() {
  const [customizeMode, setCustomizeMode] = useState(false)
  const [storedState, setStoredState] = useLocalStorage<DashboardLayoutsState>(
    STORAGE_KEYS.dashboardLayouts,
    createDefaultDashboardState()
  )

  const state = useMemo(() => normalizeDashboardState(storedState), [storedState])
  const activePreset = useMemo(
    () =>
      state.presets.find((preset) => preset.id === state.activePresetId) ??
      state.presets[0],
    [state.activePresetId, state.presets]
  )

  const visibleWidgets = useMemo(
    () => activePreset.widgets.filter((widget) => !widget.hidden),
    [activePreset.widgets]
  )
  const hiddenWidgets = useMemo(
    () => activePreset.widgets.filter((widget) => widget.hidden),
    [activePreset.widgets]
  )

  const updateState = useCallback(
    (updater: (current: DashboardLayoutsState) => DashboardLayoutsState) => {
      setStoredState((current) => normalizeDashboardState(updater(normalizeDashboardState(current))))
    },
    [setStoredState]
  )

  const updateActivePreset = useCallback(
    (updater: (preset: DashboardLayoutPreset) => DashboardLayoutPreset) => {
      updateState((current) => ({
        ...current,
        presets: current.presets.map((preset) =>
          preset.id === current.activePresetId
            ? {
                ...updater(preset),
                updatedAt: new Date().toISOString(),
              }
            : preset
        ),
      }))
    },
    [updateState]
  )

  const updateWidget = useCallback(
    (widgetId: string, updater: (widget: DashboardWidget) => DashboardWidget) => {
      updateActivePreset((preset) => ({
        ...preset,
        widgets: preset.widgets.map((widget) =>
          widget.id === widgetId ? updater(widget) : widget
        ),
      }))
    },
    [updateActivePreset]
  )

  const moveWidget = useCallback(
    (draggedId: string, targetId: string) => {
      if (draggedId === targetId) {
        return
      }

      updateActivePreset((preset) => {
        const fromIndex = preset.widgets.findIndex((widget) => widget.id === draggedId)
        const toIndex = preset.widgets.findIndex((widget) => widget.id === targetId)

        if (fromIndex < 0 || toIndex < 0) {
          return preset
        }

        const widgets = [...preset.widgets]
        const [draggedWidget] = widgets.splice(fromIndex, 1)
        widgets.splice(toIndex, 0, draggedWidget)

        return { ...preset, widgets }
      })
    },
    [updateActivePreset]
  )

  const resizeWidget = useCallback(
    (widgetId: string, colSpan: number, rowSpan: number) => {
      updateWidget(widgetId, (widget) => ({
        ...widget,
        colSpan: clamp(colSpan, 2, 12),
        rowSpan: clamp(rowSpan, 2, 8),
        size: "custom",
      }))
    },
    [updateWidget]
  )

  const setWidgetSize = useCallback(
    (widgetId: string, size: DashboardWidgetSize) => {
      updateWidget(widgetId, (widget) => resizeDashboardWidget(widget, size))
    },
    [updateWidget]
  )

  const updateWidgetSettings = useCallback(
    (widgetId: string, settings: DashboardWidgetSettings) => {
      updateWidget(widgetId, (widget) => ({
        ...widget,
        settings: {
          ...widget.settings,
          ...settings,
        },
      }))
    },
    [updateWidget]
  )

  const hideWidget = useCallback(
    (widgetId: string) => {
      updateWidget(widgetId, (widget) => ({ ...widget, hidden: true }))
    },
    [updateWidget]
  )

  const showWidget = useCallback(
    (widgetId: string) => {
      updateWidget(widgetId, (widget) => ({ ...widget, hidden: false }))
    },
    [updateWidget]
  )

  const togglePinWidget = useCallback(
    (widgetId: string) => {
      updateWidget(widgetId, (widget) => ({ ...widget, pinned: !widget.pinned }))
    },
    [updateWidget]
  )

  const duplicateWidget = useCallback(
    (widgetId: string) => {
      updateActivePreset((preset) => {
        const index = preset.widgets.findIndex((widget) => widget.id === widgetId)

        if (index < 0) {
          return preset
        }

        const source = preset.widgets[index]
        const duplicate: DashboardWidget = {
          ...source,
          hidden: false,
          id: `${source.kind}-${createId()}`,
          pinned: false,
        }
        const widgets = [...preset.widgets]
        widgets.splice(index + 1, 0, duplicate)

        return { ...preset, widgets }
      })
    },
    [updateActivePreset]
  )

  const resetActivePreset = useCallback(() => {
    updateState((current) => {
      const defaults = normalizeDashboardState(createDefaultDashboardState())
      const replacement =
        defaults.presets.find((preset) => preset.id === current.activePresetId) ??
        defaults.presets[0]

      return {
        ...current,
        presets: current.presets.map((preset) =>
          preset.id === current.activePresetId ? replacement : preset
        ),
      }
    })
  }, [updateState])

  const switchPreset = useCallback(
    (presetId: string) => {
      updateState((current) => ({
        ...current,
        activePresetId: presetId,
      }))
    },
    [updateState]
  )

  const createPreset = useCallback(
    (name: string) => {
      const presetId = `layout-${createId()}`

      updateState((current) => {
        const source =
          current.presets.find((preset) => preset.id === current.activePresetId) ??
          current.presets[0]
        const now = new Date().toISOString()

        return {
          activePresetId: presetId,
          presets: [
            ...current.presets,
            {
              ...source,
              createdAt: now,
              id: presetId,
              name: name.trim() || "New Layout",
              updatedAt: now,
              widgets: source.widgets.map((widget) =>
                createDashboardWidget(widget.kind, `${presetId}-${widget.kind}-${createId()}`, widget)
              ),
            },
          ],
        }
      })
    },
    [updateState]
  )

  const renamePreset = useCallback(
    (presetId: string, name: string) => {
      updateState((current) => ({
        ...current,
        presets: current.presets.map((preset) =>
          preset.id === presetId
            ? {
                ...preset,
                name: name.trim() || preset.name,
                updatedAt: new Date().toISOString(),
              }
            : preset
        ),
      }))
    },
    [updateState]
  )

  const duplicatePreset = useCallback(
    (presetId: string) => {
      updateState((current) => {
        const source = current.presets.find((preset) => preset.id === presetId)

        if (!source) {
          return current
        }

        const copyId = `layout-${createId()}`
        const now = new Date().toISOString()

        return {
          activePresetId: copyId,
          presets: [
            ...current.presets,
            {
              ...source,
              createdAt: now,
              id: copyId,
              name: `${source.name} Copy`,
              updatedAt: now,
              widgets: source.widgets.map((widget) => ({
                ...widget,
                id: `${copyId}-${widget.kind}-${createId()}`,
              })),
            },
          ],
        }
      })
    },
    [updateState]
  )

  const deletePreset = useCallback(
    (presetId: string) => {
      updateState((current) => {
        if (current.presets.length <= 1) {
          return current
        }

        const presets = current.presets.filter((preset) => preset.id !== presetId)

        return {
          activePresetId:
            current.activePresetId === presetId ? presets[0].id : current.activePresetId,
          presets,
        }
      })
    },
    [updateState]
  )

  const moveQuickAction = useCallback(
    (draggedId: QuickActionId, targetId: QuickActionId) => {
      if (draggedId === targetId) {
        return
      }

      updateActivePreset((preset) => {
        const fromIndex = preset.quickActions.indexOf(draggedId)
        const toIndex = preset.quickActions.indexOf(targetId)

        if (fromIndex < 0 || toIndex < 0) {
          return preset
        }

        const quickActions = [...preset.quickActions]
        const [draggedAction] = quickActions.splice(fromIndex, 1)
        quickActions.splice(toIndex, 0, draggedAction)

        return { ...preset, quickActions }
      })
    },
    [updateActivePreset]
  )

  return {
    activePreset,
    createPreset,
    customizeMode,
    deletePreset,
    duplicatePreset,
    duplicateWidget,
    hiddenWidgets,
    hideWidget,
    moveQuickAction,
    moveWidget,
    presets: state.presets,
    renamePreset,
    resetActivePreset,
    resizeWidget,
    setCustomizeMode,
    setWidgetSize,
    showWidget,
    switchPreset,
    togglePinWidget,
    updateWidgetSettings,
    visibleWidgets,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
