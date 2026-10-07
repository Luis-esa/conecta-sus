import { Clock3, Check } from 'lucide-react'
import type { NavigationItem } from '@/routes/navigation'

export default function ModulePlaceholder({ page }: { page: NavigationItem }) {
  const Icon = page.icon
  return (
    <section aria-label={page.title}>
      <p className="mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">{page.description}</p>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-6 py-5 sm:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary"><Clock3 className="size-3.5" aria-hidden="true" />Em breve</span>
        </div>
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="mb-5 flex size-12 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="size-6" aria-hidden="true" /></span>
            <h2 className="text-xl font-semibold tracking-tight">{page.title} em preparação</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Esta área está sendo preparada para apoiar a gestão dos medicamentos da rede municipal. Os recursos estarão disponíveis em uma próxima atualização.</p>
          </div>
          <div className="rounded-lg bg-background p-5 sm:p-6">
            <h3 className="text-sm font-semibold">O que você encontrará aqui</h3>
            <ul className="mt-5 space-y-4">
              {page.resources.map((resource) => <li key={resource} className="flex items-center gap-3 text-sm text-muted-foreground"><Check className="size-4 shrink-0 text-primary" aria-hidden="true" />{resource}</li>)}
            </ul>
            <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">Recursos previstos para esta área.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
