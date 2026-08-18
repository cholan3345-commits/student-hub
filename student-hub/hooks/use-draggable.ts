"use client"

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react"

type UseDraggableOptions = {
  boundarySelector?: string
  disabled?: boolean
  id: string
  onDragEnd?: () => void
  onDragStart?: () => void
  onMove: (draggedId: string, targetId: string) => void
  targetSelector: string
  topBoundarySelector?: string
  touchActivationDelay?: number
}

type DragInput = "pointer" | "touch"

type DragSession = {
  boundary: HTMLElement | null
  handle: HTMLElement
  height: number
  input: DragInput
  offsetX: number
  offsetY: number
  overlay: HTMLElement | null
  pointerId: number
  source: HTMLElement
  startX: number
  startY: number
  width: number
}

type DragPoint = {
  clientX: number
  clientY: number
}

const DESKTOP_MOVE_THRESHOLD = 2
const TOUCH_ACTIVATION_DELAY = 600
const TOUCH_SCROLL_THRESHOLD = 10
const INTERACTIVE_SELECTOR =
  "button,input,textarea,select,a,label,summary,[contenteditable='true'],[role='button'],[role='link'],[data-no-drag],[data-resize-handle]"

export function useDraggable({
  boundarySelector,
  disabled,
  id,
  onDragEnd,
  onDragStart,
  onMove,
  targetSelector,
  topBoundarySelector,
  touchActivationDelay = TOUCH_ACTIVATION_DELAY,
}: UseDraggableOptions) {
  const activeRef = useRef(false)
  const sessionRef = useRef<DragSession | null>(null)
  const activationTimerRef = useRef<number | null>(null)
  const listenerCleanupRef = useRef<(() => void) | null>(null)
  const lastTargetRef = useRef<string | null>(null)
  const suppressClickRef = useRef(false)
  const documentStyleRef = useRef<{ cursor: string; userSelect: string } | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const pendingPointRef = useRef<DragPoint | null>(null)
  const [isDragPending, setIsDragPending] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    return () => {
      if (activationTimerRef.current !== null) {
        window.clearTimeout(activationTimerRef.current)
      }

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }

      listenerCleanupRef.current?.()
      sessionRef.current?.overlay?.remove()
      sessionRef.current?.source.removeAttribute("data-drag-source-active")

      if (sessionRef.current?.input === "pointer") {
        try {
          if (sessionRef.current.handle.hasPointerCapture(sessionRef.current.pointerId)) {
            sessionRef.current.handle.releasePointerCapture(sessionRef.current.pointerId)
          }
        } catch {
          // The browser can release capture first when a pointer is cancelled.
        }
      }

      if (documentStyleRef.current) {
        document.documentElement.style.cursor = documentStyleRef.current.cursor
        document.body.style.userSelect = documentStyleRef.current.userSelect
      }
    }
  }, [])

  function clearActivationTimer() {
    if (activationTimerRef.current === null) {
      return
    }

    window.clearTimeout(activationTimerRef.current)
    activationTimerRef.current = null
  }

  function clearListeners() {
    listenerCleanupRef.current?.()
    listenerCleanupRef.current = null
  }

  function clearDragFrame() {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    pendingPointRef.current = null
  }

  function restoreDocumentInteraction() {
    if (!documentStyleRef.current) {
      return
    }

    document.documentElement.style.cursor = documentStyleRef.current.cursor
    document.body.style.userSelect = documentStyleRef.current.userSelect
    documentStyleRef.current = null
  }

  function removeDragPreview(session: DragSession) {
    session.overlay?.remove()
    session.source.removeAttribute("data-drag-source-active")
    session.overlay = null
  }

  function resetSession({ notifyDragEnd = false, suppressClick = false } = {}) {
    const session = sessionRef.current

    clearActivationTimer()
    clearListeners()
    clearDragFrame()

    if (session) {
      removeDragPreview(session)

      if (session.input === "pointer") {
        try {
          if (session.handle.hasPointerCapture(session.pointerId)) {
            session.handle.releasePointerCapture(session.pointerId)
          }
        } catch {
          // Pointer capture may already be gone after pointerup or cancellation.
        }
      }
    }

    const wasActive = activeRef.current
    activeRef.current = false
    sessionRef.current = null
    lastTargetRef.current = null
    setIsDragPending(false)
    setIsDragging(false)
    restoreDocumentInteraction()

    if (wasActive && notifyDragEnd) {
      onDragEnd?.()
    }

    if (wasActive && suppressClick) {
      suppressClickRef.current = true
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
    }
  }

  function shouldIgnoreDragStart(currentTarget: HTMLElement, target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return false
    }

    if (target.closest("[data-drag-allow]")) {
      return false
    }

    // A control can opt into using its whole surface as a handle (quick actions),
    // while controls nested inside a widget header remain fully interactive.
    if (currentTarget.matches(INTERACTIVE_SELECTOR)) {
      return false
    }

    return Boolean(target.closest(INTERACTIVE_SELECTOR))
  }

  function createSession({
    clientX,
    clientY,
    currentTarget,
    input,
    pointerId,
  }: {
    clientX: number
    clientY: number
    currentTarget: HTMLElement
    input: DragInput
    pointerId: number
  }) {
    const source = currentTarget.closest<HTMLElement>(targetSelector)

    if (!source) {
      return null
    }

    const rect = source.getBoundingClientRect()
    const boundary = boundarySelector
      ? source.closest<HTMLElement>(boundarySelector) ??
        document.querySelector<HTMLElement>(boundarySelector)
      : source.parentElement

    return {
      boundary,
      handle: currentTarget,
      height: rect.height,
      input,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
      overlay: null,
      pointerId,
      source,
      startX: clientX,
      startY: clientY,
      width: rect.width,
    } satisfies DragSession
  }

  function createDragPreview(session: DragSession) {
    const overlay = session.source.cloneNode(true) as HTMLElement

    overlay.removeAttribute("data-dashboard-widget")
    overlay.removeAttribute("data-quick-action")
    overlay.removeAttribute("data-drag-id")
    overlay.removeAttribute("data-drag-source-active")
    overlay.setAttribute("aria-hidden", "true")
    overlay.setAttribute("data-drag-overlay", "true")
    overlay.inert = true
    Object.assign(overlay.style, {
      animation: "none",
      contain: "layout paint style",
      height: `${session.height}px`,
      left: "0",
      margin: "0",
      opacity: "0.96",
      pointerEvents: "none",
      position: "fixed",
      top: "0",
      transition: "none",
      willChange: "transform",
      width: `${session.width}px`,
      zIndex: "60",
    })

    session.source.setAttribute("data-drag-source-active", "true")
    document.body.appendChild(overlay)
    session.overlay = overlay
  }

  function setDraggingDocumentInteraction() {
    if (!documentStyleRef.current) {
      documentStyleRef.current = {
        cursor: document.documentElement.style.cursor,
        userSelect: document.body.style.userSelect,
      }
    }

    document.documentElement.style.cursor = "grabbing"
    document.body.style.userSelect = "none"
  }

  function getConstrainedPosition(session: DragSession, clientX: number, clientY: number) {
    const boundaryRect = session.boundary?.getBoundingClientRect()
    const topBoundary = topBoundarySelector
      ? document.querySelector<HTMLElement>(topBoundarySelector)?.getBoundingClientRect()
      : null
    const naturalLeft = clientX - session.offsetX
    const naturalTop = clientY - session.offsetY

    if (!boundaryRect) {
      return { left: naturalLeft, top: naturalTop }
    }

    const minLeft = Math.max(0, boundaryRect.left)
    const maxLeft = Math.max(minLeft, boundaryRect.right - session.width)
    const minTop = Math.max(0, boundaryRect.top, (topBoundary?.bottom ?? 0) + 12)
    const maxTop = Math.max(minTop, boundaryRect.bottom - session.height)

    return {
      left: clamp(naturalLeft, minLeft, maxLeft),
      top: clamp(naturalTop, minTop, maxTop),
    }
  }

  function updateDragPreview(session: DragSession, clientX: number, clientY: number) {
    if (!session.overlay) {
      return
    }

    const { left, top } = getConstrainedPosition(session, clientX, clientY)
    session.overlay.style.transform = `translate3d(${left}px, ${top}px, 0)`
  }

  function moveOverTarget(clientX: number, clientY: number) {
    const target = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>(targetSelector)
    const targetId = target?.dataset.dragId

    if (!targetId || targetId === id) {
      lastTargetRef.current = null
      return
    }

    if (targetId === lastTargetRef.current) {
      return
    }

    lastTargetRef.current = targetId
    onMove(id, targetId)
  }

  function activateDrag(session: DragSession, clientX: number, clientY: number) {
    if (activeRef.current || disabled || sessionRef.current !== session) {
      return
    }

    clearActivationTimer()
    activeRef.current = true
    suppressClickRef.current = true
    setIsDragPending(false)
    setIsDragging(true)
    createDragPreview(session)
    setDraggingDocumentInteraction()
    updateDragPreview(session, clientX, clientY)
    onDragStart?.()
  }

  function updateActiveDrag(clientX: number, clientY: number) {
    const session = sessionRef.current

    if (!session || !activeRef.current || disabled) {
      return
    }

    updateDragPreview(session, clientX, clientY)
    moveOverTarget(clientX, clientY)
  }

  function flushActiveDrag() {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = null
    const point = pendingPointRef.current
    pendingPointRef.current = null

    if (point) {
      updateActiveDrag(point.clientX, point.clientY)
    }
  }

  function scheduleActiveDrag(clientX: number, clientY: number) {
    pendingPointRef.current = { clientX, clientY }

    if (animationFrameRef.current !== null) {
      return
    }

    animationFrameRef.current = window.requestAnimationFrame(flushActiveDrag)
  }

  function bindPointerListeners(session: DragSession) {
    function handlePointerMove(event: globalThis.PointerEvent) {
      if (event.pointerId !== session.pointerId || sessionRef.current !== session) {
        return
      }

      if (event.buttons === 0) {
        if (activeRef.current) {
          pendingPointRef.current = { clientX: event.clientX, clientY: event.clientY }
          flushActiveDrag()
        }
        resetSession({ notifyDragEnd: activeRef.current, suppressClick: activeRef.current })
        return
      }

      if (!activeRef.current) {
        const distance = Math.hypot(
          event.clientX - session.startX,
          event.clientY - session.startY
        )

        if (distance < DESKTOP_MOVE_THRESHOLD) {
          return
        }

        activateDrag(session, event.clientX, event.clientY)
      }

      if (activeRef.current) {
        event.preventDefault()
        scheduleActiveDrag(event.clientX, event.clientY)
      }
    }

    function handlePointerEnd(event: globalThis.PointerEvent) {
      if (event.pointerId !== session.pointerId || sessionRef.current !== session) {
        return
      }

      if (activeRef.current) {
        event.preventDefault()
        pendingPointRef.current = { clientX: event.clientX, clientY: event.clientY }
        flushActiveDrag()
      }

      resetSession({ notifyDragEnd: activeRef.current, suppressClick: activeRef.current })
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false })
    window.addEventListener("pointerup", handlePointerEnd)
    window.addEventListener("pointercancel", handlePointerEnd)
    listenerCleanupRef.current = () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerEnd)
      window.removeEventListener("pointercancel", handlePointerEnd)
    }
  }

  function findTouch(event: globalThis.TouchEvent, pointerId: number) {
    return Array.from(event.touches).find((touch) => touch.identifier === pointerId) ?? null
  }

  function findEndedTouch(event: globalThis.TouchEvent, pointerId: number) {
    return (
      Array.from(event.changedTouches).find(
        (touch) => touch.identifier === pointerId
      ) ?? null
    )
  }

  function bindTouchListeners(session: DragSession) {
    function handleTouchMove(event: globalThis.TouchEvent) {
      if (sessionRef.current !== session) {
        return
      }

      const touch = findTouch(event, session.pointerId)

      if (!touch) {
        return
      }

      if (!activeRef.current) {
        const distance = Math.hypot(
          touch.clientX - session.startX,
          touch.clientY - session.startY
        )

        if (distance >= TOUCH_SCROLL_THRESHOLD) {
          resetSession()
        }

        return
      }

      if (event.cancelable) {
        event.preventDefault()
      }
      scheduleActiveDrag(touch.clientX, touch.clientY)
    }

    function handleTouchEnd(event: globalThis.TouchEvent) {
      const touch = findEndedTouch(event, session.pointerId)

      if (sessionRef.current !== session || !touch) {
        return
      }

      if (activeRef.current && event.cancelable) {
        event.preventDefault()
      }
      if (activeRef.current) {
        pendingPointRef.current = { clientX: touch.clientX, clientY: touch.clientY }
        flushActiveDrag()
      }
      resetSession({ notifyDragEnd: activeRef.current, suppressClick: activeRef.current })
    }

    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)
    window.addEventListener("touchcancel", handleTouchEnd)
    listenerCleanupRef.current = () => {
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("touchcancel", handleTouchEnd)
    }
  }

  function startPointerDrag(event: ReactPointerEvent<HTMLElement>) {
    if (
      disabled ||
      event.pointerType === "touch" ||
      !event.isPrimary ||
      event.button !== 0 ||
      shouldIgnoreDragStart(event.currentTarget, event.target)
    ) {
      return
    }

    resetSession()
    const session = createSession({
      clientX: event.clientX,
      clientY: event.clientY,
      currentTarget: event.currentTarget,
      input: "pointer",
      pointerId: event.pointerId,
    })

    if (!session) {
      return
    }

    event.preventDefault()
    sessionRef.current = session

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Window listeners still keep the drag reliable when capture is unavailable.
    }

    bindPointerListeners(session)
  }

  function startTouchDrag(event: ReactTouchEvent<HTMLElement>) {
    if (
      disabled ||
      event.touches.length !== 1 ||
      shouldIgnoreDragStart(event.currentTarget, event.target)
    ) {
      return
    }

    const touch = event.touches[0]
    resetSession()
    const session = createSession({
      clientX: touch.clientX,
      clientY: touch.clientY,
      currentTarget: event.currentTarget,
      input: "touch",
      pointerId: touch.identifier,
    })

    if (!session) {
      return
    }

    sessionRef.current = session
    setIsDragPending(true)
    bindTouchListeners(session)
    activationTimerRef.current = window.setTimeout(() => {
      activateDrag(session, session.startX, session.startY)
    }, touchActivationDelay)
  }

  function handleClickCapture(event: ReactMouseEvent<HTMLElement>) {
    if (!suppressClickRef.current) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
  }

  function handleContextMenu(event: ReactMouseEvent<HTMLElement>) {
    if (sessionRef.current?.input !== "touch") {
      return
    }

    event.preventDefault()
  }

  function preventNativeDrag(event: ReactDragEvent<HTMLElement>) {
    event.preventDefault()
  }

  const handleProps = {
    "aria-grabbed": isDragging,
    draggable: false,
    onClickCapture: handleClickCapture,
    onContextMenu: handleContextMenu,
    onDragStart: preventNativeDrag,
    onPointerDown: startPointerDrag,
    onTouchStart: startTouchDrag,
    style: { touchAction: "pan-y" } satisfies CSSProperties,
  }

  return {
    handleProps,
    isDragPending,
    isDragging,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
