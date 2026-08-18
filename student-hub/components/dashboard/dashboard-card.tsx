import type { ComponentProps, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardWidgetEmphasis } from "@/lib/dashboard"
import { cn } from "@/lib/utils"

type DashboardCardProps = {
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  description: string
  emphasis?: DashboardWidgetEmphasis
  headerProps?: ComponentProps<"div"> & {
    "data-drag-handle"?: string
  }
  icon: LucideIcon
  title: string
}

export function DashboardCard({
  actions,
  children,
  className,
  contentClassName,
  description,
  emphasis = "standard",
  headerProps,
  icon: Icon,
  title,
}: DashboardCardProps) {
  return (
    <Card
      data-widget-emphasis={emphasis}
      className={cn(
        "hub-glass group/card h-full overflow-visible rounded-[1.65rem] transition-[border-color,background-color,box-shadow] duration-200 ease-out",
        emphasis === "primary" &&
          "border-[var(--hub-accent-border)] hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-[var(--hub-accent-glow)]",
        emphasis === "standard" &&
          "hover:border-white/20 hover:bg-white/[0.075] hover:shadow-2xl hover:shadow-black/20",
        emphasis === "quiet" &&
          "border-white/[0.09] bg-white/[0.045] shadow-lg shadow-black/10 hover:border-white/15 hover:bg-white/[0.065]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
      <CardHeader
        {...headerProps}
        className={cn(
          "relative flex-row flex-nowrap items-center gap-3",
          headerProps?.className
        )}
      >
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl border transition-[color,background-color,border-color,transform] duration-200 ease-out group-hover/card:scale-105",
            emphasis === "primary" &&
              "hub-accent-soft group-hover/card:bg-[var(--hub-accent-muted)]",
            emphasis === "standard" &&
              "hub-glass-control text-zinc-300 group-hover/card:border-[var(--hub-accent-border)] group-hover/card:text-[var(--hub-accent)]",
            emphasis === "quiet" &&
              "border-white/10 bg-white/[0.04] text-zinc-400 group-hover/card:bg-white/[0.07] group-hover/card:text-zinc-200"
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="grid min-w-0 flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {actions}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}
