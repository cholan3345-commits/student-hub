"use client"

import { Bell, Pause, Play, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { pomodoroModeLabels, usePomodoro } from "@/hooks/use-pomodoro"
import type { PomodoroMode } from "@/lib/types"
import { cn } from "@/lib/utils"

const modes: PomodoroMode[] = ["focus", "short-break", "long-break"]

export function PomodoroTimer() {
  const {
    clearSessions,
    pause,
    preferences,
    progress,
    remainingSeconds,
    reset,
    setMode,
    start,
    state,
    updatePreferences,
  } = usePomodoro()
  const { toast } = useToast()
  const circumference = 2 * Math.PI * 92
  const progressOffset = circumference * (1 - progress)

  function startTimer() {
    start()
    toast({
      message: `${pomodoroModeLabels[state.mode]} timer is running.`,
      title: "Timer started",
      tone: "success",
    })
  }

  return (
    <PageContainer>
      <PageHeader
        title="Study Timer"
        description="Prepare focused study sessions and break rhythms."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative size-60">
                <svg className="size-full -rotate-90" viewBox="0 0 220 220" aria-hidden="true">
                  <circle
                    cx="110"
                    cy="110"
                    r="92"
                    className="stroke-white/10"
                    fill="none"
                    strokeWidth="14"
                  />
                  <circle
                    cx="110"
                    cy="110"
                    r="92"
                    className="stroke-blue-400 transition-all duration-500"
                    fill="none"
                    strokeLinecap="round"
                    strokeWidth="14"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-6xl font-semibold tracking-normal text-blue-100">
                    {formatSeconds(remainingSeconds)}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                    {pomodoroModeLabels[state.mode]}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {modes.map((mode) => (
                  <Button
                    key={mode}
                    type="button"
                    onClick={() => setMode(mode)}
                    variant={state.mode === mode ? "default" : "ghost"}
                    className={cn(
                      "h-10 rounded-xl border border-white/10 px-4",
                      state.mode === mode
                        ? "bg-blue-500/85 text-white hover:bg-blue-400"
                        : "bg-white/[0.04] text-zinc-100"
                    )}
                  >
                    {pomodoroModeLabels[mode]}
                  </Button>
                ))}
              </div>

              <div className="mt-6 grid w-full max-w-xl gap-3 sm:grid-cols-3">
                {state.isRunning ? (
                  <Button
                    type="button"
                    onClick={() => {
                      pause()
                      toast({
                        message: "Timer paused.",
                        title: "Paused",
                        tone: "info",
                      })
                    }}
                    className="h-11 rounded-xl bg-blue-500/85 text-white hover:bg-blue-400"
                  >
                    <Pause className="size-4" aria-hidden="true" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={startTimer}
                    className="h-11 rounded-xl bg-blue-500/85 text-white hover:bg-blue-400"
                  >
                    <Play className="size-4" aria-hidden="true" />
                    {remainingSeconds === 0 ? "Start" : "Start"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={startTimer}
                  disabled={state.isRunning}
                  className="h-11 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
                >
                  <Play className="size-4" aria-hidden="true" />
                  Resume
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    reset()
                    toast({
                      message: "Timer reset to the selected mode.",
                      title: "Timer reset",
                      tone: "info",
                    })
                  }}
                  className="h-11 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Reset
                </Button>
              </div>

              <div className="mt-6 h-3 w-full max-w-xl overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-500"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-sm text-zinc-500">Focus sessions completed</p>
                <p className="mt-2 text-4xl font-semibold text-zinc-50">
                  {state.sessionCount}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={clearSessions}
                className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
              >
                Clear Session Counter
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field label="Focus minutes">
                <Input
                  type="number"
                  min={1}
                  value={preferences.focusMinutes}
                  onChange={(event) =>
                    updatePreferences({ focusMinutes: Number(event.target.value) || 25 })
                  }
                />
              </Field>
              <Field label="Short break minutes">
                <Input
                  type="number"
                  min={1}
                  value={preferences.shortBreakMinutes}
                  onChange={(event) =>
                    updatePreferences({
                      shortBreakMinutes: Number(event.target.value) || 5,
                    })
                  }
                />
              </Field>
              <Field label="Long break minutes">
                <Input
                  type="number"
                  min={1}
                  value={preferences.longBreakMinutes}
                  onChange={(event) =>
                    updatePreferences({
                      longBreakMinutes: Number(event.target.value) || 15,
                    })
                  }
                />
              </Field>
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-zinc-200">
                <span className="flex items-center gap-2">
                  <Bell className="size-4 text-blue-300" aria-hidden="true" />
                  Browser notifications
                </span>
                <input
                  type="checkbox"
                  checked={preferences.notificationsEnabled}
                  onChange={(event) =>
                    updatePreferences({ notificationsEnabled: event.target.checked })
                  }
                  className="size-4 accent-blue-500"
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-zinc-200">
                <span>Sound notification</span>
                <input
                  type="checkbox"
                  checked={preferences.soundEnabled}
                  onChange={(event) =>
                    updatePreferences({ soundEnabled: event.target.checked })
                  }
                  className="size-4 accent-blue-500"
                />
              </label>
              <Badge tone={state.isRunning ? "green" : "zinc"}>
                {state.isRunning ? "Running" : "Ready"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
