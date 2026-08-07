import { PlaceholderCard } from "@/components/cards/placeholder-card"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"

type ToolPlaceholderPageProps = {
  description: string
  title: string
}

export function ToolPlaceholderPage({ description, title }: ToolPlaceholderPageProps) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />
      <PlaceholderCard />
    </PageContainer>
  )
}
