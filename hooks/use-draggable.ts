"use client"

import { useRef, useState, type CSSProperties, type PointerEvent } from "react"

type UseDraggableOptions = {
  disabled?: boolean
  id: string
  onDragEnd?: () => void
  onDragStart?: () => void
  onMove: (draggedId: string, targetId: string) => void
  targetSelector: string
}

export function useDraggable({
  disabled,
  id,
  onDragEnd,
  onDragStart,
  onMove,
  targetSelector,
}: UseDraggableOptions) {
  const activeRef = useRef(false)
  const lastTargetRef = useRef<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function startDragging(event: PointerEvent<HTMLElement>) {
    if (disabled || event.button !== 0) {
      return
    }

    activeRef.current = true
    lastTargetRef.current = null
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
    onDragStart?.()
  }

  function moveDragging(event: PointerEvent<HTMLElement>) {
    if (!activeRef.current || disabled) {
      return
    }

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>(targetSelector)
    const targetId = target?.dataset.dragId

    if (!targetId || targetId === id || targetId === lastTargetRef.current) {
      return
    }

    lastTargetRef.current = targetId
    onMove(id, targetId)
  }

  function stopDragging(event: PointerEvent<HTMLElement>) {
    if (!activeRef.current) {
      return
    }

    activeRef.current = false
    lastTargetRef.current = null
    setIsDragging(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    onDragEnd?.()
  }

  const handleProps = {
    "aria-grabbed": isDragging,
    onPointerCancel: stopDragging,
    onPointerDown: startDragging,
    onPointerMove: moveDragging,
    onPointerUp: stopDragging,
    style: { touchAction: "none" } satisfies CSSProperties,
  }

  return {
    handleProps,
    isDragging,
  }
}
