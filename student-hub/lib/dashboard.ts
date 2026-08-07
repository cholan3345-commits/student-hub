import type {
  DashboardLayoutPreset,
  DashboardLayoutsState,
  DashboardWidget,
  DashboardWidgetKind,
  DashboardWidgetSettings,
  DashboardWidgetSize,
  QuickActionId,
} from "@/lib/types"

export const DASHBOARD_WIDGET_COPY: Record<
  DashboardWidgetKind,
  { description: string; title: string }
> = {
  assignments: {
    title: "Upcoming Assignments",
    description: "Coursework filtered by your widget setting.",
  },
  calculator: {
    title: "Calculator Preview",
    description: "Recent calculations and quick calculator access.",
  },
  calendar: {
    title: "Calendar Preview",
    description: "Events shown in your preferred calendar view.",
  },
  "classes-today": {
    title: "Total Classes Today",
    description: "Live class count for the current weekday.",
  },
  "completed-assignments": {
    title: "Completed Assignments",
    description: "Finished work across your assignment list.",
  },
  "current-date": {
    title: "Current Date",
    description: "A live date tile for your workspace.",
  },
  "current-time": {
    title: "Current Time",
    description: "A live clock for quick reference.",
  },
  notes: {
    title: "Recent Notes",
    description: "Notes filtered by recency or favorites.",
  },
  "quick-actions": {
    title: "Quick Actions",
    description: "Draggable shortcuts for common student tasks.",
  },
  "remaining-assignments": {
    title: "Remaining Assignments",
    description: "Active work that still needs attention.",
  },
  schedule: {
    title: "Today's Schedule",
    description: "Classes filtered by day or week.",
  },
  timer: {
    title: "Current Pomodoro Timer",
    description: "Focused study status and timer controls.",
  },
  "total-assignments": {
    title: "Total Assignments",
    description: "All assignments saved in Student Hub.",
  },
  "upcoming-deadlines": {
    title: "Upcoming Deadlines",
    description: "Active work due in the next seven days.",
  },
}

export const DASHBOARD_WIDGET_KINDS = Object.keys(
  DASHBOARD_WIDGET_COPY
) as DashboardWidgetKind[]

export const QUICK_ACTIONS: Array<{
  href: string
  id: QuickActionId
  label: string
}> = [
  { id: "add-schedule", label: "Add Schedule", href: "/schedule" },
  { id: "add-assignment", label: "Add Assignment", href: "/assignments" },
  { id: "add-note", label: "Add Note", href: "/notes" },
  { id: "start-timer", label: "Start Timer", href: "/study-timer" },
  { id: "open-calculator", label: "Open Calculator", href: "/calculator" },
]

export const DEFAULT_QUICK_ACTION_ORDER = QUICK_ACTIONS.map((action) => action.id)

export const WIDGET_SIZE_SPANS: Record<
  DashboardWidgetSize,
  { colSpan: number; rowSpan: number }
> = {
  custom: { colSpan: 4, rowSpan: 3 },
  large: { colSpan: 6, rowSpan: 4 },
  medium: { colSpan: 4, rowSpan: 3 },
  small: { colSpan: 3, rowSpan: 2 },
}

const DEFAULT_WIDGET_SETTINGS: Record<DashboardWidgetKind, DashboardWidgetSettings> = {
  assignments: { assignmentsView: "upcoming" },
  calculator: { calculatorView: "compact" },
  calendar: { calendarView: "day" },
  "classes-today": {},
  "completed-assignments": {},
  "current-date": {},
  "current-time": {},
  notes: { notesView: "recent" },
  "quick-actions": {},
  "remaining-assignments": {},
  schedule: { scheduleView: "today" },
  timer: { timerView: "compact" },
  "total-assignments": {},
  "upcoming-deadlines": {},
}

const DEFAULT_WIDGET_SIZES: Record<DashboardWidgetKind, DashboardWidgetSize> = {
  assignments: "medium",
  calculator: "medium",
  calendar: "medium",
  "classes-today": "small",
  "completed-assignments": "small",
  "current-date": "small",
  "current-time": "small",
  notes: "medium",
  "quick-actions": "medium",
  "remaining-assignments": "small",
  schedule: "medium",
  timer: "medium",
  "total-assignments": "small",
  "upcoming-deadlines": "small",
}

const DEFAULT_CREATED_AT = "2026-01-01T00:00:00.000Z"

type PresetOptions = {
  hidden?: DashboardWidgetKind[]
  large?: DashboardWidgetKind[]
  pinned?: DashboardWidgetKind[]
}

export function createDashboardWidget(
  kind: DashboardWidgetKind,
  id: string = kind,
  options?: Partial<DashboardWidget>
): DashboardWidget {
  const size = options?.size ?? DEFAULT_WIDGET_SIZES[kind]
  const span = WIDGET_SIZE_SPANS[size]

  return {
    colSpan: options?.colSpan ?? span.colSpan,
    hidden: options?.hidden ?? false,
    id,
    kind,
    pinned: options?.pinned ?? false,
    rowSpan: options?.rowSpan ?? span.rowSpan,
    settings: {
      ...DEFAULT_WIDGET_SETTINGS[kind],
      ...options?.settings,
    },
    size,
  }
}

export function resizeDashboardWidget(
  widget: DashboardWidget,
  size: DashboardWidgetSize
): DashboardWidget {
  if (size === "custom") {
    return { ...widget, size }
  }

  const span = WIDGET_SIZE_SPANS[size]

  return {
    ...widget,
    colSpan: span.colSpan,
    rowSpan: span.rowSpan,
    size,
  }
}

export function normalizeDashboardState(
  state: DashboardLayoutsState
): DashboardLayoutsState {
  const presets = state.presets.length > 0 ? state.presets : createDefaultPresets()
  const normalizedPresets = presets.map((preset) => {
    const existingKinds = new Set(preset.widgets.map((widget) => widget.kind))
    const missingWidgets = DASHBOARD_WIDGET_KINDS.filter(
      (kind) => !existingKinds.has(kind)
    ).map((kind) => createDashboardWidget(kind, `${preset.id}-${kind}`, { hidden: true }))

    return {
      ...preset,
      quickActions: normalizeQuickActions(preset.quickActions),
      widgets: [...preset.widgets, ...missingWidgets].map((widget) => ({
        ...createDashboardWidget(widget.kind, widget.id),
        ...widget,
        settings: {
          ...DEFAULT_WIDGET_SETTINGS[widget.kind],
          ...widget.settings,
        },
      })),
    }
  })
  const activePresetId = normalizedPresets.some(
    (preset) => preset.id === state.activePresetId
  )
    ? state.activePresetId
    : normalizedPresets[0].id

  return { activePresetId, presets: normalizedPresets }
}

export function createDefaultDashboardState(): DashboardLayoutsState {
  return {
    activePresetId: "school",
    presets: createDefaultPresets(),
  }
}

function createDefaultPresets(): DashboardLayoutPreset[] {
  return [
    createPreset("school", "School", {
      large: ["schedule", "assignments"],
      pinned: ["schedule", "assignments"],
    }),
    createPreset("exam-week", "Exam Week", {
      hidden: ["calculator", "current-date"],
      large: ["assignments", "calendar", "timer"],
      pinned: ["assignments", "timer"],
    }),
    createPreset("weekend", "Weekend", {
      hidden: ["classes-today", "schedule"],
      large: ["notes", "calendar"],
      pinned: ["notes", "quick-actions"],
    }),
    createPreset("programming", "Programming", {
      hidden: ["classes-today", "completed-assignments"],
      large: ["notes", "calculator", "timer"],
      pinned: ["calculator", "timer"],
    }),
    createPreset("personal", "Personal", {
      hidden: ["classes-today", "total-assignments"],
      large: ["notes", "quick-actions"],
      pinned: ["quick-actions"],
    }),
  ]
}

function createPreset(
  id: string,
  name: string,
  options: PresetOptions = {}
): DashboardLayoutPreset {
  const hidden = new Set(options.hidden ?? [])
  const large = new Set(options.large ?? [])
  const pinned = new Set(options.pinned ?? [])

  return {
    createdAt: DEFAULT_CREATED_AT,
    id,
    name,
    quickActions: DEFAULT_QUICK_ACTION_ORDER,
    updatedAt: DEFAULT_CREATED_AT,
    widgets: DASHBOARD_WIDGET_KINDS.map((kind) =>
      createDashboardWidget(kind, `${id}-${kind}`, {
        hidden: hidden.has(kind),
        pinned: pinned.has(kind),
        size: large.has(kind) ? "large" : DEFAULT_WIDGET_SIZES[kind],
      })
    ),
  }
}

function normalizeQuickActions(actions: QuickActionId[]) {
  const existing = new Set(actions)
  const valid = actions.filter((action) =>
    DEFAULT_QUICK_ACTION_ORDER.includes(action)
  )
  const missing = DEFAULT_QUICK_ACTION_ORDER.filter((action) => !existing.has(action))

  return [...valid, ...missing]
}
