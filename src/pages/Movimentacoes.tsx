import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import EntradaForm from '@/components/movimentacoes/EntradaForm'
import SaidaForm from '@/components/movimentacoes/SaidaForm'
import HistoricoRecente from '@/components/movimentacoes/HistoricoRecente'
import { Button } from '@/components/ui/button'
import { ConsultaEstado } from '@/components/consultas/ConsultaUI'
import { useConsultas } from '@/hooks/useConsultas'
import { useAppStore } from '@/stores/appStore'
import { selecionarLotes, selecionarMedicamentos, selecionarMovimentacoes, selecionarUnidades } from '@/stores/appSelectors'
import { filtrarDadosDaUnidade } from '@/utils/escopo'

type Modo = 'ENTRADA' | 'SAIDA'

export default function Movimentacoes() {
  const [parametros] = useSearchParams()
  const [modo, setModo] = useState<Modo>(parametros.get('operacao') === 'SAIDA' ? 'SAIDA' : 'ENTRADA')
  const { consultas, usuario, dadosCarregados, erro } = useConsultas()
  const medicamentos = useAppStore(selecionarMedicamentos)
  const unidades = useAppStore(selecionarUnidades)
  const movimentacoes = useAppStore(selecionarMovimentacoes)
  const todosLotes = useAppStore(selecionarLotes)
  const limparErro = useAppStore((state) => state.limparErroOperacao)
  useEffect(() => { limparErro() }, [limparErro])
  const visiveis = usuario ? filtrarDadosDaUnidade(usuario, { unidades, lotes: [], estoque: [], movimentacoes }).movimentacoes : []
  const mudarModo = (novo: Modo) => { setModo(novo); limparErro() }

  return <ConsultaEstado carregado={dadosCarregados} erro={erro}>
    {usuario && consultas && <div className="space-y-6">
      <p className="text-sm leading-6 text-muted-foreground">Registre entradas e saídas por lote. O saldo e o histórico são atualizados após a confirmação.</p>
      <section className="rounded-xl border bg-white p-5 sm:p-6" aria-labelledby="titulo-registro">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5"><div><h2 id="titulo-registro" className="text-lg font-semibold">Nova movimentação</h2><p className="mt-1 text-sm text-muted-foreground">Selecione a operação e preencha os dados do lote.</p></div><div className="inline-flex rounded-md border bg-slate-50 p-1" role="group" aria-label="Tipo de movimentação"><Button type="button" size="sm" variant={modo === 'ENTRADA' ? 'default' : 'ghost'} aria-pressed={modo === 'ENTRADA'} onClick={() => mudarModo('ENTRADA')}>Entrada</Button><Button type="button" size="sm" variant={modo === 'SAIDA' ? 'default' : 'ghost'} aria-pressed={modo === 'SAIDA'} onClick={() => mudarModo('SAIDA')}>Saída</Button></div></div>
        <div className="pt-5">{modo === 'ENTRADA'
          ? <EntradaForm usuario={usuario} unidades={consultas.unidades} medicamentos={medicamentos} lotes={consultas.lotes.map((item) => item.lote)} />
          : <SaidaForm usuario={usuario} unidades={consultas.unidades} medicamentos={medicamentos} lotes={consultas.lotes.map((item) => item.lote)} />}</div>
      </section>
      <HistoricoRecente movimentacoes={visiveis} medicamentos={medicamentos} lotes={todosLotes} unidades={unidades} />
    </div>}
  </ConsultaEstado>
}
