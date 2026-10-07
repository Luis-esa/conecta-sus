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

const seletor = 'h-9 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

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
      <div className="space-y-2"><Label htmlFor="saida-medicamento">Medicamento</Label><select id="saida-medicamento" className={seletor} aria-invalid={Boolean(errors.medicamentoId)} {...campoMedicamento} onChange={(event) => { void campoMedicamento.onChange(event); setValue('loteId', '') }}><option value="">Selecione</option>{medicamentos.filter((item) => item.ativo).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>{errors.medicamentoId && <p className="text-sm text-destructive">{errors.medicamentoId.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="saida-unidade">Unidade de origem</Label><select id="saida-unidade" className={seletor} aria-invalid={Boolean(errors.unidadeId)} {...campoUnidade} onChange={(event) => { void campoUnidade.onChange(event); setValue('loteId', '') }}><option value="">Selecione</option>{unidades.filter((item) => item.status === 'ATIVA').map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>{errors.unidadeId && <p className="text-sm text-destructive">{errors.unidadeId.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="saida-lote">Lote</Label><select id="saida-lote" className={seletor} aria-invalid={Boolean(errors.loteId)} {...register('loteId')}><option value="">Selecione</option>{lotesDisponiveis.map((item) => <option key={item.id} value={item.id}>{item.numero} · {item.quantidade} disponíveis</option>)}</select>{errors.loteId && <p className="text-sm text-destructive">{errors.loteId.message}</p>}{loteSelecionado && <p className="text-xs text-muted-foreground">Disponível neste lote: {loteSelecionado.quantidade} · validade {format(parseISO(loteSelecionado.dataValidade), 'dd/MM/yyyy')}</p>}</div>
      <div className="space-y-2"><Label htmlFor="saida-quantidade">Quantidade</Label><Input id="saida-quantidade" type="number" min="1" step="1" placeholder="0" aria-invalid={Boolean(errors.quantidade)} {...register('quantidade', { valueAsNumber: true })} />{errors.quantidade && <p className="text-sm text-destructive">{errors.quantidade.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="saida-motivo">Destino ou motivo</Label><Input id="saida-motivo" placeholder="Ex.: Dispensação ao paciente" aria-invalid={Boolean(errors.destinoMotivo)} {...register('destinoMotivo')} />{errors.destinoMotivo && <p className="text-sm text-destructive">{errors.destinoMotivo.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="saida-data">Data da saída</Label><Input id="saida-data" type="date" aria-invalid={Boolean(errors.data)} {...register('data')} />{errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}</div>
    </div>
    <div className="space-y-2"><Label htmlFor="saida-observacao">Observação (opcional)</Label><textarea id="saida-observacao" rows={3} className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm" {...register('observacao')} />{errors.observacao && <p className="text-sm text-destructive">{errors.observacao.message}</p>}</div>
    {erroOperacao && <p role="alert" className="rounded-md border border-destructive/20 bg-red-50 p-3 text-sm text-destructive">{erroOperacao}</p>}
    {sucesso && <p role="status" className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{sucesso}</p>}
    <Button type="submit" disabled={carregando}>{carregando ? 'Registrando…' : 'Registrar saída'}</Button>
  </form>
}
