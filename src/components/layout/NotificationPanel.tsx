import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAppStore } from '@/stores/appStore'
import { selecionarAlertas, selecionarMedicamentos, selecionarUnidades } from '@/stores/appSelectors'
import { useAuthStore } from '@/stores/authStore'
import { filtrarAlertasDoUsuario } from '@/utils/alertas'

const titulos = { ESTOQUE_BAIXO: 'Estoque baixo', ESTOQUE_CRITICO: 'Estoque crítico', VENCIMENTO: 'Vencimento' }

export default function NotificationPanel() {
  const [aberto, setAberto] = useState(false)
  const navigated = useRef(false)
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const alertas = useAppStore(selecionarAlertas)
  const medicamentos = useAppStore(selecionarMedicamentos)
  const unidades = useAppStore(selecionarUnidades)
  const visiveis = usuario && alertas ? filtrarAlertasDoUsuario(alertas, usuario) : []
  const medicamentoPorId = new Map(medicamentos.map((item) => [item.id, item.nome]))
  const unidadePorId = new Map(unidades.map((item) => [item.id, item.nome]))

  return <Sheet open={aberto} onOpenChange={setAberto}>
    <SheetTrigger asChild><Button variant="ghost" size="icon" className="relative size-11" aria-label={`Notificações: ${visiveis.length} ${visiveis.length === 1 ? 'alerta' : 'alertas'}`} title="Notificações internas"><Bell className="size-5" aria-hidden="true" />{visiveis.length > 0 && <span aria-hidden="true" className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">{visiveis.length > 99 ? '99+' : visiveis.length}</span>}</Button></SheetTrigger>
    <SheetContent className="w-full max-w-[90vw] gap-0 p-0 sm:max-w-md [&>button]:flex [&>button]:size-10 [&>button]:items-center [&>button]:justify-center [&>button]:opacity-100" onOpenAutoFocus={(event) => { event.preventDefault(); document.querySelector<HTMLAnchorElement>('[data-slot="sheet-content"] a')?.focus() }} onCloseAutoFocus={(event) => { if (navigated.current) { event.preventDefault(); document.getElementById('conteudo-principal')?.focus({ preventScroll: true }); navigated.current = false } }}>
      <SheetHeader className="border-b px-5 py-5"><SheetTitle>Notificações</SheetTitle><SheetDescription>{visiveis.length} {visiveis.length === 1 ? 'situação ativa' : 'situações ativas'} para o seu perfil.</SheetDescription></SheetHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {visiveis.length === 0 ? <p className="px-5 py-8 text-sm text-muted-foreground">Nenhum alerta ativo no momento.</p> : <div className="divide-y">{visiveis.slice(0, 8).map((item) => <Link key={item.id} to={`/alertas?tipo=${item.tipo}&unidade=${item.unidadeId}`} onClick={() => { navigated.current = true; setAberto(false) }} className="block px-5 py-4 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"><span className={`text-xs font-semibold ${item.severidade === 'CRITICA' ? 'text-red-700' : 'text-amber-700'}`}>{titulos[item.tipo]}</span><p className="mt-1 text-sm font-medium">{medicamentoPorId.get(item.medicamentoId) ?? 'Medicamento'} · {unidadePorId.get(item.unidadeId) ?? 'Unidade'}</p><p className="mt-1 text-xs text-muted-foreground">{item.mensagem}</p></Link>)}</div>}
      </div>
      <div className="border-t p-5"><Button asChild className="w-full"><Link to="/alertas" onClick={() => { navigated.current = true; setAberto(false) }}>Ver todos os alertas</Link></Button></div>
    </SheetContent>
  </Sheet>
}
