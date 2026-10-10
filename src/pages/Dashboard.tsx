import { useMemo } from 'react'
import { Boxes, Building2, CalendarClock, CircleAlert, Pill, ArrowLeftRight } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import { AlertSummary, RecentMovements } from '@/components/dashboard/ActivityPanels'
import StatCard from '@/components/dashboard/StatCard'
import StockOverview from '@/components/dashboard/StockOverview'
import UnitsTable from '@/components/dashboard/UnitsTable'
import { useAppStore } from '@/stores/appStore'
import { selecionarDadosCarregados, selecionarErro, selecionarEstoque, selecionarLotes, selecionarMedicamentos, selecionarMovimentacoes, selecionarUnidades } from '@/stores/appSelectors'
import { useAuthStore } from '@/stores/authStore'
import { calcularDashboard } from '@/utils/dashboard'
import { FRACAO_ESTOQUE_CRITICO } from '@/utils/estoque'
import { DIAS_ALERTA_VENCIMENTO } from '@/utils/validade'

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
    ? <section aria-label="Dashboard" role="alert" className="ui-panel p-8 text-sm text-destructive">{erro}</section>
    : <section aria-label="Dashboard" role="status" className="rounded-xl border bg-white p-8 text-sm text-muted-foreground">Carregando indicadores do dashboard…</section>
  if (!resumo || (resumo.indicadores.unidades === 0 && resumo.indicadores.medicamentos === 0)) return <section aria-label="Dashboard" className="rounded-xl border bg-white p-8"><h2 className="text-lg font-semibold">Nenhum dado disponível</h2><p className="mt-2 text-sm text-muted-foreground">Ainda não há unidades ou medicamentos para apresentar.</p></section>

  const { indicadores } = resumo
  const visaoUbs = usuario?.role === 'UBS'

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description={visaoUbs ? 'Acompanhe a disponibilidade e as movimentações da sua unidade.' : 'Acompanhe a disponibilidade de medicamentos em toda a rede municipal.'} context={visaoUbs ? 'Sua unidade' : 'Rede municipal de saúde'} />

      <section aria-labelledby="dashboard-atencao" className="space-y-3">
        <div><h2 id="dashboard-atencao" className="text-section font-semibold">Exige atenção</h2><p className="text-body text-muted-foreground">Situações atuais que podem demandar ação da equipe.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard titulo="Estoque crítico" valor={indicadores.criticos} detalhe={`Até ${FRACAO_ESTOQUE_CRITICO * 100}% do mínimo definido`} icone={CircleAlert} tom="vermelho" destaque={indicadores.criticos > 0} to="/alertas?tipo=ESTOQUE_CRITICO" />
          <StatCard titulo="Estoque baixo" valor={indicadores.baixos} detalhe="Acima do crítico e até o mínimo" icone={Boxes} tom="amarelo" to="/alertas?tipo=ESTOQUE_BAIXO" />
          <StatCard titulo="Vencimentos em atenção" valor={indicadores.vencimentos} detalhe={`Lotes vencidos ou em até ${DIAS_ALERTA_VENCIMENTO} dias`} icone={CalendarClock} tom="amarelo" to="/alertas?tipo=VENCIMENTO" />
        </div>
      </section>
      <section aria-labelledby="dashboard-visao" className="space-y-3">
        <h2 id="dashboard-visao" className="text-section font-semibold">Visão da rede</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard titulo={visaoUbs ? 'Sua unidade' : 'Unidades cadastradas'} valor={indicadores.unidades} detalhe={visaoUbs ? 'Unidade vinculada à sua conta' : 'Unidades da rede municipal'} icone={Building2} />
          <StatCard titulo="Medicamentos" valor={indicadores.medicamentos} detalhe={visaoUbs ? 'Com lotes na sua unidade' : 'Ativos no catálogo municipal'} icone={Pill} to="/estoque" />
          {indicadores.possibilidadesRedistribuicao !== null && <StatCard titulo="Possíveis redistribuições" valor={indicadores.possibilidadesRedistribuicao} detalhe="Necessidades com outra unidade acima de 2× o mínimo" icone={ArrowLeftRight} tom="verde" to="/redistribuicao" />}
        </div>
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
