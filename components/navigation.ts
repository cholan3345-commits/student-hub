import {
  Calculator,
  CalendarClock,
  CalendarDays,
  ChartColumnBig,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  NotebookPen,
  Repeat2,
  Settings,
  TimerReset,
  UserRound,
  type LucideIcon,
} from "lucide-react"

export type NavigationItem = {
  description: string
  href: string
  icon: LucideIcon
  title: string
}

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    description: "A quick overview of your student workspace.",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Schedule",
    description: "Plan classes, study blocks, and campus commitments.",
    href: "/schedule",
    icon: CalendarClock,
  },
  {
    title: "Assignments",
    description: "Track coursework, due dates, and upcoming submissions.",
    href: "/assignments",
    icon: ClipboardList,
  },
  {
    title: "Calendar",
    description: "View academic events and important dates in one place.",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Notes",
    description: "Capture lecture notes, ideas, and study summaries.",
    href: "/notes",
    icon: NotebookPen,
  },
  {
    title: "Calculator",
    description: "Keep quick calculations close to your study flow.",
    href: "/calculator",
    icon: Calculator,
  },
  {
    title: "Study Timer",
    description: "Prepare focused study sessions and break rhythms.",
    href: "/study-timer",
    icon: TimerReset,
  },
  {
    title: "Habit Tracker",
    description: "Build repeatable routines for school and life.",
    href: "/habit-tracker",
    icon: Repeat2,
  },
  {
    title: "Files",
    description: "Organize class files, references, and resources.",
    href: "/files",
    icon: FolderOpen,
  },
  {
    title: "Grades",
    description: "Review placeholder grade summaries and progress.",
    href: "/grades",
    icon: ChartColumnBig,
  },
  {
    title: "Profile",
    description: "Manage your student profile and personal details.",
    href: "/profile",
    icon: UserRound,
  },
  {
    title: "Settings",
    description: "Configure Student Hub preferences and workspace details.",
    href: "/settings",
    icon: Settings,
  },
]

export function getNavigationItem(pathname: string | null) {
  return (
    navigationItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)
    ) ?? navigationItems[0]
  )
}
