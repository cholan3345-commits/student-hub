import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "hub-glass-control flex min-h-28 w-full min-w-0 resize-y rounded-xl px-3 py-2 text-sm leading-6 text-[var(--hub-text)] shadow-sm shadow-black/20 outline-none backdrop-blur transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-out placeholder:text-[var(--hub-muted-text)] focus-visible:border-[var(--hub-accent-border)] focus-visible:ring-2 focus-visible:ring-[var(--hub-accent-ring)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
