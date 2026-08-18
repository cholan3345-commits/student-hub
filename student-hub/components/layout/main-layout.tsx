"use client"

import type { CSSProperties, ReactNode } from "react"

import { TopNavbar } from "@/components/navbar/top-navbar"
import { Sidebar } from "@/components/sidebar/sidebar"
import { useTheme } from "@/hooks/use-theme"
import { useWorkspacePreferences } from "@/hooks/use-workspace-preferences"

type MainLayoutProps = {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  useTheme()

  const { preferences } = useWorkspacePreferences()
  const sidebarWidth = preferences.sidebar.collapsed ? 64 : preferences.sidebar.width
  const shellStyle = {
    backgroundColor: preferences.background.color || "var(--hub-shell-bg)",
    "--student-sidebar-width": `${sidebarWidth}px`,
  } as CSSProperties & Record<"--student-sidebar-width", string>
  const wallpaperStyle: CSSProperties =
    preferences.background.mode === "wallpaper" && preferences.background.wallpaperDataUrl
      ? {
          backgroundImage: `url("${preferences.background.wallpaperDataUrl}")`,
          filter: `blur(${preferences.background.blur}px)`,
          opacity: 1 - preferences.background.transparency / 100,
        }
      : {
          backgroundColor: preferences.background.color,
          opacity: 1 - preferences.background.transparency / 100,
        }

  return (
    <div
      className="relative min-h-screen bg-[var(--hub-shell-bg)] text-[var(--hub-text)]"
      style={shellStyle}
    >
      <div
        className="pointer-events-none fixed -inset-8 bg-cover bg-center transition-[background-color,filter,opacity] duration-300 ease-out"
        style={wallpaperStyle}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_14%,color-mix(in_srgb,var(--hub-accent)_24%,transparent),transparent_28rem),radial-gradient(circle_at_88%_4%,color-mix(in_srgb,var(--hub-accent)_13%,transparent),transparent_30rem),radial-gradient(circle_at_52%_96%,color-mix(in_srgb,var(--hub-accent)_16%,transparent),transparent_34rem),linear-gradient(135deg,rgba(2,6,23,0.78),rgba(8,13,28,0.88)_44%,rgba(15,23,42,0.82))]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.42))]"
        aria-hidden="true"
      />
      <TopNavbar />
      <Sidebar />
      <main
        className="relative z-0 min-h-screen min-w-0 pl-[5.25rem] pt-[7.25rem] transition-[padding-left] duration-[220ms] ease-out sm:pt-[6.75rem] lg:pl-[calc(var(--student-sidebar-width)+1.5rem)] lg:pt-[6.25rem]"
      >
        {children}
      </main>
    </div>
  )
}
