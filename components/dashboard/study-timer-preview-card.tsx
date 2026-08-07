import { Pause, Play, RotateCcw, TimerReset } from "lucide-react"

import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { Button } from "@/components/ui/button"

export function StudyTimerPreviewCard() {
  return (
    <DashboardCard
      title="Study Timer"
      description="A focused timer preview for future study sessions."
      icon={TimerReset}
    >
      <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-center">
        <div className="rounded-2xl border border-blue-400/20 bg-[#060913] px-4 py-6 shadow-inner shadow-black">
          <p className="text-5xl font-semibold tracking-normal text-blue-100 sm:text-6xl">
            25:00
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Focus Session
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button
            type="button"
            className="h-10 rounded-xl bg-blue-500/80 text-white shadow-lg shadow-blue-950/25 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
          >
            <Play className="size-4" aria-hidden="true" />
            Start
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08]"
          >
            <Pause className="size-4" aria-hidden="true" />
            Pause
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08]"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </div>
    </DashboardCard>
  )
}
