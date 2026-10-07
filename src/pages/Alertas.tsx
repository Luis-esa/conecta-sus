import { useSearchParams, Link } from 'react-router'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConsultaEstado, FilterSelect, SearchField } from '@/components/consultas/ConsultaUI'
import { useAppStore } from '@/stores/appStore'
import { selecionarAlertas, selecionarDadosCarregados, selecionarErro, selecionarMedicamentos, selecionarUnidades } from '@/stores/appSelectors'
import { useAuthStore } from '@/stores/authStore'
import { filtrarAlertasDoUsuario } from '@/utils/alertas'

const titulos = { ESTOQUE_BAIXO: 'Estoque baixo', ESTOQUE_CRITICO: 'Estoque crítico', VENCIMENTO: 'Vencimento' }
const tipos = [{ value: 'TODOS', label: 'Todos os tipos' }, { value: 'ESTOQUE_BAIXO', label: 'Estoque baixo' }, { value: 'ESTOQUE_CRITICO', label: 'Estoque crítico' }, { value: 'VENCIMENTO', label: 'Vencimento' }]
const severidades = [{ value: 'TODAS', label: 'Todas as severidades' }, { value: 'CRITICA', label: 'Crítica' }, { value: 'ATENCAO', label: 'Atenção' }]

export default function Alertas() {
  const [params, setParams] = useSearchParams()
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const alertas = useAppStore(selecionarAlertas)
  const unidades = useAppStore(selecionarUnidades)
  const medicamentos = useAppStore(selecionarMedicamentos)
  const carregado = useAppStore(selecionarDadosCarregados)
  const erro = useAppStore(selecionarErro)
  const tipo = params.get('tipo') ?? 'TODOS'
  const unidade = params.get('unidade') ?? 'TODAS'
  const severidade = params.get('severidade') ?? 'TODAS'
  const busca = params.get('medicamento') ?? ''
  const alterar = (chave: string, valor: string) => {
    const proximos = new URLSearchParams(params)
    if (!valor || ['TODOS', 'TODAS'].includes(valor)) proximos.delete(chave)
    else proximos.set(chave, valor)
    setParams(proximos)
  }
  const visiveis = usuario && alertas ? filtrarAlertasDoUsuario(alertas, usuario) : []
  const medicamentoPorId = new Map(medicamentos.map((item) => [item.id, item]))
  const unidadePorId = new Map(unidades.map((item) => [item.id, item.nome]))
  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const filtrados = visiveis.filter((item) => (tipo === 'TODOS' || item.tipo === tipo) && (unidade === 'TODAS' || String(item.unidadeId) === unidade) &&
    (severidade === 'TODAS' || item.severidade === severidade) && (!termo || [medicamentoPorId.get(item.medicamentoId)?.nome, medicamentoPorId.get(item.medicamentoId)?.principioAtivo, medicamentoPorId.get(item.medicamentoId)?.codigo]
      .some((valor) => valor?.toLocaleLowerCase('pt-BR').includes(termo))))
  const filtrosAtivos = tipo !== 'TODOS' || unidade !== 'TODAS' || severidade !== 'TODAS' || busca !== ''

  return <ConsultaEstado carregado={carregado} erro={erro}>
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">Situações atuais de estoque e validade. A lista é atualizada após entradas, saídas e transferências.</p>
      <section className="rounded-xl border bg-white p-4 sm:p-5" aria-label="Filtros de alertas">
        <div className={`grid gap-4 sm:grid-cols-2 ${usuario?.role === 'UBS' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
          <SearchField value={busca} onChange={(valor) => alterar('medicamento', valor)} placeholder="Nome, princípio ativo ou código" />
          <FilterSelect id="alerta-tipo" label="Tipo" value={tipo} onChange={(valor) => alterar('tipo', valor)} options={tipos} />
          {usuario?.role !== 'UBS' && <FilterSelect id="alerta-unidade" label="Unidade" value={unidade} onChange={(valor) => alterar('unidade', valor)} options={[{ value: 'TODAS', label: 'Todas as unidades' }, ...unidades.map((item) => ({ value: String(item.id), label: item.nome }))]} />}
          <FilterSelect id="alerta-severidade" label="Severidade" value={severidade} onChange={(valor) => alterar('severidade', valor)} options={severidades} />
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="titulo-alertas-lista">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6"><div><h2 id="titulo-alertas-lista" className="font-semibold">Alertas ativos</h2><p role="status" className="mt-1 text-sm text-muted-foreground">{filtrados.length} de {visiveis.length} {visiveis.length === 1 ? 'alerta' : 'alertas'}</p></div>{filtrosAtivos && <Button size="sm" variant="ghost" onClick={() => setParams(new URLSearchParams())}>Limpar filtros</Button>}</div>
        {filtrados.length === 0 ? <div className="px-5 py-12 text-center sm:px-6"><p className="font-medium">{filtrosAtivos ? 'Nenhum alerta encontrado' : 'Nenhum alerta ativo no momento'}</p><p className="mt-2 text-sm text-muted-foreground">{filtrosAtivos ? 'Altere os filtros para ampliar a consulta.' : 'Os estoques e lotes atuais não exigem atenção para este perfil.'}</p>{filtrosAtivos && <Button variant="outline" className="mt-5" onClick={() => setParams(new URLSearchParams())}>Limpar filtros</Button>}</div> : <div className="divide-y">{filtrados.map((item) => {
          const medicamento = medicamentoPorId.get(item.medicamentoId)
          return <article key={item.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4 sm:px-6">
            <div className="min-w-0 space-y-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{medicamento?.nome ?? 'Medicamento'}</h3><Badge variant="outline" className={item.severidade === 'CRITICA' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800'}>{item.severidade === 'CRITICA' ? 'Crítica' : 'Atenção'}</Badge></div><p className="text-sm text-muted-foreground">{unidadePorId.get(item.unidadeId) ?? 'Unidade'} · {titulos[item.tipo]}{item.dataValidade ? ` · validade ${format(parseISO(item.dataValidade), 'dd/MM/yyyy')}` : ''}</p><p className="text-sm">{item.mensagem}</p></div>
            <Button asChild variant="outline" size="sm"><Link to={item.tipo === 'VENCIMENTO' ? `/lotes?busca=${encodeURIComponent(medicamento?.nome ?? '')}&unidade=${item.unidadeId}` : '/estoque'}>Ver {item.tipo === 'VENCIMENTO' ? 'lotes' : 'estoque'}</Link></Button>
          </article>
        })}</div>}
      </section>
    </div>
  </ConsultaEstado>
}
