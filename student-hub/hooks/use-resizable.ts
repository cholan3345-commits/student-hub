"use client"

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react"

export type ResizeDirection = "e" | "n" | "ne" | "nw" | "s" | "se" | "sw" | "w"

type UseResizableOptions = {
  colSpan: number
  disabled?: boolean
  maxColSpan?: number
  maxRowSpan?: number
  minColSpan?: number
  minRowSpan?: number
  onResize: (colSpan: number, rowSpan: number) => void
  onResizeEnd?: () => void
  onResizeStart?: () => void
  rowStep?: number
}

type ResizePoint = {
  clientX: number
  clientY: number
}

type ResizeSession = {
  colSpan: number
  columnStep: number
  direction: ResizeDirection
  handle: HTMLElement
  lastColSpan: number
  lastRowSpan: number
  maxHeight: number
  maxWidth: number
  minHeight: number
  minWidth: number
  overlay: HTMLElement | null
  pointerId: number
  pointerX: number
  pointerY: number
  rect: DOMRect
  rowSpan: number
  rowStep: number
  source: HTMLElement
}

const FALLBACK_COLUMN_STEP = 112
const DEFAULT_ROW_STEP = 80

const resizeCursors: Record<ResizeDirection, CSSProperties["cursor"]> = {
  e: "ew-resize",
  n: "ns-resize",
  ne: "nesw-resize",
  nw: "nwse-resize",
  s: "ns-resize",
  se: "nwse-resize",
  sw: "nesw-resize",
  w: "ew-resize",
}

const resizeLabels: Record<ResizeDirection, string> = {
  e: "right edge",
  n: "top edge",
  ne: "top-right corner",
  nw: "top-left corner",
  s: "bottom edge",
  se: "bottom-right corner",
  sw: "bottom-left corner",
  w: "left edge",
}

export function useResizable({
  colSpan,
  disabled,
  maxColSpan = 12,
  maxRowSpan = 12,
  minColSpan = 2,
  minRowSpan = 2,
  onResize,
  onResizeEnd,
  onResizeStart,
  rowStep = DEFAULT_ROW_STEP,
}: UseResizableOptions) {
  const sessionRef = useRef<ResizeSession | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const pendingPointRef = useRef<ResizePoint | null>(null)
  const documentStyleRef = useRef<{ cursor: string; userSelect: string } | null>(null)
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null)

  useEffect(() => {
    return () => {
      const session = sessionRef.current

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }

      if (session) {
        removeResizePreview(session)

        try {
          if (session.handle.hasPointerCapture(session.pointerId)) {
            session.handle.releasePointerCapture(session.pointerId)
          }
        } catch {
          // The browser can release capture before a component unmounts.
        }
      }

      restoreDocumentInteraction()
    }
  }, [])

  function restoreDocumentInteraction() {
    if (!documentStyleRef.current) {
      return
    }

    document.documentElement.style.cursor = documentStyleRef.current.cursor
    document.body.style.userSelect = documentStyleRef.current.userSelect
    documentStyleRef.current = null
  }

  function setResizingDocumentInteraction(direction: ResizeDirection) {
    if (!documentStyleRef.current) {
      documentStyleRef.current = {
        cursor: document.documentElement.style.cursor,
        userSelect: document.body.style.userSelect,
      }
    }

    document.documentElement.style.cursor = resizeCursors[direction] ?? "default"
    document.body.style.userSelect = "none"
  }

  function createResizePreview(session: ResizeSession) {
    const overlay = session.source.cloneNode(true) as HTMLElement

    overlay.removeAttribute("data-dashboard-widget")
    overlay.removeAttribute("data-drag-id")
    overlay.removeAttribute("data-resize-source-active")
    overlay.setAttribute("aria-hidden", "true")
    overlay.setAttribute("data-resize-overlay", "true")
    overlay.inert = true
    Object.assign(overlay.style, {
      animation: "none",
      contain: "layout paint style",
      gridColumn: "auto",
      height: `${session.rect.height}px`,
      left: "0",
      margin: "0",
      minHeight: "0",
      pointerEvents: "none",
      position: "fixed",
      top: "0",
      transform: `translate3d(${session.rect.left}px, ${session.rect.top}px, 0)`,
      transition: "none",
      width: `${session.rect.width}px`,
      willChange: "transform,width,height",
      zIndex: "60",
    })

    session.source.setAttribute("data-resize-source-active", "true")
    document.body.appendChild(overlay)
    session.overlay = overlay
  }

  function removeResizePreview(session: ResizeSession) {
    session.overlay?.remove()
    session.source.removeAttribute("data-resize-source-active")
    session.overlay = null
  }

  function getColumnStep(handle: HTMLElement) {
    const grid = handle.closest<HTMLElement>("[data-dashboard-grid]")

    if (!grid) {
      return FALLBACK_COLUMN_STEP
    }

    const style = window.getComputedStyle(grid)
    const gap = Number.parseFloat(style.columnGap) || 0
    const width = grid.getBoundingClientRect().width
    const trackWidth = (width - gap * Math.max(0, maxColSpan - 1)) / maxColSpan

    return Math.max(24, trackWidth + gap)
  }

  function applyResize(clientX: number, clientY: number) {
    const session = sessionRef.current

    if (!session || disabled) {
      return
    }

    const horizontalDelta = getDirectionalDelta(
      session.direction,
      clientX,
      session.pointerX,
      "horizontal"
    )
    const verticalDelta = getDirectionalDelta(
      session.direction,
      clientY,
      session.pointerY,
      "vertical"
    )
    const width = session.direction === "n" || session.direction === "s"
      ? session.rect.width
      : clamp(
          session.rect.width + horizontalDelta,
          session.minWidth,
          session.maxWidth
        )
    const height = session.direction === "e" || session.direction === "w"
      ? session.rect.height
      : clamp(
          session.rect.height + verticalDelta,
          session.minHeight,
          session.maxHeight
        )
    const left = session.direction.includes("w")
      ? session.rect.right - width
      : session.rect.left
    const top = session.direction.includes("n")
      ? session.rect.bottom - height
      : session.rect.top

    if (session.overlay) {
      session.overlay.style.width = `${width}px`
      session.overlay.style.height = `${height}px`
      session.overlay.style.transform = `translate3d(${left}px, ${top}px, 0)`
    }

    const snappedHorizontalDelta = width - session.rect.width
    const snappedVerticalDelta = height - session.rect.height
    const nextColSpan = clamp(
      session.colSpan + Math.round(snappedHorizontalDelta / session.columnStep),
      minColSpan,
      maxColSpan
    )
    const nextRowSpan = clamp(
      session.rowSpan + Math.round(snappedVerticalDelta / session.rowStep),
      minRowSpan,
      maxRowSpan
    )

    if (
      nextColSpan === session.lastColSpan &&
      nextRowSpan === session.lastRowSpan
    ) {
      return
    }

    session.lastColSpan = nextColSpan
    session.lastRowSpan = nextRowSpan
    onResize(nextColSpan, nextRowSpan)
  }

  function flushResize() {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const point = pendingPointRef.current
    pendingPointRef.current = null

    if (point) {
      applyResize(point.clientX, point.clientY)
    }
  }

  function scheduleResize(clientX: number, clientY: number) {
    pendingPointRef.current = { clientX, clientY }

    if (animationFrameRef.current !== null) {
      return
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null
      const point = pendingPointRef.current
      pendingPointRef.current = null

      if (point) {
        applyResize(point.clientX, point.clientY)
      }
    })
  }

  function startResizing(
    direction: ResizeDirection,
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (
      disabled ||
      sessionRef.current ||
      event.pointerType === "touch" ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return
    }

    const widget = event.currentTarget.closest<HTMLElement>("[data-dashboard-widget]")
    const grid = widget?.closest<HTMLElement>("[data-dashboard-grid]") ?? null
    const rect = widget?.getBoundingClientRect()

    if (!widget || !rect) {
      return
    }

    const effectiveColSpan = clamp(colSpan, minColSpan, maxColSpan)
    const effectiveRowSpan = clamp(
      Math.round(rect.height / rowStep),
      minRowSpan,
      maxRowSpan
    )
    const gridRect = grid?.getBoundingClientRect() ?? null
    const columnStep = getColumnStep(event.currentTarget)
    const minWidth = Math.max(
      160,
      rect.width + (minColSpan - effectiveColSpan) * columnStep
    )
    const unconstrainedMaxWidth =
      rect.width +
      (maxColSpan - effectiveColSpan) * columnStep
    const boundaryMaxWidth = direction.includes("w")
      ? rect.right - (gridRect?.left ?? 0)
      : direction.includes("e") && gridRect
        ? gridRect.right - rect.left
        : unconstrainedMaxWidth
    const minHeight = Math.max(
      160,
      rect.height + (minRowSpan - effectiveRowSpan) * rowStep
    )
    const unconstrainedMaxHeight =
      rect.height + (maxRowSpan - effectiveRowSpan) * rowStep
    const boundaryMaxHeight = direction.includes("n")
      ? rect.bottom - (gridRect?.top ?? 0)
      : unconstrainedMaxHeight

    const session: ResizeSession = {
      colSpan: effectiveColSpan,
      columnStep,
      direction,
      handle: event.currentTarget,
      lastColSpan: effectiveColSpan,
      lastRowSpan: effectiveRowSpan,
      maxHeight: Math.max(minHeight, Math.min(unconstrainedMaxHeight, boundaryMaxHeight)),
      maxWidth: Math.max(minWidth, Math.min(unconstrainedMaxWidth, boundaryMaxWidth)),
      minHeight,
      minWidth,
      overlay: null,
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      rect,
      rowSpan: effectiveRowSpan,
      rowStep,
      source: widget,
    }
    sessionRef.current = session
    setResizeDirection(direction)
    setResizingDocumentInteraction(direction)
    onResizeStart?.()
    createResizePreview(session)

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // React pointer events continue while the handle remains targeted.
    }

    event.preventDefault()
    event.stopPropagation()
  }

  function moveResizing(event: ReactPointerEvent<HTMLElement>) {
    const session = sessionRef.current

    if (!session || session.pointerId !== event.pointerId || disabled) {
      return
    }

    scheduleResize(event.clientX, event.clientY)
    event.preventDefault()
    event.stopPropagation()
  }

  function stopResizing(event: ReactPointerEvent<HTMLElement>) {
    const session = sessionRef.current

    if (!session || session.pointerId !== event.pointerId) {
      return
    }

    pendingPointRef.current = { clientX: event.clientX, clientY: event.clientY }
    flushResize()
    removeResizePreview(session)
    sessionRef.current = null
    setResizeDirection(null)
    restoreDocumentInteraction()

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    } catch {
      // Pointer capture may already be gone after cancellation.
    }

    onResizeEnd?.()
    event.preventDefault()
    event.stopPropagation()
  }

  function handleLostPointerCapture(event: ReactPointerEvent<HTMLElement>) {
    const session = sessionRef.current

    if (!session || session.pointerId !== event.pointerId) {
      return
    }

    flushResize()
    removeResizePreview(session)
    sessionRef.current = null
    setResizeDirection(null)
    restoreDocumentInteraction()
    onResizeEnd?.()
  }

  function getHandleProps(direction: ResizeDirection) {
    return {
      "aria-label": `Resize widget from ${resizeLabels[direction]}`,
      "aria-orientation":
        direction === "e" || direction === "w"
          ? ("vertical" as const)
          : ("horizontal" as const),
      "data-resize-direction": direction,
      onLostPointerCapture: handleLostPointerCapture,
      onPointerCancel: stopResizing,
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) =>
        startResizing(direction, event),
      onPointerMove: moveResizing,
      onPointerUp: stopResizing,
      role: "separator",
      style: {
        cursor: resizeCursors[direction],
      } satisfies CSSProperties,
      tabIndex: -1,
    }
  }

  return {
    getHandleProps,
    isResizing: resizeDirection !== null,
    resizeDirection,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getDirectionalDelta(
  direction: ResizeDirection,
  current: number,
  start: number,
  axis: "horizontal" | "vertical"
) {
  if (axis === "horizontal") {
    if (direction.includes("e")) {
      return current - start
    }

    if (direction.includes("w")) {
      return start - current
    }

    return 0
  }

  if (direction.includes("s")) {
    return current - start
  }

  if (direction.includes("n")) {
    return start - current
  }

  return 0
}
