type PageHeaderProps = {
  description: string
  title: string
}

export function PageHeader({ description, title }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-semibold tracking-normal text-zinc-50 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
        {description}
      </p>
    </header>
  )
}
