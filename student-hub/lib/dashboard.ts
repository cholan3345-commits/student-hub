import type {
  DashboardLayoutPreset,
  DashboardLayoutsState,
  DashboardWidget,
  DashboardWidgetKind,
  DashboardWidgetSettings,
  DashboardWidgetSize,
  QuickActionId,
} from "@/lib/types"

export type DashboardWidgetConstraints = {
  maxColSpan: number
  maxRowSpan: number
  minColSpan: number
  minRowSpan: number
}

function widgetConstraints(
  minColSpan: number,
  minRowSpan: number
): DashboardWidgetConstraints {
  return {
    maxColSpan: 16,
    maxRowSpan: 12,
    minColSpan,
    minRowSpan,
  }
}

export const WIDGET_SIZE_SPANS: Record<
  DashboardWidgetSize,
  { colSpan: number; rowSpan: number }
> = {
  custom: { colSpan: 4, rowSpan: 3 },
  large: { colSpan: 6, rowSpan: 4 },
  medium: { colSpan: 4, rowSpan: 3 },
  small: { colSpan: 3, rowSpan: 2 },
}

export type DashboardWidgetEmphasis = "primary" | "standard" | "quiet"

export type DashboardWidgetSettingDefinition = {
  defaultValue: string
  key: keyof DashboardWidgetSettings
  label: string
  options: ReadonlyArray<{ label: string; value: string }>
}

export type DashboardWidgetDefinition = {
  constraints: DashboardWidgetConstraints
  defaultSettings: DashboardWidgetSettings
  defaultSize: DashboardWidgetSize
  description: string
  duplicable: boolean
  emphasis: DashboardWidgetEmphasis
  setting?: DashboardWidgetSettingDefinition
  title: string
}

export const DASHBOARD_WIDGET_DEFINITIONS: Record<
  DashboardWidgetKind,
  DashboardWidgetDefinition
> = {
  assignments: {
    title: "Assignments",
    description: "Coursework filtered by your widget setting.",
    constraints: widgetConstraints(3, 3),
    defaultSettings: { assignmentsView: "upcoming" },
    defaultSize: "medium",
    duplicable: true,
    emphasis: "primary",
    setting: {
      key: "assignmentsView",
      label: "Assignments View",
      defaultValue: "upcoming",
      options: [
        { label: "Upcoming", value: "upcoming" },
        { label: "Overdue", value: "overdue" },
        { label: "Completed", value: "completed" },
      ],
    },
  },
  calculator: {
    title: "Calculator Preview",
    description: "Recent calculations and quick calculator access.",
    constraints: widgetConstraints(3, 3),
    defaultSettings: { calculatorView: "compact" },
    defaultSize: "medium",
    duplicable: true,
    emphasis: "standard",
    setting: {
      key: "calculatorView",
      label: "Calculator View",
      defaultValue: "compact",
      options: [
        { label: "Compact", value: "compact" },
        { label: "Expanded", value: "expanded" },
      ],
    },
  },
  calendar: {
    title: "Calendar Preview",
    description: "Events shown in your preferred calendar view.",
    constraints: widgetConstraints(3, 3),
    defaultSettings: { calendarView: "day" },
    defaultSize: "medium",
    duplicable: true,
    emphasis: "standard",
    setting: {
      key: "calendarView",
      label: "Calendar View",
      defaultValue: "day",
      options: [
        { label: "Month", value: "month" },
        { label: "Week", value: "week" },
        { label: "Day", value: "day" },
      ],
    },
  },
  "classes-today": {
    title: "Classes Today",
    description: "Live class count for the current weekday.",
    constraints: widgetConstraints(2, 2),
    defaultSettings: {},
    defaultSize: "small",
    duplicable: false,
    emphasis: "standard",
  },
  "completed-assignments": {
    title: "Completed Assignments",
    description: "Finished work across your assignment list.",
    constraints: widgetConstraints(2, 2),
    defaultSettings: {},
    defaultSize: "small",
    duplicable: false,
    emphasis: "quiet",
  },
  "current-date": {
    title: "Current Date",
    description: "A live date tile for your workspace.",
    constraints: widgetConstraints(2, 2),
    defaultSettings: {},
    defaultSize: "small",
    duplicable: false,
    emphasis: "quiet",
  },
  "current-time": {
    title: "Current Time",
    description: "A live clock for quick reference.",
    constraints: widgetConstraints(2, 2),
    defaultSettings: {},
    defaultSize: "small",
    duplicable: false,
    emphasis: "quiet",
  },
  notes: {
    title: "Recent Notes",
    description: "Notes filtered by recency or favorites.",
    constraints: widgetConstraints(3, 3),
    defaultSettings: { notesView: "recent" },
    defaultSize: "medium",
    duplicable: true,
    emphasis: "standard",
    setting: {
      key: "notesView",
      label: "Notes View",
      defaultValue: "recent",
      options: [
        { label: "Recent", value: "recent" },
        { label: "Favorites", value: "favorites" },
      ],
    },
  },
  "quick-actions": {
    title: "Quick Actions",
    description: "Draggable shortcuts for common student tasks.",
    constraints: widgetConstraints(3, 2),
    defaultSettings: {},
    defaultSize: "medium",
    duplicable: false,
    emphasis: "standard",
  },
  "remaining-assignments": {
    title: "Remaining Assignments",
    description: "Active work that still needs attention.",
    constraints: widgetConstraints(2, 2),
    defaultSettings: {},
    defaultSize: "small",
    duplicable: false,
    emphasis: "quiet",
  },
  schedule: {
    title: "Today's Schedule",
    description: "Classes filtered by day or week.",
    constraints: widgetConstraints(3, 3),
    defaultSettings: { scheduleView: "today" },
    defaultSize: "medium",
    duplicable: true,
    emphasis: "primary",
    setting: {
      key: "scheduleView",
      label: "Schedule View",
      defaultValue: "today",
      options: [
        { label: "Today", value: "today" },
        { label: "Tomorrow", value: "tomorrow" },
        { label: "Week", value: "week" },
      ],
    },
  },
  timer: {
    title: "Study Timer",
    description: "Focused study status and timer controls.",
    constraints: widgetConstraints(3, 3),
    defaultSettings: { timerView: "compact" },
    defaultSize: "medium",
    duplicable: false,
    emphasis: "primary",
    setting: {
      key: "timerView",
      label: "Timer View",
      defaultValue: "compact",
      options: [
        { label: "Compact", value: "compact" },
        { label: "Full", value: "full" },
      ],
    },
  },
  "total-assignments": {
    title: "Total Assignments",
    description: "All assignments saved in Student Hub.",
    constraints: widgetConstraints(2, 2),
    defaultSettings: {},
    defaultSize: "small",
    duplicable: false,
    emphasis: "quiet",
  },
  "upcoming-deadlines": {
    title: "Deadlines",
    description: "Active work due in the next seven days.",
    constraints: widgetConstraints(2, 2),
    defaultSettings: {},
    defaultSize: "small",
    duplicable: false,
    emphasis: "primary",
  },
}

export const DASHBOARD_WIDGET_KINDS = Object.keys(
  DASHBOARD_WIDGET_DEFINITIONS
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
  const definition = DASHBOARD_WIDGET_DEFINITIONS[kind]
  const size = options?.size ?? definition.defaultSize
  const span = WIDGET_SIZE_SPANS[size]

  return {
    colSpan: options?.colSpan ?? span.colSpan,
    hidden: options?.hidden ?? false,
    id,
    kind,
    pinned: options?.pinned ?? false,
    rowSpan: options?.rowSpan ?? span.rowSpan,
    settings: {
      ...definition.defaultSettings,
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
      widgets: [...preset.widgets, ...missingWidgets].map(normalizeDashboardWidget),
    }
  })
  const activePresetId = normalizedPresets.some(
    (preset) => preset.id === state.activePresetId
  )
    ? state.activePresetId
    : normalizedPresets[0].id

  return { activePresetId, presets: normalizedPresets }
}

function normalizeDashboardWidget(widget: DashboardWidget): DashboardWidget {
  const defaults = createDashboardWidget(widget.kind, widget.id)
  const definition = DASHBOARD_WIDGET_DEFINITIONS[widget.kind]

  return {
    ...defaults,
    ...widget,
    colSpan: normalizeSpan(
      widget.colSpan,
      defaults.colSpan,
      definition.constraints.minColSpan,
      definition.constraints.maxColSpan
    ),
    rowSpan: normalizeSpan(
      widget.rowSpan,
      defaults.rowSpan,
      definition.constraints.minRowSpan,
      definition.constraints.maxRowSpan
    ),
    settings: {
      ...definition.defaultSettings,
      ...widget.settings,
    },
  }
}

function normalizeSpan(value: number, fallback: number, min: number, max: number) {
  const normalizedValue = Number.isFinite(value) ? Math.round(value) : fallback

  return Math.min(Math.max(normalizedValue, min), max)
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
        size: large.has(kind)
          ? "large"
          : DASHBOARD_WIDGET_DEFINITIONS[kind].defaultSize,
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
