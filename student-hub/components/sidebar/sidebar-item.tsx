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
        "hub-focus relative flex h-11 w-full items-center justify-center rounded-2xl px-0 text-zinc-500 transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-zinc-100 hover:shadow-lg hover:shadow-black/20 focus-visible:bg-white/[0.08] focus-visible:text-zinc-100",
        expanded && "lg:justify-start lg:gap-2.5 lg:px-2",
        active &&
          "border border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)] text-[var(--hub-accent)] shadow-lg shadow-[var(--hub-accent-glow)] hover:bg-[var(--hub-accent-muted)]"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 h-6 w-0.5 rounded-r-full bg-[var(--hub-accent)] opacity-0 shadow-[0_0_14px_var(--hub-accent)] transition-opacity duration-200",
          active && "opacity-100"
        )}
      />
      <span className="flex size-8 shrink-0 items-center justify-center">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      {expanded ? (
        <span className="hidden min-w-0 flex-1 truncate text-sm font-medium lg:block">
          {item.title}
        </span>
      ) : null}
      {expanded && pinned ? (
        <Star
          className="hidden size-3.5 shrink-0 fill-[var(--hub-accent)] text-[var(--hub-accent)] lg:block"
          aria-hidden="true"
        />
      ) : null}
    </Link>
  )
}
