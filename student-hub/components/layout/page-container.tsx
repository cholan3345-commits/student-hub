import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageContainerProps = {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[92rem] overflow-x-hidden px-3 py-5 sm:px-5 lg:px-7 xl:px-8",
        className
      )}
    >
      {children}
    </div>
  )
}
