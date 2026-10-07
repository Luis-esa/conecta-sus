import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format, parseISO } from 'date-fns'
import FiltrosHistorico from '@/components/relatorios/FiltrosHistorico'
import { ConsultaEstado } from '@/components/consultas/ConsultaUI'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppStore } from '@/stores/appStore'
import { selecionarDadosCarregados, selecionarErro, selecionarEstoque, selecionarLotes, selecionarMedicamentos, selecionarMovimentacoes, selecionarUnidades, selecionarUsuarios } from '@/stores/appSelectors'
import { useAuthStore } from '@/stores/authStore'
import { analisarConsumo } from '@/utils/consumo'
import { criarConsultas } from '@/utils/consultas'
import { filtrarDadosDaUnidade } from '@/utils/escopo'
import { criarHistorico, filtrarHistorico, filtrosHistoricoIniciais, type FiltrosHistorico as TipoFiltrosHistorico } from '@/utils/historico'
import { movimentosPorMes, resumirRelatorios } from '@/utils/relatorios'

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const cores = { NORMAL: '#15803d', BAIXO: '#ca8a04', CRITICO: '#dc2626' }

function Cartao({ titulo, valor }: { titulo: string; valor: string | number }) {
  return <div className="rounded-lg border bg-slate-50 p-4"><p className="text-xs font-medium text-muted-foreground">{titulo}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{valor}</p></div>
}

export default function Relatorios() {
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const usuarios = useAppStore(selecionarUsuarios)
  const unidades = useAppStore(selecionarUnidades)
  const medicamentos = useAppStore(selecionarMedicamentos)
  const lotes = useAppStore(selecionarLotes)
  const estoque = useAppStore(selecionarEstoque)
  const movimentacoes = useAppStore(selecionarMovimentacoes)
  const carregado = useAppStore(selecionarDadosCarregados)
  const erro = useAppStore(selecionarErro)
  const [filtros, setFiltros] = useState<TipoFiltrosHistorico>(filtrosHistoricoIniciais)
  const alterar = (campo: keyof TipoFiltrosHistorico, valor: string) => setFiltros((atual) => ({ ...atual, [campo]: valor }))
  const consultas = useMemo(() => usuario ? criarConsultas({ unidades, medicamentos, lotes, estoque }, usuario) : null, [usuario, unidades, medicamentos, lotes, estoque])
  const escopo = useMemo(() => usuario ? filtrarDadosDaUnidade(usuario, { unidades, lotes, estoque, movimentacoes }) : null, [usuario, unidades, lotes, estoque, movimentacoes])
  const historico = useMemo(() => usuario ? criarHistorico({ usuarios, unidades, medicamentos, lotes, movimentacoes }, usuario) : [], [usuario, usuarios, unidades, medicamentos, lotes, movimentacoes])
  const movimentosFiltrados = useMemo(() => filtrarHistorico(historico, filtros), [historico, filtros])
  const estoqueFiltrado = consultas?.estoque.filter((item) => (filtros.medicamentoId === 'TODOS' || item.medicamento.id === Number(filtros.medicamentoId)) && (filtros.unidadeId === 'TODAS' || item.unidade.id === Number(filtros.unidadeId))) ?? []
  const lotesFiltrados = consultas?.lotes.filter((item) => item.lote.quantidade > 0 && (filtros.medicamentoId === 'TODOS' || item.medicamento.id === Number(filtros.medicamentoId)) && (filtros.unidadeId === 'TODAS' || item.unidade.id === Number(filtros.unidadeId))) ?? []
  const consumo = useMemo(() => escopo ? analisarConsumo(escopo) : [], [escopo])
  const consumoFiltrado = consumo.filter((item) => (filtros.medicamentoId === 'TODOS' || item.medicamentoId === Number(filtros.medicamentoId)) && (filtros.unidadeId === 'TODAS' || item.unidadeId === Number(filtros.unidadeId)))
  const resumo = resumirRelatorios({ estoque: estoqueFiltrado, lotes: lotesFiltrados, movimentacoes: movimentosFiltrados, consumo: consumoFiltrado })
  const situacoes = (['NORMAL', 'BAIXO', 'CRITICO'] as const).map((status) => ({ nome: status === 'BAIXO' ? 'Baixo' : status === 'CRITICO' ? 'Crítico' : 'Normal', quantidade: estoqueFiltrado.filter((item) => item.status === status).length, cor: cores[status] }))
  const seriesMovimentos = movimentosPorMes(movimentosFiltrados)
  const consumoComHistorico = consumoFiltrado.filter((item) => item.consumoMedioMensal !== null).sort((a, b) => (b.consumoMedioMensal ?? 0) - (a.consumoMedioMensal ?? 0))
  const nomesMedicamentos = new Map(medicamentos.map((item) => [item.id, item.nome]))
  const nomesUnidades = new Map(unidades.map((item) => [item.id, item.nome]))

  return <ConsultaEstado carregado={carregado} erro={erro}>
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Relatórios derivados dos lotes e movimentações atuais. Medicamento e unidade filtram todas as seções; período, operação e usuário filtram apenas movimentações.</p>
      <FiltrosHistorico filtros={filtros} alterar={alterar} limpar={() => setFiltros(filtrosHistoricoIniciais)} medicamentos={medicamentos} unidades={unidades} usuarios={usuarios} ocultarUnidade={usuario?.role === 'UBS'} />
      <section className="space-y-4 rounded-xl border bg-white p-5" aria-labelledby="relatorio-estoque"><div><h2 id="relatorio-estoque" className="text-lg font-semibold">Estoque</h2><p className="text-sm text-muted-foreground">Saldos atuais, somados dos lotes.</p></div><div className="grid gap-3 sm:grid-cols-3"><Cartao titulo="Quantidade total em estoque" valor={resumo.saldoTotal} /><Cartao titulo="Estoques baixos" valor={resumo.baixos} /><Cartao titulo="Estoques críticos" valor={resumo.criticos} /></div>
        {estoqueFiltrado.length > 0 && <div className="h-56 w-full" role="img" aria-label="Distribuição dos estoques por situação"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={situacoes.filter((item) => item.quantidade > 0)} dataKey="quantidade" nameKey="nome" outerRadius={80} label>{situacoes.filter((item) => item.quantidade > 0).map((item) => <Cell key={item.nome} fill={item.cor} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>}
        {estoqueFiltrado.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum estoque encontrado.</p> : <div className="overflow-x-auto"><Table className="min-w-[620px]"><TableHeader><TableRow><TableHead>Medicamento</TableHead><TableHead>Unidade</TableHead><TableHead className="text-right">Saldo</TableHead><TableHead className="text-right">Mínimo</TableHead><TableHead>Situação</TableHead></TableRow></TableHeader><TableBody>{estoqueFiltrado.map((item) => <TableRow key={`${item.medicamento.id}-${item.unidade.id}`}><TableCell>{item.medicamento.nome}</TableCell><TableCell>{item.unidade.nome}</TableCell><TableCell className="text-right tabular-nums">{item.quantidade}</TableCell><TableCell className="text-right tabular-nums">{item.medicamento.estoqueMinimo}</TableCell><TableCell>{item.status === 'CRITICO' ? 'Crítico' : item.status === 'BAIXO' ? 'Baixo' : 'Normal'}</TableCell></TableRow>)}</TableBody></Table></div>}
      </section>
      <section className="space-y-4 rounded-xl border bg-white p-5" aria-labelledby="relatorio-validade"><div><h2 id="relatorio-validade" className="text-lg font-semibold">Validade</h2><p className="text-sm text-muted-foreground">Lotes com saldo, ordenados pela data de vencimento.</p></div><Cartao titulo="Lotes vencidos ou próximos do vencimento" valor={resumo.lotesAtencao} />{lotesFiltrados.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum lote com saldo encontrado.</p> : <div className="overflow-x-auto"><Table className="min-w-[620px]"><TableHeader><TableRow><TableHead>Medicamento</TableHead><TableHead>Lote</TableHead><TableHead>Unidade</TableHead><TableHead>Validade</TableHead><TableHead className="text-right">Saldo</TableHead><TableHead>Situação</TableHead></TableRow></TableHeader><TableBody>{lotesFiltrados.map((item) => <TableRow key={item.lote.id}><TableCell>{item.medicamento.nome}</TableCell><TableCell>{item.lote.numero}</TableCell><TableCell>{item.unidade.nome}</TableCell><TableCell>{format(parseISO(item.lote.dataValidade), 'dd/MM/yyyy')}</TableCell><TableCell className="text-right tabular-nums">{item.lote.quantidade}</TableCell><TableCell>{item.statusValidade === 'VENCIDO' ? 'Vencido' : item.statusValidade === 'PROXIMO' ? 'Próximo' : 'Regular'}</TableCell></TableRow>)}</TableBody></Table></div>}</section>
      <section className="space-y-4 rounded-xl border bg-white p-5" aria-labelledby="relatorio-movimentos"><div><h2 id="relatorio-movimentos" className="text-lg font-semibold">Movimentações</h2><p className="text-sm text-muted-foreground">Operações do período selecionado, sem duplicar lançamentos internos de transferências.</p></div><div className="grid gap-3 sm:grid-cols-3"><Cartao titulo="Entradas" valor={resumo.entradas} /><Cartao titulo="Saídas" valor={resumo.saidas} /><Cartao titulo="Transferências" valor={resumo.transferencias} /></div><p className="text-sm text-muted-foreground">Quantidade movimentada: {resumo.quantidadeEntrada} em entradas e {resumo.quantidadeSaida} em saídas.</p>
        {seriesMovimentos.length > 0 && <div className="h-64 w-full" role="img" aria-label="Quantidades movimentadas por mês"><ResponsiveContainer width="100%" height="100%"><BarChart data={seriesMovimentos}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="entradas" name="Entradas" fill="#2563eb" /><Bar dataKey="saidas" name="Saídas" fill="#ca8a04" /><Bar dataKey="transferencias" name="Transferências" fill="#15803d" /></BarChart></ResponsiveContainer></div>}
        {movimentosFiltrados.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma movimentação no período ou filtros selecionados.</p> : <div className="overflow-x-auto"><Table className="min-w-[680px]"><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Operação</TableHead><TableHead>Medicamento</TableHead><TableHead className="text-right">Quantidade</TableHead><TableHead>Origem / destino</TableHead></TableRow></TableHeader><TableBody>{movimentosFiltrados.map((item) => <TableRow key={item.movimentacao.id}><TableCell>{format(parseISO(item.movimentacao.dataHora), 'dd/MM/yyyy')}</TableCell><TableCell>{item.movimentacao.tipo}</TableCell><TableCell>{item.medicamento}</TableCell><TableCell className="text-right tabular-nums">{item.movimentacao.quantidade}</TableCell><TableCell>{item.movimentacao.tipo === 'TRANSFERENCIA' ? `${item.origem} → ${item.destino}` : item.unidade}</TableCell></TableRow>)}</TableBody></Table></div>}
      </section>
      <section className="space-y-4 rounded-xl border bg-white p-5" aria-labelledby="relatorio-consumo"><div><h2 id="relatorio-consumo" className="text-lg font-semibold">Consumo</h2><p className="text-sm text-muted-foreground">Média mensal das saídas em três meses completos; transferências não contam como consumo.</p></div><Cartao titulo="Estoques com histórico suficiente" valor={resumo.consumoComHistorico} />{consumoComHistorico.length === 0 ? <p className="text-sm text-muted-foreground">Sem histórico de consumo suficiente.</p> : <><div className="h-64 w-full" role="img" aria-label="Maiores médias mensais de consumo"><ResponsiveContainer width="100%" height="100%"><BarChart data={consumoComHistorico.slice(0, 8).map((item) => ({ nome: `${nomesMedicamentos.get(item.medicamentoId) ?? 'Medicamento'} · ${nomesUnidades.get(item.unidadeId) ?? 'Unidade'}`, media: item.consumoMedioMensal }))} layout="vertical" margin={{ left: 24, right: 12 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="nome" type="category" width={180} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="media" name="Média mensal" fill="#2563eb" /></BarChart></ResponsiveContainer></div><div className="overflow-x-auto"><Table className="min-w-[620px]"><TableHeader><TableRow><TableHead>Medicamento</TableHead><TableHead>Unidade</TableHead><TableHead className="text-right">Estoque</TableHead><TableHead className="text-right">Média mensal</TableHead><TableHead className="text-right">Meses de estoque</TableHead></TableRow></TableHeader><TableBody>{consumoFiltrado.map((item) => <TableRow key={`${item.medicamentoId}-${item.unidadeId}`}><TableCell>{nomesMedicamentos.get(item.medicamentoId)}</TableCell><TableCell>{nomesUnidades.get(item.unidadeId)}</TableCell><TableCell className="text-right tabular-nums">{item.estoqueAtual}</TableCell><TableCell className="text-right tabular-nums">{item.consumoMedioMensal === null ? '—' : numero.format(item.consumoMedioMensal)}</TableCell><TableCell className="text-right tabular-nums">{item.mesesDeEstoque === null ? 'Sem histórico de consumo suficiente.' : numero.format(item.mesesDeEstoque)}</TableCell></TableRow>)}</TableBody></Table></div></>}</section>
    </div>
  </ConsultaEstado>
}
