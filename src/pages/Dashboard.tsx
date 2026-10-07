import { useMemo } from 'react'
import { Boxes, Building2, CalendarClock, CircleAlert, Pill, ArrowLeftRight } from 'lucide-react'
import { AlertSummary, RecentMovements } from '@/components/dashboard/ActivityPanels'
import StatCard from '@/components/dashboard/StatCard'
import StockOverview from '@/components/dashboard/StockOverview'
import UnitsTable from '@/components/dashboard/UnitsTable'
import { useAppStore } from '@/stores/appStore'
import { selecionarDadosCarregados, selecionarErro, selecionarEstoque, selecionarLotes, selecionarMedicamentos, selecionarMovimentacoes, selecionarUnidades } from '@/stores/appSelectors'
import { useAuthStore } from '@/stores/authStore'
import { calcularDashboard } from '@/utils/dashboard'

export default function Dashboard() {
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const unidades = useAppStore(selecionarUnidades)
  const medicamentos = useAppStore(selecionarMedicamentos)
  const lotes = useAppStore(selecionarLotes)
  const estoque = useAppStore(selecionarEstoque)
  const movimentacoes = useAppStore(selecionarMovimentacoes)
  const dadosCarregados = useAppStore(selecionarDadosCarregados)
  const erro = useAppStore(selecionarErro)

  const resumo = useMemo(() => usuario ? calcularDashboard({ unidades, medicamentos, lotes, estoque, movimentacoes }, usuario) : null,
    [usuario, unidades, medicamentos, lotes, estoque, movimentacoes])

  if (!dadosCarregados) return erro
    ? <section aria-label="Dashboard" className="rounded-xl border bg-white p-8 text-sm text-muted-foreground">Os indicadores estarão disponíveis após o carregamento dos dados.</section>
    : <section aria-label="Dashboard" role="status" className="rounded-xl border bg-white p-8 text-sm text-muted-foreground">Carregando indicadores do dashboard…</section>
  if (!resumo || (resumo.indicadores.unidades === 0 && resumo.indicadores.medicamentos === 0)) return <section aria-label="Dashboard" className="rounded-xl border bg-white p-8"><h2 className="text-lg font-semibold">Nenhum dado disponível</h2><p className="mt-2 text-sm text-muted-foreground">Ainda não há unidades ou medicamentos para apresentar.</p></section>

  const { indicadores } = resumo
  const visaoUbs = usuario?.role === 'UBS'

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm leading-6 text-muted-foreground">{visaoUbs ? 'Acompanhe a disponibilidade e as movimentações da sua unidade.' : 'Acompanhe a disponibilidade de medicamentos em toda a rede municipal.'}</p>
      </div>

      <section aria-label="Indicadores principais" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard titulo={visaoUbs ? 'Sua unidade' : 'Unidades cadastradas'} valor={indicadores.unidades} detalhe={visaoUbs ? 'Unidade vinculada à sua conta' : 'Unidades da rede municipal'} icone={Building2} />
        <StatCard titulo="Medicamentos" valor={indicadores.medicamentos} detalhe={visaoUbs ? 'Com lotes na sua unidade' : 'Ativos no catálogo municipal'} icone={Pill} />
        <StatCard titulo="Estoque crítico" valor={indicadores.criticos} detalhe="Até 30% do mínimo definido" icone={CircleAlert} tom="vermelho" />
        <StatCard titulo="Estoque baixo" valor={indicadores.baixos} detalhe="Acima do crítico e até o mínimo" icone={Boxes} tom="amarelo" />
        <StatCard titulo="Próximos do vencimento" valor={indicadores.vencimentos} detalhe="Medicamentos por unidade com lote vencido ou em até 90 dias" icone={CalendarClock} tom="amarelo" />
        {indicadores.possibilidadesRedistribuicao !== null && <StatCard titulo="Possíveis redistribuições" valor={indicadores.possibilidadesRedistribuicao} detalhe="Necessidades com outra unidade acima de 2× o mínimo" icone={ArrowLeftRight} tom="verde" />}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <StockOverview dados={resumo.distribuicao} />
        <AlertSummary observacoes={resumo.observacoes} total={resumo.observacoes.length} />
      </div>

      <UnitsTable unidades={resumo.unidades} />
      <RecentMovements movimentacoes={resumo.movimentacoes} />
    </div>
  )
}
