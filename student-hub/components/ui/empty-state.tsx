import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  action?: ReactNode
  className?: string
  description: string
  icon: LucideIcon
  title: string
}

export function EmptyState({
  action,
  className,
  description,
  icon: Icon,
  title,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "hub-glass flex min-h-40 flex-col items-center justify-center gap-3 rounded-[1.4rem] border-dashed p-5 text-center sm:p-6",
        className
      )}
    >
      <div className="hub-accent-soft flex size-11 items-center justify-center rounded-2xl border">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="grid max-w-sm gap-1.5">
        <h3 className="text-sm font-semibold leading-5 text-[var(--hub-text)]">
          {title}
        </h3>
        <p className="text-sm leading-6 text-[var(--hub-muted-text)]">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
