"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Popover } from "@base-ui/react/popover"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCheck,
  CircleCheckBig,
  ClipboardList,
  Clock3,
  NotebookPen,
  Search,
  Settings,
  TimerReset,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react"

import { getNavigationItem } from "@/components/navigation"
import { HubPopoverContent } from "@/components/ui/hub-popover-content"
import { Input } from "@/components/ui/input"
import { useAssignments } from "@/hooks/use-assignments"
import { useAutoHideNavbar } from "@/hooks/use-auto-hide-navbar"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { useNotes } from "@/hooks/use-notes"
import { useProfile } from "@/hooks/use-profile"
import { useSchedule } from "@/hooks/use-schedule"
import {
  useStudentNotifications,
  type StudentNotification,
  type StudentNotificationKind,
} from "@/hooks/use-student-notifications"
import { useWorkspacePreferences } from "@/hooks/use-workspace-preferences"
import type { NavbarControlId, StudentProfile } from "@/lib/types"
import { cn } from "@/lib/utils"

type SearchResult = {
  href: string
  icon: typeof CalendarClock
  id: string
  meta: string
  title: string
}

type HeaderPopoverKind = "notifications" | "profile"

const headerPopover = Popover.createHandle<HeaderPopoverKind>()

const notificationIcons: Record<StudentNotificationKind, LucideIcon> = {
  class: CalendarClock,
  deadline: Clock3,
  overdue: AlertTriangle,
  timer: TimerReset,
}

const notificationToneClasses: Record<StudentNotificationKind, string> = {
  class: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  deadline: "hub-accent-soft",
  overdue: "border-red-400/25 bg-red-400/10 text-red-300",
  timer: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
}

export function TopNavbar() {
  const pathname = usePathname()
  const currentPage = getNavigationItem(pathname)
  const router = useRouter()
  const { assignments } = useAssignments()
  const { events } = useCalendarEvents()
  const { notes } = useNotes()
  const { profile } = useProfile()
  const { schedules } = useSchedule()
  const { preferences } = useWorkspacePreferences()
  const { markAllRead, markRead, notifications, unreadCount } =
    useStudentNotifications(assignments, schedules)
  const [query, setQuery] = useState("")
  const [headerPopoverOpen, setHeaderPopoverOpen] = useState(false)
  const navbarVisible = useAutoHideNavbar(pathname === "/", headerPopoverOpen)
  const profileInitials = getProfileInitials(profile)

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
    headerPopover.close()
    setQuery("")
    router.push(result.href)
  }

  function updateQuery(nextQuery: string) {
    headerPopover.close()
    setQuery(nextQuery)
  }

  function openNotification(notification: StudentNotification) {
    markRead(notification.id)
    headerPopover.close()
    router.push(notification.href)
  }

  function handleHeaderPopoverChange(open: boolean) {
    setHeaderPopoverOpen(open)

    if (open) {
      setQuery("")
    }
  }

  const visibleControls = preferences.navbar.order.filter(
    (controlId) => !preferences.navbar.hidden.includes(controlId)
  )

  return (
    <>
      <header
        data-app-navbar
        data-navbar-hidden={navbarVisible ? "false" : "true"}
        aria-hidden={navbarVisible ? undefined : true}
        inert={navbarVisible ? undefined : true}
        className="hub-navbar-auto-hide pointer-events-none fixed left-3 right-3 top-3 z-[70] isolate [backface-visibility:hidden] lg:left-[calc(var(--student-sidebar-width)+1.5rem)]"
      >
        <div className="hub-glass-strong pointer-events-auto relative flex min-h-[5.75rem] min-w-0 flex-col gap-3 overflow-visible rounded-[1.75rem] px-3 py-3 sm:min-h-20 sm:px-5 lg:min-h-[4.5rem] lg:flex-row lg:items-center lg:gap-4 lg:px-5 lg:py-0">
          <div className="flex min-w-0 items-center gap-3 lg:min-w-64">
            <div className="grid min-w-0 gap-1">
              <p className="hidden text-xs font-medium uppercase leading-4 tracking-[0.18em] text-[var(--hub-muted-text)] sm:block">
                Student Hub
              </p>
              <p className="truncate text-base font-semibold leading-6 text-[var(--hub-text)] sm:text-lg">
                {currentPage.title}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            {visibleControls.map((controlId) =>
              renderNavbarControl(controlId, {
                onSearchFocus: () => headerPopover.close(),
                openResult,
                profile,
                profileInitials,
                query,
                results,
                setQuery: updateQuery,
                unreadCount,
              })
            )}
          </div>
        </div>
      </header>

      <HeaderPopover
        markAllRead={markAllRead}
        notifications={notifications}
        onOpenChange={handleHeaderPopoverChange}
        openNotification={openNotification}
        profile={profile}
        profileInitials={profileInitials}
        unreadCount={unreadCount}
      />
    </>
  )
}

function renderNavbarControl(
  controlId: NavbarControlId,
  props: {
    onSearchFocus: () => void
    openResult: (result: SearchResult) => void
    profile: StudentProfile
    profileInitials: string
    query: string
    results: SearchResult[]
    setQuery: (query: string) => void
    unreadCount: number
  }
) {
  if (controlId === "search") {
    return <NavbarSearch key={controlId} {...props} />
  }

  if (controlId === "notifications") {
    return (
      <Popover.Trigger
        key={controlId}
        handle={headerPopover}
        payload="notifications"
        data-header-popover-trigger="notifications"
        aria-label={
          props.unreadCount > 0
            ? `Notifications, ${props.unreadCount} unread`
            : "Notifications"
        }
        className="hub-glass-control hub-focus relative grid size-10 shrink-0 place-items-center rounded-xl text-zinc-400 transition-[color,background-color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-[var(--hub-accent)]"
      >
        <Bell className="size-5" aria-hidden="true" />
        {props.unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full border border-black/40 bg-[var(--hub-accent)] px-1 text-[0.6rem] font-semibold leading-none text-white shadow-lg shadow-[var(--hub-accent-glow)]">
            {props.unreadCount > 9 ? "9+" : props.unreadCount}
          </span>
        ) : null}
      </Popover.Trigger>
    )
  }

  return (
    <Popover.Trigger
      key={controlId}
      handle={headerPopover}
      payload="profile"
      data-header-popover-trigger="profile"
      aria-label="Open profile menu"
      className="hub-accent-soft hub-focus relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border p-0 text-sm font-semibold shadow-lg shadow-[var(--hub-accent-glow)] transition-[background-color,border-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--hub-accent-muted)]"
    >
      {props.profile.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={props.profile.avatar} alt="" className="size-full object-cover" />
      ) : (
        props.profileInitials
      )}
    </Popover.Trigger>
  )
}

function HeaderPopover({
  markAllRead,
  notifications,
  onOpenChange,
  openNotification,
  profile,
  profileInitials,
  unreadCount,
}: {
  markAllRead: () => void
  notifications: StudentNotification[]
  onOpenChange: (open: boolean) => void
  openNotification: (notification: StudentNotification) => void
  profile: StudentProfile
  profileInitials: string
  unreadCount: number
}) {
  return (
    <Popover.Root handle={headerPopover} onOpenChange={onOpenChange}>
      {({ payload }) => {
        if (!payload) {
          return null
        }

        return (
          <HubPopoverContent
            sideOffset={10}
            positionerClassName="z-[90]"
            popupProps={{
              "data-header-popover": payload,
              className: cn(
                "max-h-[min(34rem,calc(100dvh-1.5rem))] overflow-hidden",
                payload === "notifications"
                  ? "w-[min(24rem,calc(100vw-1.5rem))]"
                  : "w-[min(19rem,calc(100vw-1.5rem))]"
              ),
            }}
          >
            {payload === "notifications" ? (
              <NotificationCenter
                markAllRead={markAllRead}
                notifications={notifications}
                openNotification={openNotification}
                unreadCount={unreadCount}
              />
            ) : (
              <ProfileMenu profile={profile} profileInitials={profileInitials} />
            )}
          </HubPopoverContent>
        )
      }}
    </Popover.Root>
  )
}

function NotificationCenter({
  markAllRead,
  notifications,
  openNotification,
  unreadCount,
}: {
  markAllRead: () => void
  notifications: StudentNotification[]
  openNotification: (notification: StudentNotification) => void
  unreadCount: number
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
        <div className="grid min-w-0 gap-1">
          <Popover.Title className="font-semibold text-[var(--hub-text)]">
            Notification Center
          </Popover.Title>
          <Popover.Description className="text-xs leading-4 text-[var(--hub-muted-text)]">
            {unreadCount > 0
              ? `${unreadCount} unread ${unreadCount === 1 ? "update" : "updates"}`
              : "Your current Student Hub updates"}
          </Popover.Description>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className="hub-focus flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-[var(--hub-accent)] transition-colors duration-150 hover:bg-[var(--hub-accent-soft)]"
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Mark all read
            </button>
          ) : null}
          <Popover.Close
            aria-label="Close notifications"
            className="hub-focus grid size-8 place-items-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-white/[0.08] hover:text-zinc-100"
          >
            <X className="size-4" aria-hidden="true" />
          </Popover.Close>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
          <span className="hub-accent-soft grid size-11 place-items-center rounded-2xl border">
            <CircleCheckBig className="size-5" aria-hidden="true" />
          </span>
          <div className="grid gap-1">
            <p className="font-medium leading-5 text-[var(--hub-text)]">
              You&apos;re all caught up.
            </p>
            <p className="text-sm leading-5 text-[var(--hub-muted-text)]">
              New deadline, class, and timer updates will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid max-h-[min(27rem,calc(100dvh-8rem))] gap-1 overflow-y-auto overscroll-contain p-2">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.kind]

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => openNotification(notification)}
                className={cn(
                  "hub-focus group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-[background-color,transform] duration-150 ease-out hover:translate-x-0.5 hover:bg-white/[0.07]",
                  !notification.read && "bg-white/[0.04]"
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl border",
                    notificationToneClasses[notification.kind]
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="grid min-w-0 flex-1 gap-1">
                  <span className="flex items-start gap-2">
                    <span className="min-w-0 flex-1 break-words font-medium text-zinc-100">
                      {notification.title}
                    </span>
                    {!notification.read ? (
                      <span
                        className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--hub-accent)] shadow-[0_0_12px_var(--hub-accent)]"
                        aria-label="Unread"
                      />
                    ) : null}
                  </span>
                  <span className="block break-words text-xs leading-5 text-[var(--hub-muted-text)]">
                    {notification.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProfileMenu({
  profile,
  profileInitials,
}: {
  profile: StudentProfile
  profileInitials: string
}) {
  const profileMeta = profile.email || profile.course || profile.school || "Local student profile"

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hub-accent-soft grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border text-sm font-semibold">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt="" className="size-full object-cover" />
            ) : (
              profileInitials
            )}
          </span>
          <div className="grid min-w-0 gap-1">
            <Popover.Title className="truncate font-semibold text-[var(--hub-text)]">
              {profile.name || "Student Hub"}
            </Popover.Title>
            <Popover.Description className="truncate text-xs leading-4 text-[var(--hub-muted-text)]">
              {profileMeta}
            </Popover.Description>
          </div>
        </div>
        <Popover.Close
          aria-label="Close profile menu"
          className="hub-focus grid size-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-white/[0.08] hover:text-zinc-100"
        >
          <X className="size-4" aria-hidden="true" />
        </Popover.Close>
      </div>

      <div className="mt-3 grid gap-1">
        <ProfileMenuLink href="/profile" icon={UserRound} label="View Profile" />
        <ProfileMenuLink href="/settings" icon={Settings} label="Settings" />
      </div>
    </div>
  )
}

function ProfileMenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon
  label: string
}) {
  return (
    <Link
      href={href}
      onClick={() => headerPopover.close()}
      className="hub-focus flex h-11 items-center gap-2.5 rounded-xl px-3 text-zinc-300 transition-[color,background-color,transform] duration-150 ease-out hover:translate-x-0.5 hover:bg-white/[0.07] hover:text-zinc-100"
    >
      <Icon className="size-4 text-[var(--hub-accent)]" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      <ArrowRight className="size-4 text-zinc-600" aria-hidden="true" />
    </Link>
  )
}

function NavbarSearch({
  onSearchFocus,
  openResult,
  query,
  results,
  setQuery,
}: {
  onSearchFocus: () => void
  openResult: (result: SearchResult) => void
  query: string
  results: SearchResult[]
  setQuery: (query: string) => void
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRootRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const resultsId = useId()
  const hasSearchQuery = query.trim().length >= 2

  useEffect(() => {
    if (!searchOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (!searchRootRef.current?.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        setSearchOpen(false)
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [searchOpen])

  return (
    <div ref={searchRootRef} className="relative min-w-0 flex-1">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
        aria-hidden="true"
      />
      <Input
        ref={searchInputRef}
        aria-label="Search Student Hub"
        aria-autocomplete="list"
        aria-controls={searchOpen && hasSearchQuery ? resultsId : undefined}
        aria-expanded={searchOpen && hasSearchQuery}
        role="combobox"
        placeholder="Search Student Hub"
        value={query}
        onFocus={() => {
          onSearchFocus()
          setSearchOpen(hasSearchQuery)
        }}
        onChange={(event) => {
          const nextQuery = event.target.value
          setQuery(nextQuery)
          setSearchOpen(nextQuery.trim().length >= 2)
        }}
        className="h-10 rounded-2xl pl-9 pr-4"
      />
      {searchOpen && hasSearchQuery ? (
        <div
          id={resultsId}
          role="region"
          aria-label="Search results"
          className="hub-widget-popover absolute left-0 right-0 top-12 z-[80] overflow-hidden rounded-[1.4rem]"
        >
          {results.length > 0 ? (
            <div className="grid max-h-80 gap-1 overflow-y-auto p-2">
              {results.map((result) => {
                const Icon = result.icon

                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      openResult(result)
                    }}
                    className="hub-focus flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-300 transition-colors duration-150 hover:bg-white/[0.06] hover:text-zinc-100 focus-visible:bg-white/[0.06]"
                  >
                    <span className="hub-accent-soft flex size-9 shrink-0 items-center justify-center rounded-xl border">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="grid min-w-0 gap-1">
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

function getProfileInitials(profile: StudentProfile) {
  return (
    profile.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SH"
  )
}
