import { useEffect, useState } from 'react'
import { Bell, LogOut, Menu, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import AppSidebar from './AppSidebar'

function MobileNavigation() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" aria-label="Abrir menu de navegação"><Menu aria-hidden="true" /></Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 max-w-[85vw] gap-0 border-0 p-0 [&>button]:text-white lg:hidden">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <SheetDescription className="sr-only">Áreas do ConectaSUS</SheetDescription>
        <AppSidebar onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

export default function AppHeader({ title, group, pathname }: { title: string; group: string; pathname: string }) {
  return (
    <header className="sticky top-0 z-20 flex min-h-24 flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNavigation key={pathname} />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">ConectaSUS <span aria-hidden="true" className="px-1">/</span> {group}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" disabled aria-label="Notificações — disponíveis em breve" title="Notificações disponíveis em breve"><Bell aria-hidden="true" /></Button>
        <div className="flex items-center gap-3 border-l pl-3 sm:pl-4" aria-label="Espaço do usuário">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary"><UserRound className="size-5" aria-hidden="true" /></span>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">Acesso demonstrativo</p>
            <p className="text-xs text-muted-foreground">Perfil e unidade não definidos</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" disabled aria-label="Sair — disponível em breve" title="Saída disponível após a implementação do login"><LogOut aria-hidden="true" /></Button>
      </div>
    </header>
  )
}
