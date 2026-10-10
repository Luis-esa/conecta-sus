import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/stores/appStore'
import type { Lote, Medicamento, Unidade, Usuario } from '@/types'

const formularioSchema = z.object({
  medicamentoId: z.string().min(1, 'Selecione um medicamento.'),
  unidadeId: z.string().min(1, 'Selecione uma unidade.'),
  loteId: z.string().min(1, 'Selecione um lote.'),
  quantidade: z.number({ error: 'Informe uma quantidade válida.' }).int('Informe um número inteiro.').positive('A quantidade deve ser maior que zero.'),
  destinoMotivo: z.string().trim().min(1, 'Informe o destino ou motivo.'),
  data: z.iso.date('Informe uma data válida.'),
  observacao: z.string().max(500, 'A observação deve ter até 500 caracteres.'),
})
type CamposSaida = z.infer<typeof formularioSchema>

const seletor = 'ui-control h-11'

export default function SaidaForm({ usuario, unidades, medicamentos, lotes }: { usuario: Usuario; unidades: readonly Unidade[]; medicamentos: readonly Medicamento[]; lotes: readonly Lote[] }) {
  const registrar = useAppStore((state) => state.registrarSaida)
  const carregando = useAppStore((state) => state.operacaoCarregando)
  const erroOperacao = useAppStore((state) => state.operacaoErro)
  const limparErroOperacao = useAppStore((state) => state.limparErroOperacao)
  const [sucesso, setSucesso] = useState('')
  const padrao = { medicamentoId: '', unidadeId: usuario.role === 'UBS' ? String(usuario.unidadeId) : '', loteId: '', quantidade: undefined, destinoMotivo: '', data: format(new Date(), 'yyyy-MM-dd'), observacao: '' }
  const { register, control, setValue, handleSubmit, reset, formState: { errors } } = useForm<CamposSaida>({ resolver: zodResolver(formularioSchema), defaultValues: padrao })
  const medicamentoId = useWatch({ control, name: 'medicamentoId' })
  const unidadeId = useWatch({ control, name: 'unidadeId' })
  const loteId = useWatch({ control, name: 'loteId' })
  const lotesDisponiveis = lotes.filter((item) => item.medicamentoId === Number(medicamentoId) && item.unidadeId === Number(unidadeId) && item.quantidade > 0)
  const loteSelecionado = lotesDisponiveis.find((item) => item.id === Number(loteId))
  const campoMedicamento = register('medicamentoId')
  const campoUnidade = register('unidadeId')

  const enviar = handleSubmit(async (campos) => {
    setSucesso('')
    const ok = await registrar({ medicamentoId: Number(campos.medicamentoId), unidadeId: Number(campos.unidadeId), loteId: Number(campos.loteId), quantidade: campos.quantidade, destinoMotivo: campos.destinoMotivo, data: campos.data, observacao: campos.observacao, usuarioId: usuario.id })
    if (ok) { reset(padrao); setValue('quantidade', Number.NaN); setSucesso('Saída registrada com sucesso. O estoque e o histórico foram atualizados.') }
  }, () => { limparErroOperacao(); setSucesso('') })

  return <form onSubmit={enviar} noValidate className="space-y-5" aria-label="Registrar saída">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="saida-medicamento">Medicamento</Label><select id="saida-medicamento" className={seletor} aria-invalid={Boolean(errors.medicamentoId)} aria-describedby={errors.medicamentoId ? 'saida-medicamento-erro' : undefined} {...campoMedicamento} onChange={(event) => { void campoMedicamento.onChange(event); setValue('loteId', '') }}><option value="">Selecione</option>{medicamentos.filter((item) => item.ativo).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>{errors.medicamentoId && <p id="saida-medicamento-erro" role="alert" className="text-sm text-destructive">{errors.medicamentoId.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="saida-unidade">Unidade de origem</Label><select id="saida-unidade" className={seletor} aria-invalid={Boolean(errors.unidadeId)} aria-describedby={errors.unidadeId ? 'saida-unidade-erro' : undefined} {...campoUnidade} onChange={(event) => { void campoUnidade.onChange(event); setValue('loteId', '') }}><option value="">Selecione</option>{unidades.filter((item) => item.status === 'ATIVA').map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>{errors.unidadeId && <p id="saida-unidade-erro" role="alert" className="text-sm text-destructive">{errors.unidadeId.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="saida-lote">Lote</Label><select id="saida-lote" className={seletor} aria-invalid={Boolean(errors.loteId)} aria-describedby={errors.loteId ? 'saida-lote-erro saida-lote-ajuda' : 'saida-lote-ajuda'} {...register('loteId')}><option value="">Selecione</option>{lotesDisponiveis.map((item) => <option key={item.id} value={item.id}>{item.numero} · {item.quantidade} disponíveis</option>)}</select>{errors.loteId && <p id="saida-lote-erro" role="alert" className="text-sm text-destructive">{errors.loteId.message}</p>}<p id="saida-lote-ajuda" className="text-helper text-muted-foreground">{loteSelecionado ? `Disponível neste lote: ${loteSelecionado.quantidade} · validade ${format(parseISO(loteSelecionado.dataValidade), 'dd/MM/yyyy')}` : !medicamentoId || !unidadeId ? 'Selecione primeiro medicamento e unidade para visualizar os lotes disponíveis.' : lotesDisponiveis.length === 0 ? 'Nenhum lote com saldo para esta combinação.' : 'Escolha um lote com saldo disponível.'}</p></div>
      <div className="space-y-2"><Label htmlFor="saida-quantidade">Quantidade</Label><Input id="saida-quantidade" className="h-11" type="number" min="1" step="1" placeholder="0" aria-invalid={Boolean(errors.quantidade)} aria-describedby={errors.quantidade ? 'saida-quantidade-erro' : undefined} {...register('quantidade', { valueAsNumber: true })} />{errors.quantidade && <p id="saida-quantidade-erro" role="alert" className="text-sm text-destructive">{errors.quantidade.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="saida-motivo">Destino ou motivo</Label><Input id="saida-motivo" className="h-11" placeholder="Ex.: Dispensação ao paciente" aria-invalid={Boolean(errors.destinoMotivo)} aria-describedby={errors.destinoMotivo ? 'saida-motivo-erro' : undefined} {...register('destinoMotivo')} />{errors.destinoMotivo && <p id="saida-motivo-erro" role="alert" className="text-sm text-destructive">{errors.destinoMotivo.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="saida-data">Data da saída</Label><Input id="saida-data" className="h-11" type="date" aria-invalid={Boolean(errors.data)} aria-describedby={errors.data ? 'saida-data-erro' : undefined} {...register('data')} />{errors.data && <p id="saida-data-erro" role="alert" className="text-sm text-destructive">{errors.data.message}</p>}</div>
    </div>
    <div className="space-y-2"><Label htmlFor="saida-observacao">Observação (opcional)</Label><textarea id="saida-observacao" rows={3} className="ui-control min-h-24 py-2" aria-invalid={Boolean(errors.observacao)} aria-describedby={errors.observacao ? 'saida-observacao-erro' : undefined} {...register('observacao')} />{errors.observacao && <p id="saida-observacao-erro" role="alert" className="text-sm text-destructive">{errors.observacao.message}</p>}</div>
    {erroOperacao && <p role="alert" className="rounded-md border border-destructive/20 bg-red-50 p-3 text-sm text-destructive">{erroOperacao}</p>}
    {sucesso && <p role="status" className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{sucesso}</p>}
    <Button type="submit" disabled={carregando}>{carregando ? 'Registrando…' : 'Registrar saída'}</Button>
  </form>
}
