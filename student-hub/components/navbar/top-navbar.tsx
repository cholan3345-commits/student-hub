"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  NotebookPen,
  Search,
} from "lucide-react"

import { getNavigationItem } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAssignments } from "@/hooks/use-assignments"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { useNotes } from "@/hooks/use-notes"
import { useSchedule } from "@/hooks/use-schedule"
import { useWorkspacePreferences } from "@/hooks/use-workspace-preferences"
import type { NavbarControlId } from "@/lib/types"

type SearchResult = {
  href: string
  icon: typeof CalendarClock
  id: string
  meta: string
  title: string
}

export function TopNavbar() {
  const pathname = usePathname()
  const currentPage = getNavigationItem(pathname)
  const router = useRouter()
  const { assignments } = useAssignments()
  const { events } = useCalendarEvents()
  const { notes } = useNotes()
  const { schedules } = useSchedule()
  const { preferences } = useWorkspacePreferences()
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    const search = query.trim().toLowerCase()

    if (search.length < 2) {
      return []
    }

    const matches = (value: string) => value.toLowerCase().includes(search)

    const scheduleResults: SearchResult[] = schedules
      .filter((item) =>
        [item.subject, item.day, item.room, item.instructor, item.notes].some(matches)
      )
      .map((item) => ({
        href: "/schedule",
        icon: CalendarClock,
        id: `schedule-${item.id}`,
        meta: `${item.day} - ${item.startTime || "Any time"}`,
        title: item.subject,
      }))

    const assignmentResults: SearchResult[] = assignments
      .filter((item) =>
        [item.title, item.subject, item.description, item.notes, item.status].some(matches)
      )
      .map((item) => ({
        href: "/assignments",
        icon: ClipboardList,
        id: `assignment-${item.id}`,
        meta: `${item.subject || "Assignment"} - due ${item.dueDate || "unscheduled"}`,
        title: item.title,
      }))

    const noteResults: SearchResult[] = notes
      .filter((item) => [item.title, item.category, item.content].some(matches))
      .map((item) => ({
        href: "/notes",
        icon: NotebookPen,
        id: `note-${item.id}`,
        meta: item.category,
        title: item.title,
      }))

    const eventResults: SearchResult[] = events
      .filter((item) =>
        [item.title, item.category, item.description, item.date].some(matches)
      )
      .map((item) => ({
        href: "/calendar",
        icon: CalendarClock,
        id: `event-${item.id}`,
        meta: `${item.category} - ${item.date}`,
        title: item.title,
      }))

    return [
      ...scheduleResults,
      ...assignmentResults,
      ...noteResults,
      ...eventResults,
    ].slice(0, 8)
  }, [assignments, events, notes, query, schedules])

  function openResult(result: SearchResult) {
    setQuery("")
    router.push(result.href)
  }

  const visibleControls = preferences.navbar.order.filter(
    (controlId) => !preferences.navbar.hidden.includes(controlId)
  )

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[92px] border-b border-white/10 bg-[var(--hub-panel-bg)] shadow-lg shadow-black/20 backdrop-blur sm:h-20 lg:h-[72px]">
      <div className="flex h-full flex-col gap-3 px-3 py-3 sm:px-5 lg:flex-row lg:items-center lg:gap-4 lg:py-0">
        <div className="flex min-w-0 items-center gap-3 lg:min-w-64">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-950/30">
            <GraduationCap className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="hidden text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 sm:block">
              Student Hub
            </p>
            <p className="truncate text-base font-semibold text-zinc-50 sm:text-lg">
              {currentPage.title}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {visibleControls.map((controlId) =>
            renderNavbarControl(controlId, {
              openResult,
              query,
              results,
              setQuery,
            })
          )}
        </div>
      </div>
    </header>
  )
}

function renderNavbarControl(
  controlId: NavbarControlId,
  props: {
    openResult: (result: SearchResult) => void
    query: string
    results: SearchResult[]
    setQuery: (query: string) => void
  }
) {
  if (controlId === "search") {
    return <NavbarSearch key={controlId} {...props} />
  }

  if (controlId === "notifications") {
    return (
      <Button
        key={controlId}
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Notifications"
        className="size-10 rounded-xl text-zinc-400 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-blue-200"
      >
        <Bell className="size-5" aria-hidden="true" />
      </Button>
    )
  }

  return (
    <Button
      key={controlId}
      type="button"
      variant="ghost"
      aria-label="User profile"
      className="size-10 rounded-full border border-blue-400/30 bg-blue-500/15 p-0 text-sm font-semibold text-blue-100 shadow-lg shadow-blue-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500/20"
    >
      SH
    </Button>
  )
}

function NavbarSearch({
  openResult,
  query,
  results,
  setQuery,
}: {
  openResult: (result: SearchResult) => void
  query: string
  results: SearchResult[]
  setQuery: (query: string) => void
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
        aria-hidden="true"
      />
      <Input
        aria-label="Search Student Hub"
        placeholder="Search Student Hub"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-10 pl-9 pr-4"
      />
      {query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-12 z-[80] overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/98 shadow-2xl shadow-black/40 backdrop-blur">
          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto p-2">
              {results.map((result) => {
                const Icon = result.icon

                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => openResult(result)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-100 focus-visible:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-200">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{result.title}</span>
                      <span className="block truncate text-xs text-zinc-500">
                        {result.meta}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-4 text-sm text-zinc-500">No matching results.</div>
          )}
        </div>
      ) : null}
    </div>
  )
}
