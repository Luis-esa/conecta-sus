import type { ReactNode } from 'react'

export default function PageHeader({ title, description, context, actions, titleId }: {
  title: string
  description: string
  context?: ReactNode
  actions?: ReactNode
  titleId?: string
}) {
  // O layout atual já contém o h1 da rota; o título do conteúdo é h2.
  return <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div className="min-w-0 space-y-2">
      {context && <div className="text-helper font-medium text-muted-foreground">{context}</div>}
      <h2 id={titleId} className="text-page font-semibold tracking-tight">{title}</h2>
      <p className="max-w-prose text-body text-muted-foreground">{description}</p>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
}
