import type { ReactNode } from 'react'

export default function FilterBar({ children, search }: { children: ReactNode; search: ReactNode }) {
  return <section className="ui-panel grid gap-4 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,3fr)]" aria-label="Busca e filtros">
    <div>{search}</div>
    <div className="grid gap-4 sm:auto-cols-fr sm:grid-flow-col">{children}</div>
  </section>
}
