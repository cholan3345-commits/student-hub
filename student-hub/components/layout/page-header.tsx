type PageHeaderProps = {
  description: string
  title: string
}

export function PageHeader({ description, title }: PageHeaderProps) {
  return (
    <header className="hub-glass mb-6 min-w-0 overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--hub-accent)] to-transparent opacity-70" />
      <div className="relative grid gap-2">
        <p className="text-xs font-medium uppercase leading-4 tracking-[0.22em] text-[var(--hub-accent)]">
          Student Hub
        </p>
        <div className="grid gap-1.5">
          <h1 className="break-words text-2xl font-semibold leading-tight tracking-normal text-[var(--hub-text)] sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--hub-muted-text)] sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </header>
  )
}
