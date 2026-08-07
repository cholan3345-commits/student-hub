export const STORAGE_KEYS = {
  assignments: "student-hub:assignments",
  calculatorHistory: "student-hub:calculator-history",
  calendarEvents: "student-hub:calendar-events",
  dashboardLayouts: "student-hub:dashboard-layouts",
  files: "student-hub:files",
  grades: "student-hub:grades",
  habits: "student-hub:habits",
  notes: "student-hub:notes",
  pomodoroPreferences: "student-hub:pomodoro-preferences",
  pomodoroState: "student-hub:pomodoro-state",
  profile: "student-hub:profile",
  schedule: "student-hub:schedule",
  settings: "student-hub:settings",
  workspacePreferences: "student-hub:workspace-preferences",
} as const

export const ALL_STORAGE_KEYS = Object.values(STORAGE_KEYS)

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

export type Weekday = (typeof WEEKDAYS)[number]

export const NOTE_CATEGORIES = [
  "School",
  "Personal",
  "Ideas",
  "Projects",
  "Others",
] as const

export type NoteCategory = (typeof NOTE_CATEGORIES)[number]

export const CALENDAR_CATEGORIES = [
  "Class",
  "Assignment",
  "Exam",
  "Meeting",
  "Personal",
] as const

export type CalendarCategory = (typeof CALENDAR_CATEGORIES)[number]

export const ASSIGNMENT_PRIORITIES = ["Low", "Medium", "High"] as const
export type AssignmentPriority = (typeof ASSIGNMENT_PRIORITIES)[number]

export const ASSIGNMENT_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed",
] as const

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number]

export const CALENDAR_VIEWS = ["Monthly", "Weekly", "Daily"] as const
export type CalendarView = (typeof CALENDAR_VIEWS)[number]

export const THEME_MODES = [
  "dark",
  "light",
  "system",
  "amoled",
  "midnight",
  "blue",
  "purple",
  "green",
] as const
export type ThemeMode = (typeof THEME_MODES)[number]

export const ACCENT_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Green", value: "#10b981" },
  { name: "Emerald", value: "#059669" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Sky", value: "#0ea5e9" },
] as const

export type AccentColor = string

export type DashboardWidgetKind =
  | "schedule"
  | "assignments"
  | "notes"
  | "timer"
  | "calculator"
  | "calendar"
  | "current-date"
  | "current-time"
  | "total-assignments"
  | "completed-assignments"
  | "remaining-assignments"
  | "classes-today"
  | "upcoming-deadlines"
  | "quick-actions"

export type DashboardWidgetSize = "small" | "medium" | "large" | "custom"

export type DashboardWidgetSettings = {
  assignmentsView?: "upcoming" | "overdue" | "completed"
  calculatorView?: "compact" | "expanded"
  calendarView?: "month" | "week" | "day"
  notesView?: "recent" | "favorites"
  scheduleView?: "today" | "tomorrow" | "week"
  timerView?: "compact" | "full"
}

export type DashboardWidget = {
  colSpan: number
  hidden: boolean
  id: string
  kind: DashboardWidgetKind
  pinned: boolean
  rowSpan: number
  settings: DashboardWidgetSettings
  size: DashboardWidgetSize
}

export type DashboardLayoutPreset = {
  createdAt: string
  id: string
  name: string
  quickActions: QuickActionId[]
  updatedAt: string
  widgets: DashboardWidget[]
}

export type DashboardLayoutsState = {
  activePresetId: string
  presets: DashboardLayoutPreset[]
}

export type QuickActionId =
  | "add-schedule"
  | "add-assignment"
  | "add-note"
  | "start-timer"
  | "open-calculator"

export type NavbarControlId = "search" | "notifications" | "profile"

export type BackgroundPreferences = {
  blur: number
  color: string
  mode: "solid" | "wallpaper"
  transparency: number
  wallpaperDataUrl: string
}

export type SidebarPreferences = {
  collapsed: boolean
  hidden: string[]
  order: string[]
  pinned: string[]
  width: number
}

export type NavbarPreferences = {
  hidden: NavbarControlId[]
  order: NavbarControlId[]
}

export type WorkspacePreferences = {
  background: BackgroundPreferences
  navbar: NavbarPreferences
  sidebar: SidebarPreferences
}

export type BaseRecord = {
  createdAt: string
  id: string
  updatedAt: string
}

export type ScheduleItem = BaseRecord & {
  color: string
  day: Weekday
  endTime: string
  instructor: string
  notes: string
  room: string
  startTime: string
  subject: string
}

export type Assignment = BaseRecord & {
  description: string
  dueDate: string
  notes: string
  priority: AssignmentPriority
  progress: number
  status: AssignmentStatus
  subject: string
  title: string
}

export type Note = BaseRecord & {
  category: NoteCategory
  content: string
  favorite: boolean
  pinned: boolean
  title: string
}

export type CalendarEvent = BaseRecord & {
  category: CalendarCategory
  color: string
  date: string
  description: string
  endTime: string
  startTime: string
  title: string
}

export type CalculatorHistoryItem = {
  createdAt: string
  expression: string
  id: string
  result: string
}

export type PomodoroMode = "focus" | "short-break" | "long-break"

export type PomodoroPreferences = {
  focusMinutes: number
  longBreakMinutes: number
  notificationsEnabled: boolean
  shortBreakMinutes: number
  soundEnabled: boolean
}

export type PomodoroState = {
  endsAt: number | null
  isRunning: boolean
  mode: PomodoroMode
  remainingSeconds: number
  sessionCount: number
}

export type StudentHubSettings = {
  accentColor: AccentColor
  defaultCalendarView: CalendarView
  defaultDashboardPage: string
  theme: ThemeMode
}

export type StudentProfile = {
  avatar: string
  course: string
  email: string
  name: string
  school: string
  studentId: string
  yearLevel: string
}

export type StoredFile = BaseRecord & {
  dataUrl: string
  name: string
  size: number
  type: string
}

export type GradeSubject = BaseRecord & {
  finalGrade: number
  midtermGrade: number
  overallGrade: number
  subjectName: string
  units: number
}

export type Habit = BaseRecord & {
  color: string
  completionDates: string[]
  description: string
  name: string
}

export type StudentHubBackup = {
  exportedAt: string
  version: 1
  data: Partial<Record<(typeof ALL_STORAGE_KEYS)[number], unknown>>
}
