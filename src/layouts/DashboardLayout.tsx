import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import AppSidebar from '@/components/layout/AppSidebar'
import AppHeader from '@/components/layout/AppHeader'
import AppDataStatus from '@/components/layout/AppDataStatus'
import { navigation } from '@/routes/navigation'

export default function DashboardLayout() {
  const { pathname } = useLocation()
  const page = navigation.find((item) => item.path === pathname.replace(/\/$/, ''))
  const title = page?.title ?? 'Página não encontrada'
  useEffect(() => { document.title = `${title} | ConectaSUS` }, [title])

  return (
    <div className="min-h-dvh">
      <a href="#conteudo-principal" className="sr-only fixed left-4 top-4 z-[60] rounded-md bg-white p-3 text-primary focus:not-sr-only">Ir para o conteúdo</a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block"><AppSidebar /></aside>
      <div className="min-w-0 lg:pl-64">
        <AppHeader title={title} group={page?.group ?? 'Navegação'} pathname={pathname} />
        <main id="conteudo-principal" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-6 outline-none sm:px-8 sm:py-8">
          <AppDataStatus />
          <Outlet />
        </main>
        <footer className="px-4 pb-6 text-xs text-muted-foreground sm:px-8">ConectaSUS · Gestão integrada de medicamentos · Lagarto, SE</footer>
      </div>
    </div>
  )
}
