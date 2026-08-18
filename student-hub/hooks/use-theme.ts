"use client"

import { useEffect } from "react"

import { useSettings } from "@/hooks/use-settings"
import type { AccentColor, ThemeMode } from "@/lib/types"

const themePalettes: Record<
  Exclude<ThemeMode, "system">,
  {
    accentFallback: string
    card: string
    input: string
    muted: string
    panel: string
    shell: string
    text: string
  }
> = {
  amoled: {
    accentFallback: "#22d3ee",
    card: "rgba(255,255,255,0.072)",
    input: "rgba(255,255,255,0.07)",
    muted: "#a1a1aa",
    panel: "rgba(3,7,18,0.66)",
    shell: "#000000",
    text: "#f8fafc",
  },
  blue: {
    accentFallback: "#38bdf8",
    card: "rgba(59,130,246,0.105)",
    input: "rgba(255,255,255,0.075)",
    muted: "#bfdbfe",
    panel: "rgba(7,21,43,0.7)",
    shell: "#07152b",
    text: "#eff6ff",
  },
  dark: {
    accentFallback: "#3b82f6",
    card: "rgba(255,255,255,0.075)",
    input: "rgba(255,255,255,0.07)",
    muted: "#a1a1aa",
    panel: "rgba(8,11,18,0.68)",
    shell: "#080b12",
    text: "#f4f4f5",
  },
  green: {
    accentFallback: "#10b981",
    card: "rgba(16,185,129,0.105)",
    input: "rgba(255,255,255,0.075)",
    muted: "#bbf7d0",
    panel: "rgba(6,30,23,0.7)",
    shell: "#061e17",
    text: "#ecfdf5",
  },
  light: {
    accentFallback: "#2563eb",
    card: "rgba(255,255,255,0.62)",
    input: "rgba(255,255,255,0.78)",
    muted: "#475569",
    panel: "rgba(248,250,252,0.72)",
    shell: "#edf2f7",
    text: "#0f172a",
  },
  midnight: {
    accentFallback: "#60a5fa",
    card: "rgba(96,165,250,0.095)",
    input: "rgba(255,255,255,0.07)",
    muted: "#9ca3af",
    panel: "rgba(5,8,22,0.68)",
    shell: "#050816",
    text: "#e5e7eb",
  },
  purple: {
    accentFallback: "#a78bfa",
    card: "rgba(139,92,246,0.105)",
    input: "rgba(255,255,255,0.075)",
    muted: "#ddd6fe",
    panel: "rgba(25,18,44,0.7)",
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
      const accentColor = normalizeHexColor(
        settings.accentColor,
        palette.accentFallback
      ).toLowerCase()
      const accentForeground = getContrastColor(accentColor)

      root.dataset.hubTheme = resolvedTheme
      root.classList.toggle("dark", resolvedTheme !== "light")
      root.style.setProperty("--hub-accent", accentColor)
      root.style.setProperty("--hub-accent-foreground", accentForeground)
      root.style.setProperty("--hub-accent-soft", colorMix(accentColor, 14))
      root.style.setProperty("--hub-accent-muted", colorMix(accentColor, 22))
      root.style.setProperty("--hub-accent-border", colorMix(accentColor, 38))
      root.style.setProperty("--hub-accent-ring", colorMix(accentColor, 35))
      root.style.setProperty("--hub-accent-glow", colorMix(accentColor, 24))
      root.style.setProperty("--hub-accent-hover", colorMix(accentColor, 88, "#ffffff"))
      root.style.setProperty("--hub-card-bg", palette.card)
      root.style.setProperty("--hub-input-bg", palette.input)
      root.style.setProperty("--hub-muted-text", palette.muted)
      root.style.setProperty("--hub-panel-bg", palette.panel)
      root.style.setProperty("--hub-shell-bg", palette.shell)
      root.style.setProperty("--hub-text", palette.text)
      root.style.setProperty("--primary", accentColor)
      root.style.setProperty("--primary-foreground", accentForeground)
      root.style.setProperty("--accent", colorMix(accentColor, 16))
      root.style.setProperty("--accent-foreground", palette.text)
      root.style.setProperty("--ring", accentColor)
      root.style.setProperty("--sidebar-primary", accentColor)
      root.style.setProperty("--sidebar-primary-foreground", accentForeground)
    }

    applyTheme()
    media.addEventListener("change", applyTheme)

    return () => media.removeEventListener("change", applyTheme)
  }, [settings.accentColor, settings.theme])

  function setTheme(theme: ThemeMode) {
    updateSettings({ theme })
  }

  function setAccentColor(accentColor: AccentColor) {
    updateSettings({
      accentColor: normalizeHexColor(accentColor, settings.accentColor).toLowerCase(),
    })
  }

  return {
    accentColor: normalizeHexColor(settings.accentColor, "#3b82f6").toLowerCase(),
    setAccentColor,
    setTheme,
    theme: settings.theme,
  }
}

function normalizeHexColor(value: string | undefined, fallback: string) {
  if (value && /^#[0-9a-f]{6}$/i.test(value)) {
    return value
  }

  return fallback
}

function colorMix(color: string, amount: number, fallback = "transparent") {
  return `color-mix(in srgb, ${color} ${amount}%, ${fallback})`
}

function getContrastColor(color: string) {
  const red = Number.parseInt(color.slice(1, 3), 16)
  const green = Number.parseInt(color.slice(3, 5), 16)
  const blue = Number.parseInt(color.slice(5, 7), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

  return luminance > 0.62 ? "#0f172a" : "#ffffff"
}
