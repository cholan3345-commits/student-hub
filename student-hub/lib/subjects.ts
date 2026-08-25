export function normalizeSubject(subject: string) {
  return subject.trim().replace(/\s+/g, " ")
}

export function getSubjectKey(subject: string) {
  return normalizeSubject(subject).toLocaleLowerCase()
}

export function getUniqueSubjects(subjects: string[]) {
  const subjectsByKey = new Map<string, string>()

  for (const rawSubject of subjects) {
    const subject = normalizeSubject(rawSubject)

    if (!subject) {
      continue
    }

    const key = getSubjectKey(subject)

    if (!subjectsByKey.has(key)) {
      subjectsByKey.set(key, subject)
    }
  }

  return Array.from(subjectsByKey.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  )
}

export function isSameSubject(firstSubject: string, secondSubject: string) {
  return getSubjectKey(firstSubject) === getSubjectKey(secondSubject)
}
