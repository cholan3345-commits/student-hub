"use client"

import { useLayoutEffect, useRef } from "react"

type ItemRect = {
  left: number
  top: number
}

const REFLOW_DURATION = 190
const REFLOW_EASING = "cubic-bezier(0.22, 1, 0.36, 1)"

export function useGridReflow(container: HTMLElement | null, layoutKey: string) {
  const previousRectsRef = useRef(new Map<string, ItemRect>())
  const animationsRef = useRef(new Map<string, Animation>())

  useLayoutEffect(() => {
    if (!container) {
      return
    }

    const animations = animationsRef.current
    animations.forEach((animation) => animation.cancel())
    animations.clear()

    const items = Array.from(
      container.querySelectorAll<HTMLElement>("[data-dashboard-widget]")
    )
    const nextRects = new Map<string, ItemRect>()
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    items.forEach((item) => {
      const itemId = item.dataset.dragId

      if (!itemId) {
        return
      }

      const stableItemId = itemId

      const rect = item.getBoundingClientRect()
      const nextRect = { left: rect.left, top: rect.top }
      const previousRect = previousRectsRef.current.get(stableItemId)
      nextRects.set(stableItemId, nextRect)

      if (
        reduceMotion ||
        !previousRect ||
        item.dataset.dragSourceActive === "true" ||
        item.dataset.resizeState === "active" ||
        typeof item.animate !== "function"
      ) {
        return
      }

      const deltaX = previousRect.left - nextRect.left
      const deltaY = previousRect.top - nextRect.top

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        return
      }

      item.setAttribute("data-grid-reflowing", "true")
      const animation = item.animate(
        [
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
          { transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration: REFLOW_DURATION,
          easing: REFLOW_EASING,
        }
      )

      animations.set(stableItemId, animation)

      function clearAnimationState() {
        if (animations.get(stableItemId) === animation) {
          animations.delete(stableItemId)
          item.removeAttribute("data-grid-reflowing")
        }
      }

      animation.addEventListener("finish", clearAnimationState, { once: true })
      animation.addEventListener("cancel", clearAnimationState, { once: true })
    })

    previousRectsRef.current = nextRects

    return () => {
      animations.forEach((animation) => animation.cancel())
      animations.clear()
    }
  }, [container, layoutKey])
}
