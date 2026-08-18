import { Card, CardContent } from "@/components/ui/card"

export function PlaceholderCard() {
  return (
    <Card className="flex min-h-72 items-center justify-center border-dashed border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)]">
      <CardContent className="p-8 text-center">
        <p className="text-lg font-semibold text-zinc-100">Coming Soon</p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          This tool is ready for a future functionality pass.
        </p>
      </CardContent>
    </Card>
  )
}
