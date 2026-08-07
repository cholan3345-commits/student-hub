import { Calculator } from "lucide-react"

import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const calculatorButtons = [
  "C",
  "/",
  "x",
  "-",
  "7",
  "8",
  "9",
  "+",
  "4",
  "5",
  "6",
  "=",
  "1",
  "2",
  "3",
  "0",
]

export function CalculatorPreviewCard() {
  return (
    <DashboardCard
      title="Calculator"
      description="A visual calculator shell for quick math."
      icon={Calculator}
    >
      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
        <div className="mb-3 flex h-14 items-center justify-end rounded-xl border border-blue-400/20 bg-[#060913] px-4 text-2xl font-semibold text-blue-100 shadow-inner shadow-black">
          0
        </div>
        <div className="grid grid-cols-4 gap-2">
          {calculatorButtons.map((label) => {
            const isOperator = ["/", "x", "-", "+", "="].includes(label)
            const isClear = label === "C"

            return (
              <Button
                key={label}
                type="button"
                variant={isOperator ? "default" : "ghost"}
                aria-label={`Calculator ${label}`}
                className={cn(
                  "h-10 rounded-xl text-sm transition duration-200 hover:-translate-y-0.5",
                  isOperator &&
                    "bg-blue-500/80 text-white shadow-lg shadow-blue-950/25 hover:bg-blue-400",
                  isClear &&
                    "bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-red-100",
                  !isOperator &&
                    !isClear &&
                    "border border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]"
                )}
              >
                {label}
              </Button>
            )
          })}
        </div>
      </div>
    </DashboardCard>
  )
}
