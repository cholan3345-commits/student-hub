"use client"

import { useCallback, useMemo } from "react"

import { navigationItems } from "@/components/navigation"
import {
  STORAGE_KEYS,
  type BackgroundPreferences,
  type NavbarControlId,
  type NavbarPreferences,
  type SidebarPreferences,
  type WorkspacePreferences,
} from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export const NAVBAR_CONTROLS: Array<{ id: NavbarControlId; label: string }> = [
  { id: "search", label: "Search" },
  { id: "notifications", label: "Notifications" },
  { id: "profile", label: "Profile" },
]

const DEFAULT_NAVBAR_ORDER = NAVBAR_CONTROLS.map((control) => control.id)
const DEFAULT_SIDEBAR_ORDER = navigationItems.map((item) => item.href)

const defaultWorkspacePreferences: WorkspacePreferences = {
  background: {
    blur: 0,
    color: "#080b12",
    mode: "solid",
    transparency: 0,
    wallpaperDataUrl: "",
  },
  navbar: {
    hidden: [],
    order: DEFAULT_NAVBAR_ORDER,
  },
  sidebar: {
    collapsed: true,
    hidden: [],
    order: DEFAULT_SIDEBAR_ORDER,
    pinned: ["/"],
    width: 256,
  },
}

export function useWorkspacePreferences() {
  const [storedPreferences, setStoredPreferences] = useLocalStorage<WorkspacePreferences>(
    STORAGE_KEYS.workspacePreferences,
    defaultWorkspacePreferences
  )
  const preferences = useMemo(
    () => normalizeWorkspacePreferences(storedPreferences),
    [storedPreferences]
  )

  const updatePreferences = useCallback(
    (updater: (current: WorkspacePreferences) => WorkspacePreferences) => {
      setStoredPreferences((current) =>
        normalizeWorkspacePreferences(updater(normalizeWorkspacePreferences(current)))
      )
    },
    [setStoredPreferences]
  )

  const updateSidebar = useCallback(
    (updates: Partial<SidebarPreferences>) => {
      updatePreferences((current) => ({
        ...current,
        sidebar: {
          ...current.sidebar,
          ...updates,
        },
      }))
    },
    [updatePreferences]
  )

  const updateNavbar = useCallback(
    (updates: Partial<NavbarPreferences>) => {
      updatePreferences((current) => ({
        ...current,
        navbar: {
          ...current.navbar,
          ...updates,
        },
      }))
    },
    [updatePreferences]
  )

  const updateBackground = useCallback(
    (updates: Partial<BackgroundPreferences>) => {
      updatePreferences((current) => ({
        ...current,
        background: {
          ...current.background,
          ...updates,
        },
      }))
    },
    [updatePreferences]
  )

  const moveSidebarItem = useCallback(
    (href: string, direction: "down" | "up") => {
      updateSidebar({
        order: moveInArray(
          preferences.sidebar.order,
          href,
          direction === "up" ? -1 : 1
        ),
      })
    },
    [preferences.sidebar.order, updateSidebar]
  )

  const moveNavbarControl = useCallback(
    (controlId: NavbarControlId, direction: "down" | "up") => {
      updateNavbar({
        order: moveInArray(
          preferences.navbar.order,
          controlId,
          direction === "up" ? -1 : 1
        ),
      })
    },
    [preferences.navbar.order, updateNavbar]
  )

  const toggleSidebarHidden = useCallback(
    (href: string) => {
      if (href === "/") {
        return
      }

      updateSidebar({
        hidden: toggleValue(preferences.sidebar.hidden, href),
      })
    },
    [preferences.sidebar.hidden, updateSidebar]
  )

  const toggleSidebarPinned = useCallback(
    (href: string) => {
      updateSidebar({
        pinned: toggleValue(preferences.sidebar.pinned, href),
      })
    },
    [preferences.sidebar.pinned, updateSidebar]
  )

  const toggleNavbarHidden = useCallback(
    (controlId: NavbarControlId) => {
      updateNavbar({
        hidden: toggleValue(preferences.navbar.hidden, controlId),
      })
    },
    [preferences.navbar.hidden, updateNavbar]
  )

  return {
    moveNavbarControl,
    moveSidebarItem,
    preferences,
    toggleNavbarHidden,
    toggleSidebarHidden,
    toggleSidebarPinned,
    updateBackground,
    updateNavbar,
    updateSidebar,
  }
}

export function normalizeWorkspacePreferences(
  preferences: WorkspacePreferences
): WorkspacePreferences {
  const sidebarOrder = mergeOrder(preferences.sidebar?.order, DEFAULT_SIDEBAR_ORDER)
  const navbarOrder = mergeOrder(preferences.navbar?.order, DEFAULT_NAVBAR_ORDER)

  return {
    background: {
      ...defaultWorkspacePreferences.background,
      ...preferences.background,
      blur: clamp(Number(preferences.background?.blur ?? 0), 0, 24),
      transparency: clamp(Number(preferences.background?.transparency ?? 0), 0, 85),
    },
    navbar: {
      hidden: (preferences.navbar?.hidden ?? []).filter((item) =>
        DEFAULT_NAVBAR_ORDER.includes(item)
      ),
      order: navbarOrder,
    },
    sidebar: {
      collapsed: Boolean(preferences.sidebar?.collapsed),
      hidden: (preferences.sidebar?.hidden ?? []).filter(
        (href) => href !== "/" && DEFAULT_SIDEBAR_ORDER.includes(href)
      ),
      order: sidebarOrder,
      pinned: (preferences.sidebar?.pinned ?? []).filter((href) =>
        DEFAULT_SIDEBAR_ORDER.includes(href)
      ),
      width: clamp(Number(preferences.sidebar?.width ?? 256), 176, 320),
    },
  }
}

function mergeOrder<T extends string>(current: T[] | undefined, fallback: T[]) {
  const validCurrent = (current ?? []).filter((item) => fallback.includes(item))
  const missing = fallback.filter((item) => !validCurrent.includes(item))

  return [...validCurrent, ...missing]
}

function moveInArray<T>(items: T[], item: T, offset: number) {
  const currentIndex = items.indexOf(item)

  if (currentIndex < 0) {
    return items
  }

  const nextIndex = clamp(currentIndex + offset, 0, items.length - 1)

  if (nextIndex === currentIndex) {
    return items
  }

  const nextItems = [...items]
  const [movedItem] = nextItems.splice(currentIndex, 1)
  nextItems.splice(nextIndex, 0, movedItem)

  return nextItems
}

function toggleValue<T>(items: T[], value: T) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
