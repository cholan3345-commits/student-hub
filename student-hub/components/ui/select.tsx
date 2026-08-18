import * as React from "react"

import { cn } from "@/lib/utils"

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "hub-glass-control flex h-10 w-full min-w-0 rounded-xl px-3 py-2 text-sm text-[var(--hub-text)] shadow-sm shadow-black/20 outline-none backdrop-blur transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-out focus-visible:border-[var(--hub-accent-border)] focus-visible:ring-2 focus-visible:ring-[var(--hub-accent-ring)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export { Select }
