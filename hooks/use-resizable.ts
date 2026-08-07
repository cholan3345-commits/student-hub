"use client"

import { useRef, useState, type CSSProperties, type PointerEvent } from "react"

type UseResizableOptions = {
  colSpan: number
  disabled?: boolean
  maxColSpan?: number
  maxRowSpan?: number
  minColSpan?: number
  minRowSpan?: number
  onResize: (colSpan: number, rowSpan: number) => void
  rowSpan: number
}

type ResizeStart = {
  colSpan: number
  pointerX: number
  pointerY: number
  rowSpan: number
}

const COLUMN_THRESHOLD = 112
const ROW_THRESHOLD = 92

export function useResizable({
  colSpan,
  disabled,
  maxColSpan = 12,
  maxRowSpan = 8,
  minColSpan = 2,
  minRowSpan = 2,
  onResize,
  rowSpan,
}: UseResizableOptions) {
  const startRef = useRef<ResizeStart | null>(null)
  const [isResizing, setIsResizing] = useState(false)

  function startResizing(event: PointerEvent<HTMLElement>) {
    if (disabled || event.button !== 0) {
      return
    }

    startRef.current = {
      colSpan,
      pointerX: event.clientX,
      pointerY: event.clientY,
      rowSpan,
    }
    setIsResizing(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  function moveResizing(event: PointerEvent<HTMLElement>) {
    const start = startRef.current

    if (!start || disabled) {
      return
    }

    const nextColSpan = clamp(
      start.colSpan + Math.round((event.clientX - start.pointerX) / COLUMN_THRESHOLD),
      minColSpan,
      maxColSpan
    )
    const nextRowSpan = clamp(
      start.rowSpan + Math.round((event.clientY - start.pointerY) / ROW_THRESHOLD),
      minRowSpan,
      maxRowSpan
    )

    if (nextColSpan !== colSpan || nextRowSpan !== rowSpan) {
      onResize(nextColSpan, nextRowSpan)
    }
  }

  function stopResizing(event: PointerEvent<HTMLElement>) {
    if (!startRef.current) {
      return
    }

    startRef.current = null
    setIsResizing(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleProps = {
    "aria-label": "Resize widget",
    onPointerCancel: stopResizing,
    onPointerDown: startResizing,
    onPointerMove: moveResizing,
    onPointerUp: stopResizing,
    role: "separator",
    style: { touchAction: "none" } satisfies CSSProperties,
  }

  return {
    handleProps,
    isResizing,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
