"use client"

import { useMemo, useState, type FormEvent } from "react"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Plus,
  RotateCcw,
  Shuffle,
} from "lucide-react"

import { LoadingDots } from "@/components/ai/ai-common"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { generateFlashcards, type AiFlashcard } from "@/lib/ai"
import { cn } from "@/lib/utils"

export function AiFlashcardGenerator() {
  const { toast } = useToast()
  const [topic, setTopic] = useState("")
  const [count, setCount] = useState(8)
  const [cards, setCards] = useState<AiFlashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const currentCard = cards[currentIndex] ?? null
  const masteredCount = useMemo(
    () => cards.filter((card) => card.mastered).length,
    [cards]
  )

  async function submitCards(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!topic.trim()) {
      toast({
        message: "Add a topic before generating flashcards.",
        title: "Topic required",
        tone: "error",
      })
      return
    }

    setIsLoading(true)

    try {
      const nextCards = await generateFlashcards({ count, topic })

      setCards(nextCards)
      setCurrentIndex(0)
      setFlipped(false)
    } catch {
      toast({
        message: "The mock flashcard service could not finish.",
        title: "Flashcard error",
        tone: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function move(offset: number) {
    setCurrentIndex((current) => {
      const nextIndex = current + offset

      if (nextIndex < 0) {
        return cards.length - 1
      }

      if (nextIndex >= cards.length) {
        return 0
      }

      return nextIndex
    })
    setFlipped(false)
  }

  function shuffleCards() {
    setCards((current) => [...current].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setFlipped(false)
  }

  function markMastered() {
    if (!currentCard) {
      return
    }

    setCards((current) =>
      current.map((card) =>
        card.id === currentCard.id ? { ...card, mastered: !card.mastered } : card
      )
    )
  }

  function resetMastered() {
    setCards((current) => current.map((card) => ({ ...card, mastered: false })))
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Flashcards"
        description="Generate flip cards for fast recall, shuffle them, and mark mastered items."
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Flashcard Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submitCards}>
              <Field label="Topic">
                <Input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="JavaScript arrays, anatomy, world history"
                />
              </Field>
              <Field label="Card Count">
                <Input
                  type="number"
                  min={3}
                  max={24}
                  value={count}
                  onChange={(event) => setCount(Number(event.target.value) || 3)}
                />
              </Field>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 rounded-xl px-4"
              >
                <Plus className="size-4" aria-hidden="true" />
                Generate Flashcards
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-4 sm:pt-5">
                <LoadingDots label="Building flashcards" />
              </CardContent>
            </Card>
          ) : null}

          {!currentCard && !isLoading ? (
            <EmptyState
              icon={Layers}
              title="No flashcards generated"
              description="Create a set to start reviewing with flip cards."
            />
          ) : null}

          {currentCard ? (
            <>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-2 pt-4 sm:pt-5">
                  <Badge tone="blue">
                    Card {currentIndex + 1} of {cards.length}
                  </Badge>
                  <Badge tone="green">
                    {masteredCount} mastered
                  </Badge>
                  {currentCard.mastered ? <Badge tone="green">Current mastered</Badge> : null}
                </CardContent>
              </Card>

              <div className="[perspective:1000px]">
                <button
                  type="button"
                  onClick={() => setFlipped((current) => !current)}
                  className="relative min-h-80 w-full rounded-2xl text-left outline-none [transform-style:preserve-3d] transition-[transform,box-shadow] duration-500 ease-out focus-visible:ring-2 focus-visible:ring-[var(--hub-accent-ring)]"
                  style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  aria-label="Flip flashcard"
                >
                  <FlashcardFace title="Question" text={currentCard.question} />
                  <FlashcardFace back title="Answer" text={currentCard.answer} />
                </button>
              </div>

              <Card>
                <CardContent className="grid gap-2 pt-4 sm:grid-cols-2 sm:pt-5 lg:grid-cols-5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => move(-1)}
                    className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => move(1)}
                    className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
                  >
                    Next
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={shuffleCards}
                    className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
                  >
                    <Shuffle className="size-4" aria-hidden="true" />
                    Shuffle
                  </Button>
                  <Button
                    type="button"
                    onClick={markMastered}
                    className={cn(
                      "h-10 rounded-xl px-4",
                      currentCard.mastered
                        ? "bg-emerald-500/85 text-white hover:bg-emerald-400"
                        : "hub-accent-bg"
                    )}
                  >
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Mastered
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetMastered}
                    className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Reset
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}

function FlashcardFace({
  back,
  text,
  title,
}: {
  back?: boolean
  text: string
  title: string
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex min-h-80 flex-col justify-between rounded-2xl border border-white/10 bg-[var(--hub-card-bg)] p-6 shadow-xl shadow-black/25 [backface-visibility:hidden]",
        back && "[transform:rotateY(180deg)]"
      )}
    >
      <Badge tone={back ? "green" : "blue"}>{title}</Badge>
      <p className="my-8 break-words text-2xl font-semibold leading-snug text-zinc-50 sm:text-3xl">
        {text}
      </p>
      <p className="text-sm text-zinc-500">Tap the card to flip.</p>
    </div>
  )
}
