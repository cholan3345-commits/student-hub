"use client"

import { Fragment, useMemo } from "react"
import { usePathname } from "next/navigation"
import { GraduationCap, PanelLeftClose, PanelLeftOpen } from "lucide-react"

import {
  isNavigationItemActive,
  navigationItems,
} from "@/components/navigation"
import { SidebarItem } from "@/components/sidebar/sidebar-item"
import { useWorkspacePreferences } from "@/hooks/use-workspace-preferences"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const { preferences, updateSidebar } = useWorkspacePreferences()
  const expanded = !preferences.sidebar.collapsed
  const orderedItems = useMemo(() => {
    const byHref = new Map(navigationItems.map((item) => [item.href, item]))

    return preferences.sidebar.order
      .map((href) => byHref.get(href))
      .filter((item): item is (typeof navigationItems)[number] => Boolean(item))
      .sort((a, b) => {
        const aPinned = preferences.sidebar.pinned.includes(a.href)
        const bPinned = preferences.sidebar.pinned.includes(b.href)

        if (aPinned === bPinned) {
          return 0
        }

        return aPinned ? -1 : 1
      })
  }, [preferences.sidebar.order, preferences.sidebar.pinned])
  const visibleItems = orderedItems.filter(
    (item) =>
      !preferences.sidebar.hidden.includes(item.href) ||
      isNavigationItemActive(item, pathname)
  )

  return (
    <aside
      className="hub-glass-strong group/sidebar fixed bottom-3 left-3 top-[7.25rem] z-40 w-16 overflow-visible rounded-[1.6rem] transition-[width] duration-[220ms] ease-out sm:top-[6.75rem] lg:top-3 lg:w-[var(--student-sidebar-width)]"
    >
      <nav
        aria-label="Student Hub tools"
        className={cn(
          "flex h-full flex-col gap-1.5 overflow-y-auto overflow-x-hidden px-2 py-3 scrollbar-thin",
          expanded && "lg:px-3"
        )}
      >
        <div
          data-sidebar-brand
          className={cn(
            "mb-2 flex h-11 min-w-0 items-center justify-center",
            expanded && "lg:justify-start lg:gap-2.5 lg:px-2"
          )}
        >
          <span className="hub-accent-soft flex size-10 shrink-0 items-center justify-center rounded-2xl border">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          {expanded ? (
            <span className="hidden min-w-0 gap-1 lg:grid">
              <span className="block truncate text-sm font-semibold text-[var(--hub-text)]">
                Student Hub
              </span>
              <span className="block truncate text-xs leading-4 text-[var(--hub-muted-text)]">
                Study OS
              </span>
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => updateSidebar({ collapsed: !preferences.sidebar.collapsed })}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(
            "hub-focus mb-1 flex h-11 w-full items-center justify-center rounded-2xl px-0 text-zinc-400 transition-[color,background-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-[var(--hub-accent)]",
            expanded && "lg:justify-start lg:gap-2.5 lg:px-2"
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center">
            {expanded ? (
              <PanelLeftClose className="size-5" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="size-5" aria-hidden="true" />
            )}
          </span>
          {expanded ? (
            <span className="hidden truncate text-sm font-medium lg:block">
              Collapse
            </span>
          ) : null}
        </button>

        {visibleItems.map((item, index) => {
          const active = isNavigationItemActive(item, pathname)
          const startsSection =
            index > 0 && visibleItems[index - 1].section !== item.section

          return (
            <Fragment key={item.href}>
              {startsSection ? (
                <div
                  aria-hidden="true"
                  className="mx-2 my-1 h-px shrink-0 bg-white/[0.08]"
                />
              ) : null}
              <SidebarItem
                item={item}
                active={active}
                expanded={expanded}
                pinned={preferences.sidebar.pinned.includes(item.href)}
              />
            </Fragment>
          )
        })}
      </nav>
    </aside>
  )
}
