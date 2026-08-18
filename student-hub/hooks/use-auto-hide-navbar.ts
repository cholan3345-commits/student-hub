"use client"

import { useEffect, useRef, useState } from "react"

const TOP_REVEAL_OFFSET = 24
const HIDE_DIRECTION_DISTANCE = 14
const SHOW_DIRECTION_DISTANCE = 10

export function useAutoHideNavbar(enabled: boolean, forceVisible = false) {
  const [directionVisible, setDirectionVisible] = useState(true)
  const visibleRef = useRef(true)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const scrollElement = document.scrollingElement ?? document.documentElement
    let lastScrollTop = scrollElement.scrollTop
    let accumulatedDistance = 0
    let direction = 0
    let animationFrame = 0

    function setVisible(visible: boolean) {
      if (visibleRef.current === visible) {
        return
      }

      visibleRef.current = visible
      setDirectionVisible(visible)
    }

    function updateFromScroll() {
      animationFrame = 0
      const nextScrollTop = Math.max(0, scrollElement.scrollTop)

      if (forceVisible) {
        lastScrollTop = nextScrollTop
        accumulatedDistance = 0
        direction = 0
        setVisible(true)
        return
      }

      if (nextScrollTop <= TOP_REVEAL_OFFSET) {
        lastScrollTop = nextScrollTop
        accumulatedDistance = 0
        direction = 0
        setVisible(true)
        return
      }

      const delta = nextScrollTop - lastScrollTop
      lastScrollTop = nextScrollTop

      if (Math.abs(delta) < 1) {
        return
      }

      const nextDirection = delta > 0 ? 1 : -1

      if (nextDirection !== direction) {
        direction = nextDirection
        accumulatedDistance = delta
      } else {
        accumulatedDistance += delta
      }

      const navbarHasFocus = Boolean(
        document.querySelector("[data-app-navbar]:focus-within")
      )

      if (navbarHasFocus) {
        setVisible(true)
        return
      }

      if (accumulatedDistance >= HIDE_DIRECTION_DISTANCE) {
        accumulatedDistance = 0
        setVisible(false)
      } else if (accumulatedDistance <= -SHOW_DIRECTION_DISTANCE) {
        accumulatedDistance = 0
        setVisible(true)
      }
    }

    function handleScroll() {
      if (animationFrame !== 0) {
        return
      }

      animationFrame = window.requestAnimationFrame(updateFromScroll)
    }

    if (forceVisible || lastScrollTop <= TOP_REVEAL_OFFSET) {
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0
        setVisible(true)
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [enabled, forceVisible])

  return enabled ? directionVisible : true
}
