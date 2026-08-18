"use client"

import type { ComponentProps, ReactNode } from "react"
import { Popover } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

type PopupProps = Omit<ComponentProps<typeof Popover.Popup>, "className"> &
  { className?: string } &
  Record<`data-${string}`, string | number | boolean | undefined>

type HubPopoverContentProps = {
  align?: "center" | "end" | "start"
  children: ReactNode
  popupProps?: PopupProps
  positionerClassName?: string
  sideOffset?: number
}

export function HubPopoverContent({
  align = "end",
  children,
  popupProps,
  positionerClassName,
  sideOffset = 8,
}: HubPopoverContentProps) {
  const { className, ...restPopupProps } = popupProps ?? {}

  return (
    <Popover.Portal>
      <Popover.Positioner
        positionMethod="fixed"
        side="bottom"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        collisionAvoidance={{
          align: "shift",
          fallbackAxisSide: "none",
          side: "flip",
        }}
        className={cn("outline-none", positionerClassName)}
      >
        <Popover.Popup
          {...restPopupProps}
          className={cn(
            "hub-widget-popover origin-[var(--transform-origin)] rounded-2xl text-sm outline-none transition-[transform,opacity] duration-[180ms] ease-out data-ending-style:translate-y-1 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:translate-y-1 data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            className
          )}
        >
          {children}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  )
}
