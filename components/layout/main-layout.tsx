"use client"

import type { CSSProperties, ReactNode } from "react"

import { TopNavbar } from "@/components/navbar/top-navbar"
import { Sidebar } from "@/components/sidebar/sidebar"
import { useWorkspacePreferences } from "@/hooks/use-workspace-preferences"

type MainLayoutProps = {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { preferences } = useWorkspacePreferences()
  const sidebarWidth = preferences.sidebar.collapsed ? 64 : preferences.sidebar.width
  const backgroundStyle: CSSProperties = {
    backgroundColor: preferences.background.color || "var(--hub-shell-bg)",
  }
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
      className="relative min-h-screen overflow-hidden bg-[var(--hub-shell-bg)] text-[var(--hub-text)]"
      style={backgroundStyle}
    >
      <div
        className="pointer-events-none fixed -inset-6 bg-cover bg-center transition duration-300"
        style={wallpaperStyle}
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed inset-0 bg-black/10" aria-hidden="true" />
      <TopNavbar />
      <Sidebar />
      <main
        className="relative min-h-screen pt-[92px] transition-[padding-left] duration-300 sm:pt-20 lg:pt-[72px]"
        style={{ paddingLeft: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  )
}
