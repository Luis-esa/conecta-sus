import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import { ConsultaEstado } from '@/components/consultas/ConsultaUI'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useConsultas } from '@/hooks/useConsultas'
import { useAppStore } from '@/stores/appStore'
import { selecionarMedicamentos, selecionarMovimentacoes, selecionarUnidades } from '@/stores/appSelectors'
import { filtrarDadosDaUnidade } from '@/utils/escopo'

const formularioSchema = z.object({
  origemId: z.string().min(1, 'Selecione a unidade de origem.'),
  destinoId: z.string().min(1, 'Selecione a unidade de destino.'),
  medicamentoId: z.string().min(1, 'Selecione um medicamento.'),
  loteId: z.string().min(1, 'Selecione um lote.'),
  quantidade: z.number({ error: 'Informe uma quantidade válida.' }).int('Informe um número inteiro.').positive('A quantidade deve ser maior que zero.'),
}).refine((campos) => !campos.origemId || !campos.destinoId || campos.origemId !== campos.destinoId,
  { message: 'A unidade de destino deve ser diferente da origem.', path: ['destinoId'] })
type Campos = z.infer<typeof formularioSchema>
const seletor = 'ui-control h-11'

export default function Transferencias() {
  const { consultas, usuario, dadosCarregados, erro } = useConsultas()
  const unidades = useAppStore(selecionarUnidades)
  const medicamentos = useAppStore(selecionarMedicamentos)
  const movimentacoes = useAppStore(selecionarMovimentacoes)
  const registrar = useAppStore((state) => state.registrarTransferencia)
  const carregando = useAppStore((state) => state.operacaoCarregando)
  const erroOperacao = useAppStore((state) => state.operacaoErro)
  const limparErro = useAppStore((state) => state.limparErroOperacao)
  const [sucesso, setSucesso] = useState('')
  const padrao = { origemId: usuario?.role === 'UBS' ? String(usuario.unidadeId) : '', destinoId: '', medicamentoId: '', loteId: '', quantidade: undefined }
  const { register, control, setValue, handleSubmit, reset, formState: { errors } } = useForm<Campos>({ resolver: zodResolver(formularioSchema), defaultValues: padrao })
  const origemId = useWatch({ control, name: 'origemId' })
  const destinoId = useWatch({ control, name: 'destinoId' })
  const medicamentoId = useWatch({ control, name: 'medicamentoId' })
  const loteId = useWatch({ control, name: 'loteId' })
  const lotes = consultas?.lotes.map((item) => item.lote) ?? []
  const lotesDisponiveis = lotes.filter((item) => item.unidadeId === Number(origemId) && item.medicamentoId === Number(medicamentoId) && item.quantidade > 0)
  const loteSelecionado = lotesDisponiveis.find((item) => item.id === Number(loteId))
  const origemCampo = register('origemId')
  const medicamentoCampo = register('medicamentoId')
  const recentes = (usuario ? filtrarDadosDaUnidade(usuario, { unidades, lotes: [], estoque: [], movimentacoes }).movimentacoes : [])
    .filter((item) => item.tipo === 'TRANSFERENCIA')
    .sort((a, b) => b.dataHora.localeCompare(a.dataHora) || b.id - a.id).slice(0, 10)
  const unidadePorId = new Map(unidades.map((item) => [item.id, item.nome]))
  const medicamentoPorId = new Map(medicamentos.map((item) => [item.id, item.nome]))

  useEffect(() => { limparErro() }, [limparErro])
  const enviar = handleSubmit(async (campos) => {
    setSucesso('')
    if (!usuario) return
    const ok = await registrar({ origemId: Number(campos.origemId), destinoId: Number(campos.destinoId), medicamentoId: Number(campos.medicamentoId), loteId: Number(campos.loteId), quantidade: campos.quantidade, usuarioId: usuario.id })
    if (ok) { reset(padrao); setValue('quantidade', Number.NaN); setSucesso('Transferência registrada. Os saldos das duas unidades e o histórico foram atualizados.') }
  }, () => { limparErro(); setSucesso('') })

  return <ConsultaEstado carregado={dadosCarregados} erro={erro}>
    {usuario && consultas && <div className="space-y-6">
      <p className="text-sm leading-6 text-muted-foreground">Movimente um lote entre unidades. A operação atualiza os dois estoques e registra o histórico.</p>
      <section className="rounded-xl border bg-white p-5 sm:p-6" aria-labelledby="titulo-transferencia">
        <div className="border-b pb-5"><h2 id="titulo-transferencia" className="text-lg font-semibold">Nova transferência</h2><p className="mt-1 text-sm text-muted-foreground">Selecione a origem, o destino e o lote com saldo disponível.</p></div>
        <form onSubmit={enviar} noValidate className="space-y-5 pt-5" aria-label="Registrar transferência">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="transf-origem">Unidade de origem</Label><select id="transf-origem" className={seletor} aria-invalid={Boolean(errors.origemId)} aria-describedby={errors.origemId ? 'transf-origem-erro' : undefined} {...origemCampo} onChange={(event) => { void origemCampo.onChange(event); setValue('loteId', ''); if (destinoId === event.target.value) setValue('destinoId', '') }}><option value="">Selecione</option>{(usuario.role === 'UBS' ? consultas.unidades : unidades).filter((item) => item.status === 'ATIVA').map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>{errors.origemId && <p id="transf-origem-erro" role="alert" className="text-sm text-destructive">{errors.origemId.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="transf-destino">Unidade de destino</Label><select id="transf-destino" className={seletor} aria-invalid={Boolean(errors.destinoId)} aria-describedby={errors.destinoId ? 'transf-destino-erro transf-destino-ajuda' : 'transf-destino-ajuda'} {...register('destinoId')}><option value="">Selecione</option>{unidades.filter((item) => item.status === 'ATIVA' && item.id !== Number(origemId)).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select><p id="transf-destino-ajuda" className="text-helper text-muted-foreground">{origemId ? 'Escolha uma unidade diferente da origem.' : 'Selecione a origem para definir o destino.'}</p>{errors.destinoId && <p id="transf-destino-erro" role="alert" className="text-sm text-destructive">{errors.destinoId.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="transf-medicamento">Medicamento</Label><select id="transf-medicamento" className={seletor} aria-invalid={Boolean(errors.medicamentoId)} aria-describedby={errors.medicamentoId ? 'transf-medicamento-erro' : undefined} {...medicamentoCampo} onChange={(event) => { void medicamentoCampo.onChange(event); setValue('loteId', '') }}><option value="">Selecione</option>{medicamentos.filter((item) => item.ativo).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>{errors.medicamentoId && <p id="transf-medicamento-erro" role="alert" className="text-sm text-destructive">{errors.medicamentoId.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="transf-lote">Lote</Label><select id="transf-lote" className={seletor} aria-invalid={Boolean(errors.loteId)} aria-describedby={errors.loteId ? 'transf-lote-erro transf-lote-ajuda' : 'transf-lote-ajuda'} {...register('loteId')}><option value="">Selecione</option>{lotesDisponiveis.map((item) => <option key={item.id} value={item.id}>{item.numero} · {item.quantidade} disponíveis</option>)}</select>{errors.loteId && <p id="transf-lote-erro" role="alert" className="text-sm text-destructive">{errors.loteId.message}</p>}<p id="transf-lote-ajuda" className="text-helper text-muted-foreground">{loteSelecionado ? `Disponível: ${loteSelecionado.quantidade} · validade ${format(parseISO(loteSelecionado.dataValidade), 'dd/MM/yyyy')}` : !origemId || !medicamentoId ? 'Selecione primeiro origem e medicamento para visualizar os lotes disponíveis.' : lotesDisponiveis.length === 0 ? 'Nenhum lote com saldo para esta combinação.' : 'Escolha um lote com saldo disponível.'}</p></div>
            <div className="space-y-2"><Label htmlFor="transf-quantidade">Quantidade</Label><Input id="transf-quantidade" className="h-11" type="number" min="1" step="1" placeholder="0" aria-invalid={Boolean(errors.quantidade)} aria-describedby={errors.quantidade ? 'transf-quantidade-erro' : undefined} {...register('quantidade', { valueAsNumber: true })} />{errors.quantidade && <p id="transf-quantidade-erro" role="alert" className="text-sm text-destructive">{errors.quantidade.message}</p>}</div>
          </div>
          {erroOperacao && <p role="alert" className="rounded-md border border-destructive/20 bg-red-50 p-3 text-sm text-destructive">{erroOperacao}</p>}
          {sucesso && <p role="status" className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{sucesso}</p>}
          <Button type="submit" disabled={carregando}>{carregando ? 'Transferindo…' : 'Registrar transferência'}</Button>
        </form>
      </section>
      <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="titulo-transferencias-recentes">
        <div className="border-b px-5 py-5 sm:px-6"><h2 id="titulo-transferencias-recentes" className="text-lg font-semibold">Transferências recentes</h2><p className="mt-1 text-sm text-muted-foreground">Últimas transferências disponíveis para o seu perfil.</p></div>
        {recentes.length === 0 ? <p className="px-5 py-8 text-sm text-muted-foreground">Nenhuma transferência registrada.</p> : <Table className="min-w-[780px]"><TableHeader className="bg-slate-50"><TableRow><TableHead className="pl-5">Data</TableHead><TableHead>Medicamento</TableHead><TableHead>Origem</TableHead><TableHead>Destino</TableHead><TableHead className="text-right">Quantidade</TableHead><TableHead className="pr-5">Usuário</TableHead></TableRow></TableHeader><TableBody>{recentes.map((item) => <TableRow key={item.id}><TableCell className="pl-5">{format(parseISO(item.dataHora), 'dd/MM/yyyy')}</TableCell><TableCell className="font-medium">{medicamentoPorId.get(item.medicamentoId) ?? 'Medicamento'}</TableCell><TableCell>{unidadePorId.get(item.origemId ?? -1) ?? 'Origem'}</TableCell><TableCell>{unidadePorId.get(item.destinoId ?? -1) ?? 'Destino'}</TableCell><TableCell className="text-right font-semibold tabular-nums">{item.quantidade}</TableCell><TableCell className="pr-5">#{item.usuarioId}</TableCell></TableRow>)}</TableBody></Table>}
      </section>
    </div>}
  </ConsultaEstado>
}
