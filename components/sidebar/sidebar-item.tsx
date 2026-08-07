import Link from "next/link"
import { Star } from "lucide-react"

import type { NavigationItem } from "@/components/navigation"
import { cn } from "@/lib/utils"

type SidebarItemProps = {
  active: boolean
  expanded: boolean
  item: NavigationItem
  pinned: boolean
}

export function SidebarItem({ active, expanded, item, pinned }: SidebarItemProps) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={item.title}
      title={item.title}
      className={cn(
        "group/navitem relative flex h-11 w-full items-center gap-3 rounded-xl px-2 text-zinc-500 outline-none transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-zinc-100 hover:shadow-lg hover:shadow-black/20 focus-visible:bg-white/[0.06] focus-visible:text-zinc-100 focus-visible:ring-2 focus-visible:ring-blue-500/35",
        active &&
          "bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-950/30 hover:bg-blue-500/20 hover:text-blue-200"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 h-6 w-1 rounded-r-full bg-blue-400 opacity-0 transition duration-200",
          active && "opacity-100"
        )}
      />
      <span className="flex size-7 shrink-0 items-center justify-center">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm font-medium transition duration-200",
          expanded
            ? "translate-x-0 opacity-100"
            : "translate-x-1 opacity-0 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100"
        )}
      >
        {item.title}
      </span>
      {pinned ? (
        <Star
          className={cn(
            "size-3.5 shrink-0 fill-blue-300 text-blue-300 transition",
            expanded ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"
          )}
          aria-hidden="true"
        />
      ) : null}
      <span
        className={cn(
          "pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#111827] px-2.5 py-1.5 text-xs font-medium text-zinc-100 opacity-0 shadow-xl shadow-black/30 transition group-focus-visible/navitem:opacity-100",
          expanded && "hidden"
        )}
      >
        {item.title}
      </span>
    </Link>
  )
}
