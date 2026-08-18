import {
  BookOpen,
  Brain,
  Calculator,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChartColumnBig,
  ClipboardList,
  FileQuestion,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Layers,
  NotebookPen,
  Repeat2,
  Settings,
  Sparkles,
  TimerReset,
  UserRound,
  type LucideIcon,
} from "lucide-react"

export type NavigationSection =
  | "dashboard"
  | "productivity"
  | "records"
  | "ai"
  | "account"

export type NavigationItem = {
  description: string
  href: string
  icon: LucideIcon
  section: NavigationSection
  title: string
}

export const aiToolItems: NavigationItem[] = [
  {
    title: "AI Study Assistant",
    description: "Ask questions and get focused study help.",
    href: "/ai-study-assistant",
    icon: Brain,
    section: "ai",
  },
  {
    title: "AI Notes",
    description: "Generate, rewrite, and organize study notes.",
    href: "/ai-notes",
    icon: BookOpen,
    section: "ai",
  },
  {
    title: "AI Quiz",
    description: "Create practice questions by topic and difficulty.",
    href: "/ai-quiz-generator",
    icon: FileQuestion,
    section: "ai",
  },
  {
    title: "AI Flashcards",
    description: "Generate study flashcards for quick recall.",
    href: "/ai-flashcards",
    icon: Layers,
    section: "ai",
  },
  {
    title: "AI Study Planner",
    description: "Build a study plan around subjects and exam dates.",
    href: "/ai-study-planner",
    icon: CalendarCheck,
    section: "ai",
  },
  {
    title: "AI PDF Assistant",
    description: "Study from uploaded PDFs and document summaries.",
    href: "/ai-pdf-assistant",
    icon: FileText,
    section: "ai",
  },
]

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    description: "A quick overview of your student workspace.",
    href: "/",
    icon: LayoutDashboard,
    section: "dashboard",
  },
  {
    title: "Schedule",
    description: "Plan classes, study blocks, and campus commitments.",
    href: "/schedule",
    icon: CalendarClock,
    section: "productivity",
  },
  {
    title: "Assignments",
    description: "Track coursework, due dates, and upcoming submissions.",
    href: "/assignments",
    icon: ClipboardList,
    section: "productivity",
  },
  {
    title: "Calendar",
    description: "View academic events and important dates in one place.",
    href: "/calendar",
    icon: CalendarDays,
    section: "productivity",
  },
  {
    title: "Notes",
    description: "Capture lecture notes, ideas, and study summaries.",
    href: "/notes",
    icon: NotebookPen,
    section: "productivity",
  },
  {
    title: "Calculator",
    description: "Keep quick calculations close to your study flow.",
    href: "/calculator",
    icon: Calculator,
    section: "productivity",
  },
  {
    title: "Study Timer",
    description: "Prepare focused study sessions and break rhythms.",
    href: "/study-timer",
    icon: TimerReset,
    section: "productivity",
  },
  {
    title: "Habit Tracker",
    description: "Build repeatable routines for school and life.",
    href: "/habit-tracker",
    icon: Repeat2,
    section: "productivity",
  },
  {
    title: "Files",
    description: "Organize class files, references, and resources.",
    href: "/files",
    icon: FolderOpen,
    section: "records",
  },
  {
    title: "Grades",
    description: "Review placeholder grade summaries and progress.",
    href: "/grades",
    icon: ChartColumnBig,
    section: "records",
  },
  {
    title: "AI Hub",
    description: "Open every AI study tool from one focused workspace.",
    href: "/ai",
    icon: Sparkles,
    section: "ai",
  },
  {
    title: "Profile",
    description: "Manage your student profile and personal details.",
    href: "/profile",
    icon: UserRound,
    section: "account",
  },
  {
    title: "Settings",
    description: "Configure Student Hub preferences and workspace details.",
    href: "/settings",
    icon: Settings,
    section: "account",
  },
]

export function getNavigationItem(pathname: string | null) {
  const routeItems = [...aiToolItems, ...navigationItems]

  return (
    routeItems.find((item) => pathname === item.href) ??
    routeItems.find(
      (item) => item.href !== "/" && pathname?.startsWith(`${item.href}/`)
    ) ??
    navigationItems[0]
  )
}

export function isNavigationItemActive(item: NavigationItem, pathname: string) {
  if (item.href === "/") {
    return pathname === "/"
  }

  if (item.href === "/ai") {
    return (
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`) ||
      aiToolItems.some(
        (aiItem) =>
          pathname === aiItem.href || pathname.startsWith(`${aiItem.href}/`)
      )
    )
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
