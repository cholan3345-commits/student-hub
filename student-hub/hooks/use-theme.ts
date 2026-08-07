"use client"

import { useEffect } from "react"

import { useSettings } from "@/hooks/use-settings"
import type { AccentColor, ThemeMode } from "@/lib/types"

const themePalettes: Record<
  Exclude<ThemeMode, "system">,
  {
    accentFallback: string
    card: string
    panel: string
    shell: string
    text: string
  }
> = {
  amoled: {
    accentFallback: "#22d3ee",
    card: "rgba(255,255,255,0.035)",
    panel: "rgba(0,0,0,0.94)",
    shell: "#000000",
    text: "#f8fafc",
  },
  blue: {
    accentFallback: "#38bdf8",
    card: "rgba(59,130,246,0.08)",
    panel: "rgba(7,21,43,0.95)",
    shell: "#07152b",
    text: "#eff6ff",
  },
  dark: {
    accentFallback: "#3b82f6",
    card: "rgba(255,255,255,0.035)",
    panel: "rgba(8,11,18,0.95)",
    shell: "#080b12",
    text: "#f4f4f5",
  },
  green: {
    accentFallback: "#10b981",
    card: "rgba(16,185,129,0.08)",
    panel: "rgba(6,30,23,0.95)",
    shell: "#061e17",
    text: "#ecfdf5",
  },
  light: {
    accentFallback: "#2563eb",
    card: "rgba(15,23,42,0.06)",
    panel: "rgba(248,250,252,0.92)",
    shell: "#edf2f7",
    text: "#0f172a",
  },
  midnight: {
    accentFallback: "#60a5fa",
    card: "rgba(96,165,250,0.07)",
    panel: "rgba(5,8,22,0.95)",
    shell: "#050816",
    text: "#e5e7eb",
  },
  purple: {
    accentFallback: "#a78bfa",
    card: "rgba(139,92,246,0.08)",
    panel: "rgba(25,18,44,0.95)",
    shell: "#19122c",
    text: "#f5f3ff",
  },
}

export function useTheme() {
  const { settings, updateSettings } = useSettings()

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    function applyTheme() {
      const resolvedTheme =
        settings.theme === "system" ? (media.matches ? "dark" : "light") : settings.theme
      const palette = themePalettes[resolvedTheme]
      const accentColor = settings.accentColor || palette.accentFallback

      root.dataset.hubTheme = resolvedTheme
      root.classList.toggle("dark", resolvedTheme !== "light")
      root.style.setProperty("--hub-accent", accentColor)
      root.style.setProperty("--hub-card-bg", palette.card)
      root.style.setProperty("--hub-panel-bg", palette.panel)
      root.style.setProperty("--hub-shell-bg", palette.shell)
      root.style.setProperty("--hub-text", palette.text)
      root.style.setProperty("--ring", accentColor)
    }

    applyTheme()
    media.addEventListener("change", applyTheme)

    return () => media.removeEventListener("change", applyTheme)
  }, [settings.accentColor, settings.theme])

  function setTheme(theme: ThemeMode) {
    updateSettings({ theme })
  }

  function setAccentColor(accentColor: AccentColor) {
    updateSettings({ accentColor })
  }

  return {
    accentColor: settings.accentColor,
    setAccentColor,
    setTheme,
    theme: settings.theme,
  }
}
