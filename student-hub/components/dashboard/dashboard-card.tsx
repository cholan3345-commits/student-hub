import type { ComponentProps, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DashboardCardProps = {
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  description: string
  headerProps?: ComponentProps<"div">
  icon: LucideIcon
  title: string
}

export function DashboardCard({
  actions,
  children,
  className,
  contentClassName,
  description,
  headerProps,
  icon: Icon,
  title,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "group/card h-full transition duration-200 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[0.055] hover:shadow-2xl hover:shadow-blue-950/20",
        className
      )}
    >
      <CardHeader
        {...headerProps}
        className={cn("flex-row items-start gap-4", headerProps?.className)}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300 transition group-hover/card:scale-105 group-hover/card:bg-blue-500/15">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {actions}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}
