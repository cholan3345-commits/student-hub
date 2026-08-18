export type AiProvider = "mock" | "openai" | "gemini" | "anthropic"

export type AiServiceConfig = {
  model?: string
  provider?: AiProvider
}

export type AiAssistantActionId =
  | "explain-topic"
  | "summarize-notes"
  | "generate-quiz"
  | "generate-flashcards"
  | "create-study-plan"
  | "rewrite-notes"
  | "programming-helper"
  | "math-solver"

export type AiChatMessage = {
  content: string
  createdAt: string
  id: string
  role: "assistant" | "user"
}

export type AiTextMode =
  | "summarize"
  | "rewrite"
  | "simplify"
  | "expand"
  | "key-points"
  | "reviewer"

export type AiTextResult = {
  content: string
  title: string
}

export type AiDifficulty = "Easy" | "Medium" | "Hard"

export type AiQuestionType =
  | "Multiple Choice"
  | "True or False"
  | "Identification"

export type AiQuizQuestion = {
  answer: string
  explanation: string
  id: string
  options: string[]
  prompt: string
  type: AiQuestionType
}

export type AiQuiz = {
  difficulty: AiDifficulty
  questions: AiQuizQuestion[]
  topic: string
}

export type AiFlashcard = {
  answer: string
  id: string
  mastered: boolean
  question: string
}

export type AiStudyPlanDay = {
  dateLabel: string
  focus: string
  minutes: number
  tasks: string[]
}

export type AiStudyPlan = {
  overview: string
  plan: AiStudyPlanDay[]
  subjects: string[]
}

export type AiPdfAnalysis = {
  answer: string
  keyPoints: string[]
  suggestedQuestions: string[]
  summary: string
}

const actionLabels: Record<AiAssistantActionId, string> = {
  "create-study-plan": "study plan",
  "explain-topic": "topic explanation",
  "generate-flashcards": "flashcards",
  "generate-quiz": "quiz",
  "math-solver": "math solution",
  "programming-helper": "programming help",
  "rewrite-notes": "rewritten notes",
  "summarize-notes": "notes summary",
}

export async function sendMessage({
  action,
  messages,
  prompt,
}: {
  action?: AiAssistantActionId
  config?: AiServiceConfig
  messages: AiChatMessage[]
  prompt: string
}) {
  await mockDelay()

  const subject = getSubject(prompt)
  const label = action ? actionLabels[action] : "study support"
  const previousContext = messages
    .slice(-3)
    .map((message) => message.content)
    .join(" ")

  if (action === "programming-helper") {
    return `## Programming Helper\n\nHere is a practical way to approach **${subject}**:\n\n- Identify the expected input and output first.\n- Break the task into one small pure function and one UI/event layer.\n- Add a quick edge-case test before expanding the solution.\n\n\`\`\`ts\nfunction normalizeTopic(value: string) {\n  return value.trim().replace(/\\s+/g, " ")\n}\n\`\`\`\n\nA good next step is to describe one failing case, then implement only enough code to make that case pass.`
  }

  if (action === "math-solver") {
    return `## Math Solver\n\nFor **${subject}**, use a step-by-step setup:\n\n1. Write the known values.\n2. Choose the formula or rule that connects them.\n3. Substitute values carefully.\n4. Check whether the answer is reasonable.\n\n**Mock worked result:** if the problem asks for a rate, divide the total change by the total time and include units in the final answer.`
  }

  if (action === "generate-quiz") {
    return `## Quick Quiz For ${subject}\n\n1. What is the main idea behind ${subject}?\n2. Which detail is most likely to appear in an exam question?\n3. How would you explain ${subject} to a classmate in one minute?\n\n**Answer strategy:** connect every answer to a definition, example, or cause-and-effect relationship.`
  }

  return `## ${capitalize(label)}\n\nHere is a focused response for **${subject}**:\n\n- Start with the core definition, then add one concrete example.\n- Separate facts you must memorize from ideas you need to understand.\n- Turn the hardest paragraph into a question you can answer aloud.\n\n**Study move:** make a three-line reviewer: what it is, why it matters, and one example.\n\n${previousContext ? "I also considered the recent chat context so this stays aligned with your current study thread." : ""}`
}

export async function summarizeText({
  mode,
  text,
}: {
  config?: AiServiceConfig
  mode: AiTextMode
  text: string
}): Promise<AiTextResult> {
  await mockDelay()

  const topic = getSubject(text)
  const keyIdeas = extractKeyIdeas(text)

  if (mode === "rewrite") {
    return {
      title: "Rewritten Notes",
      content: `## Rewritten Notes\n\n${keyIdeas
        .map((idea) => `- ${capitalizeSentence(idea)}.`)
        .join("\n")}\n\nThe notes are now phrased more directly, with shorter study-ready statements.`,
    }
  }

  if (mode === "simplify") {
    return {
      title: "Simplified Explanation",
      content: `## Simplified Explanation\n\n**${topic}** can be understood as a set of smaller ideas:\n\n${keyIdeas
        .slice(0, 4)
        .map((idea) => `- ${idea}`)
        .join("\n")}\n\nThink of it as: definition first, example second, memory cue third.`,
    }
  }

  if (mode === "expand") {
    return {
      title: "Expanded Notes",
      content: `## Expanded Notes\n\n${keyIdeas
        .map(
          (idea, index) =>
            `${index + 1}. ${capitalizeSentence(idea)}. Add a definition, example, and possible exam angle for this point.`
        )
        .join("\n")}\n\nUse this expansion as a scaffold for a fuller reviewer.`,
    }
  }

  if (mode === "key-points") {
    return {
      title: "Key Points",
      content: `## Key Points\n\n${keyIdeas
        .map((idea) => `- **${capitalizeSentence(idea)}**`)
        .join("\n")}`,
    }
  }

  if (mode === "reviewer") {
    return {
      title: "Generated Reviewer",
      content: `## Reviewer For ${topic}\n\n### Must Know\n${keyIdeas
        .slice(0, 3)
        .map((idea) => `- ${capitalizeSentence(idea)}`)
        .join("\n")}\n\n### Practice Questions\n1. What is the central idea of ${topic}?\n2. Which example best demonstrates it?\n3. What common mistake should you avoid?`,
    }
  }

  return {
    title: "Summary",
    content: `## Summary\n\n${keyIdeas
      .slice(0, 5)
      .map((idea) => `- ${capitalizeSentence(idea)}`)
      .join("\n")}\n\n**Main takeaway:** ${topic} should be reviewed through definitions, examples, and quick recall questions.`,
  }
}

export async function generateQuiz({
  difficulty,
  questionCount,
  questionTypes,
  topic,
}: {
  config?: AiServiceConfig
  difficulty: AiDifficulty
  questionCount: number
  questionTypes: AiQuestionType[]
  topic: string
}): Promise<AiQuiz> {
  await mockDelay()

  const normalizedTopic = getSubject(topic)
  const count = clamp(Math.round(questionCount), 1, 20)
  const selectedTypes: AiQuestionType[] = questionTypes.length
    ? questionTypes
    : ["Multiple Choice"]
  const questions: AiQuizQuestion[] = Array.from({ length: count }, (_, index) => {
    const type = selectedTypes[index % selectedTypes.length]
    const number = index + 1

    if (type === "True or False") {
      return {
        answer: number % 2 === 0 ? "False" : "True",
        explanation: `This checks whether you understand a core ${normalizedTopic} relationship, not just a keyword.`,
        id: `quiz-${number}`,
        options: ["True", "False"],
        prompt: `${normalizedTopic} statement ${number}: the concept can be explained using a definition and an example.`,
        type,
      }
    }

    if (type === "Identification") {
      return {
        answer: `${normalizedTopic} key term ${number}`,
        explanation: "Identification items reward precise recall, so write the term before adding explanation.",
        id: `quiz-${number}`,
        options: [],
        prompt: `Identify the key term in ${normalizedTopic} that matches review clue ${number}.`,
        type,
      }
    }

    const correct = `${normalizedTopic} concept ${number}`

    return {
      answer: correct,
      explanation: `The correct answer connects the definition of ${normalizedTopic} with a practical example.`,
      id: `quiz-${number}`,
      options: [
        correct,
        `Unrelated detail ${number}`,
        `Common misconception ${number}`,
        `Partial answer ${number}`,
      ],
      prompt: `Which option best describes ${normalizedTopic} idea ${number} at a ${difficulty.toLowerCase()} level?`,
      type,
    }
  })

  return {
    difficulty,
    questions,
    topic: normalizedTopic,
  }
}

export async function generateFlashcards({
  count,
  topic,
}: {
  config?: AiServiceConfig
  count: number
  topic: string
}): Promise<AiFlashcard[]> {
  await mockDelay()

  const normalizedTopic = getSubject(topic)
  const total = clamp(Math.round(count), 3, 24)

  return Array.from({ length: total }, (_, index) => ({
    answer: `A concise explanation of ${normalizedTopic} point ${index + 1}, including one exam-friendly example.`,
    id: `flashcard-${index + 1}`,
    mastered: false,
    question: `What should you remember about ${normalizedTopic} point ${index + 1}?`,
  }))
}

export async function createStudyPlan({
  availableHours,
  examDates,
  subjects,
}: {
  availableHours: number
  config?: AiServiceConfig
  examDates: string
  subjects: string
}): Promise<AiStudyPlan> {
  await mockDelay()

  const subjectList = parseList(subjects, ["Mathematics", "Science", "History"])
  const dateHints = parseList(examDates, ["Upcoming exam"])
  const totalMinutes = Math.max(30, Math.round(availableHours * 60))
  const days = Math.min(7, Math.max(3, subjectList.length + 2))

  return {
    overview: `A ${days}-day plan balancing ${subjectList.join(", ")} with active recall, problem solving, and review blocks.`,
    plan: Array.from({ length: days }, (_, index) => {
      const subject = subjectList[index % subjectList.length]
      const dateHint = dateHints[index % dateHints.length]

      return {
        dateLabel: `Day ${index + 1}`,
        focus: subject,
        minutes: Math.max(25, Math.round(totalMinutes / days)),
        tasks: [
          `Review core notes for ${subject}.`,
          `Answer 5 practice questions tied to ${dateHint}.`,
          "End with a short recall check without looking at notes.",
        ],
      }
    }),
    subjects: subjectList,
  }
}

export async function analyzePDF({
  fileName,
  question,
}: {
  config?: AiServiceConfig
  fileName: string
  question?: string
}): Promise<AiPdfAnalysis> {
  await mockDelay()

  const documentName = fileName || "uploaded PDF"

  return {
    answer: question
      ? `Based on the mock analysis of ${documentName}, focus on the definitions, highlighted examples, and any repeated terms related to "${question}".`
      : "Upload a PDF and ask a question to generate a focused answer.",
    keyPoints: [
      `Identify the main claim or lesson in ${documentName}.`,
      "Extract definitions and formulas into a quick reviewer.",
      "Flag any examples that could become quiz questions.",
    ],
    suggestedQuestions: [
      "What are the main points?",
      "Which terms should I memorize?",
      "Can you make a quiz from this PDF?",
    ],
    summary: `${documentName} appears ready for a structured study pass: summary first, key points second, questions third. This is a realistic mock response until a live PDF parser is connected.`,
  }
}

function mockDelay() {
  return new Promise((resolve) => window.setTimeout(resolve, 550))
}

function getSubject(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim()

  if (!cleaned) {
    return "your study topic"
  }

  return cleaned.length > 72 ? `${cleaned.slice(0, 72)}...` : cleaned
}

function extractKeyIdeas(text: string) {
  const ideas = text
    .split(/[\n.?!]+/)
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 6)

  return ideas.length
    ? ideas
    : [
        "define the main concept",
        "connect it to an example",
        "review the likely exam angle",
      ]
}

function parseList(value: string, fallback: string[]) {
  const items = value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)

  return items.length ? items : fallback
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function capitalizeSentence(value: string) {
  const cleaned = value.trim().replace(/[.]+$/, "")

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
