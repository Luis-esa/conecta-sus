import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Menu, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { selecionarUnidades } from '@/stores/appSelectors'
import { nomePerfil } from '@/routes/permissoes'
import AppSidebar from './AppSidebar'
import NotificationPanel from './NotificationPanel'

function MobileNavigation() {
  const [open, setOpen] = useState(false)
  const navigated = useRef(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  return <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="size-11 shrink-0 lg:hidden" aria-label="Abrir menu de navegação"><Menu className="size-5" aria-hidden="true" /></Button>
    </SheetTrigger>
    <SheetContent
      side="left"
      className="w-72 max-w-[85vw] gap-0 border-0 p-0 [&>button]:flex [&>button]:size-10 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-md [&>button]:text-white [&>button]:opacity-100 [&>button]:focus-visible:outline-white lg:hidden"
      onOpenAutoFocus={(event) => {
        const target = document.querySelector<HTMLAnchorElement>('[data-slot="sheet-content"] nav a[aria-current="page"]')
          ?? document.querySelector<HTMLAnchorElement>('[data-slot="sheet-content"] nav a')
        if (target) { event.preventDefault(); target.focus() }
      }}
      onCloseAutoFocus={(event) => {
        if (navigated.current) {
          event.preventDefault()
          document.getElementById('conteudo-principal')?.focus({ preventScroll: true })
          navigated.current = false
        }
      }}
    >
      <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
      <SheetDescription className="sr-only">Áreas do ConectaSUS</SheetDescription>
      <AppSidebar onNavigate={() => { navigated.current = true; setOpen(false) }} />
    </SheetContent>
  </Sheet>
}

export default function AppHeader({ title, group, contentHeading }: {
  title: string
  group: string
  contentHeading: boolean
}) {
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const logout = useAuthStore((state) => state.logout)
  const erro = useAuthStore((state) => state.erro)
  const unidades = useAppStore(selecionarUnidades)
  const unidade = unidades.find((item) => item.id === usuario?.unidadeId)
  const perfil = usuario ? nomePerfil[usuario.role] : ''

  return <header className="sticky top-0 z-20 border-b bg-white px-4 py-2 sm:px-8">
    <div className="flex min-h-12 min-w-0 items-center gap-2">
      <MobileNavigation />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-muted-foreground">ConectaSUS <span aria-hidden="true" className="px-1">/</span> {group}</p>
        {!contentHeading && <h1 className="truncate text-lg font-semibold tracking-tight text-foreground" title={title}>{title}</h1>}
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <NotificationPanel />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 max-w-52 gap-2 px-2 sm:max-w-60 sm:px-3" aria-label={`Abrir menu do usuário: ${usuario?.nome ?? 'Usuário atual'}`} title="Usuário e perfil">
              <UserRound className="size-5 text-primary" aria-hidden="true" />
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block truncate text-sm font-medium leading-4">{usuario?.nome}</span>
                <span className="block truncate text-xs font-normal leading-4 text-muted-foreground">{perfil}{unidade ? ` · ${unidade.nome}` : ''}</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-2rem)]">
            <DropdownMenuLabel className="space-y-1 px-3 py-3 font-normal">
              <span className="block wrap-anywhere text-sm font-semibold text-foreground">{usuario?.nome}</span>
              <span className="block text-xs text-muted-foreground">{perfil}</span>
              {unidade && <span className="block text-xs text-muted-foreground">Unidade: {unidade.nome}</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout} className="min-h-10 gap-2 px-3 text-destructive focus:text-destructive">
              <LogOut className="size-4" aria-hidden="true" />Sair do sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    {usuario && <p className="truncate pl-13 text-xs text-muted-foreground sm:hidden">{perfil}{unidade ? ` · ${unidade.nome}` : ''}</p>}
    {erro && <p role="alert" className="mt-1 text-right text-xs text-destructive">{erro}</p>}
  </header>
}
