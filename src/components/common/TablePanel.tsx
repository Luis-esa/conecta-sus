import { useId, type ReactNode } from 'react'

export default function TablePanel({ title, count, actions, children }: {
  title: string
  count: string
  actions?: ReactNode
  children: ReactNode
}) {
  const titleId = useId()
  return <section className="ui-panel min-w-0 overflow-hidden" aria-labelledby={titleId}>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
      <h3 id={titleId} className="text-section font-semibold">{title}</h3>
      <div className="flex flex-wrap items-center gap-3">
        <p role="status" aria-atomic="true" className="text-body text-muted-foreground">{count}</p>
        {actions}
      </div>
    </div>
    {children}
  </section>
}
