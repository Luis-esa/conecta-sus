import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import FiltrosHistorico from '@/components/relatorios/FiltrosHistorico'
import { ConsultaEstado } from '@/components/consultas/ConsultaUI'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppStore } from '@/stores/appStore'
import { selecionarDadosCarregados, selecionarErro, selecionarLotes, selecionarMedicamentos, selecionarMovimentacoes, selecionarUnidades, selecionarUsuarios } from '@/stores/appSelectors'
import { useAuthStore } from '@/stores/authStore'
import { criarHistorico, filtrarHistorico, filtrosHistoricoIniciais, type FiltrosHistorico as TipoFiltrosHistorico } from '@/utils/historico'

const tipos = { ENTRADA: 'Entrada', SAIDA: 'Saída', TRANSFERENCIA: 'Transferência' }

export default function Historico() {
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const usuarios = useAppStore(selecionarUsuarios)
  const unidades = useAppStore(selecionarUnidades)
  const medicamentos = useAppStore(selecionarMedicamentos)
  const lotes = useAppStore(selecionarLotes)
  const movimentacoes = useAppStore(selecionarMovimentacoes)
  const carregado = useAppStore(selecionarDadosCarregados)
  const erro = useAppStore(selecionarErro)
  const [filtros, setFiltros] = useState<TipoFiltrosHistorico>(filtrosHistoricoIniciais)
  const alterar = (campo: keyof TipoFiltrosHistorico, valor: string) => setFiltros((atual) => ({ ...atual, [campo]: valor }))
  const linhas = useMemo(() => usuario ? criarHistorico({ movimentacoes, medicamentos, lotes, unidades, usuarios }, usuario) : [], [usuario, movimentacoes, medicamentos, lotes, unidades, usuarios])
  const filtradas = useMemo(() => filtrarHistorico(linhas, filtros), [linhas, filtros])
  const medicamentosVisiveis = usuario?.role === 'UBS' ? medicamentos.filter((item) => linhas.some((linha) => linha.movimentacao.medicamentoId === item.id)) : medicamentos
  const usuariosVisiveis = usuario?.role === 'UBS' ? usuarios.filter((item) => linhas.some((linha) => linha.movimentacao.usuarioId === item.id)) : usuarios

  return <ConsultaEstado carregado={carregado} erro={erro}>
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Registro de operações concluídas. As movimentações são somente para consulta e não podem ser excluídas nesta interface.</p>
      <FiltrosHistorico filtros={filtros} alterar={alterar} limpar={() => setFiltros(filtrosHistoricoIniciais)} medicamentos={medicamentosVisiveis} unidades={unidades} usuarios={usuariosVisiveis} ocultarUnidade={usuario?.role === 'UBS'} />
      <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="titulo-lista-historico">
        <div className="border-b px-5 py-4"><h2 id="titulo-lista-historico" className="font-semibold">Histórico de movimentações</h2><p role="status" className="mt-1 text-sm text-muted-foreground">{filtradas.length} de {linhas.length} operações</p></div>
        {filtradas.length === 0 ? <p className="px-5 py-8 text-sm text-muted-foreground">Nenhuma movimentação encontrada para os filtros selecionados.</p> : <div className="overflow-x-auto"><Table className="min-w-[1200px]"><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Operação</TableHead><TableHead>Medicamento</TableHead><TableHead>Lote</TableHead><TableHead className="text-right">Quantidade</TableHead><TableHead>Unidade</TableHead><TableHead>Origem / destino</TableHead><TableHead>Usuário</TableHead><TableHead>Observação</TableHead></TableRow></TableHeader><TableBody>{filtradas.map((linha) => { const item = linha.movimentacao; return <TableRow key={item.id}><TableCell className="whitespace-nowrap">{format(parseISO(item.dataHora), 'dd/MM/yyyy HH:mm')}</TableCell><TableCell>{tipos[item.tipo]}</TableCell><TableCell className="font-medium">{linha.medicamento}</TableCell><TableCell>{linha.lote}</TableCell><TableCell className="text-right tabular-nums">{item.quantidade}</TableCell><TableCell>{linha.unidade}</TableCell><TableCell>{item.tipo === 'TRANSFERENCIA' ? `${linha.origem} → ${linha.destino}` : item.tipo === 'ENTRADA' ? `Destino: ${linha.destino}` : `Origem: ${linha.origem}`}</TableCell><TableCell>{linha.usuario}</TableCell><TableCell className="max-w-64 text-sm text-muted-foreground">{item.observacao || item.motivo || '—'}</TableCell></TableRow> })}</TableBody></Table></div>}
      </section>
    </div>
  </ConsultaEstado>
}
