import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-6 text-zinc-100 shadow-sm shadow-black/20 outline-none transition placeholder:text-zinc-500 focus-visible:border-blue-400/60 focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

