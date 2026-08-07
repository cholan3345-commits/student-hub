"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { navigationItems } from "@/components/navigation"
import { SidebarItem } from "@/components/sidebar/sidebar-item"
import { useWorkspacePreferences } from "@/hooks/use-workspace-preferences"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const { preferences, updateSidebar } = useWorkspacePreferences()
  const expanded = !preferences.sidebar.collapsed
  const sidebarWidth = expanded ? preferences.sidebar.width : 64
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

  return (
    <aside
      className="group/sidebar fixed bottom-0 left-0 top-[92px] z-40 overflow-visible border-r border-white/10 bg-[var(--hub-panel-bg)] shadow-2xl shadow-black/30 backdrop-blur transition-[width] duration-300 ease-out sm:top-20 lg:top-[72px]"
      style={{ width: sidebarWidth }}
    >
      <nav
        aria-label="Student Hub tools"
        className="flex h-full flex-col gap-2 overflow-y-auto overflow-x-visible px-2 py-4"
      >
        <button
          type="button"
          onClick={() => updateSidebar({ collapsed: !preferences.sidebar.collapsed })}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(
            "mb-1 flex h-11 w-full items-center gap-3 rounded-xl px-2 text-zinc-400 outline-none transition hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-blue-200 focus-visible:ring-2 focus-visible:ring-blue-500/35",
            expanded && "justify-start"
          )}
        >
          <span className="flex size-7 shrink-0 items-center justify-center">
            {expanded ? (
              <PanelLeftClose className="size-5" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="size-5" aria-hidden="true" />
            )}
          </span>
          <span
            className={cn(
              "truncate text-sm font-medium transition",
              expanded
                ? "opacity-100"
                : "opacity-0 group-hover/sidebar:opacity-100"
            )}
          >
            {expanded ? "Collapse" : "Expand"}
          </span>
        </button>

        {orderedItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const hidden = preferences.sidebar.hidden.includes(item.href)

          if (hidden && !active) {
            return null
          }

          return (
            <SidebarItem
              key={item.href}
              item={item}
              active={active}
              expanded={expanded}
              pinned={preferences.sidebar.pinned.includes(item.href)}
            />
          )
        })}
      </nav>
    </aside>
  )
}
