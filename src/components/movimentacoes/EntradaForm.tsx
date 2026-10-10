import { useState } from 'react'
import { format } from 'date-fns'
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
  loteOpcao: z.string(),
  numeroLote: z.string().trim().min(1, 'Informe o número do lote.'),
  quantidade: z.number({ error: 'Informe uma quantidade válida.' }).int('Informe um número inteiro.').positive('A quantidade deve ser maior que zero.'),
  dataValidade: z.iso.date('Informe uma validade válida.'),
  origem: z.string().trim().min(1, 'Informe a origem.'),
  data: z.iso.date('Informe uma data válida.'),
  observacao: z.string().max(500, 'A observação deve ter até 500 caracteres.'),
})
type CamposEntrada = z.infer<typeof formularioSchema>

const seletor = 'ui-control h-11'

export default function EntradaForm({ usuario, unidades, medicamentos, lotes }: { usuario: Usuario; unidades: readonly Unidade[]; medicamentos: readonly Medicamento[]; lotes: readonly Lote[] }) {
  const registrar = useAppStore((state) => state.registrarEntrada)
  const carregando = useAppStore((state) => state.operacaoCarregando)
  const erroOperacao = useAppStore((state) => state.operacaoErro)
  const limparErroOperacao = useAppStore((state) => state.limparErroOperacao)
  const [sucesso, setSucesso] = useState('')
  const padrao = { medicamentoId: '', unidadeId: usuario.role === 'UBS' ? String(usuario.unidadeId) : '', loteOpcao: 'NOVO', numeroLote: '', quantidade: undefined, dataValidade: '', origem: '', data: format(new Date(), 'yyyy-MM-dd'), observacao: '' }
  const { register, control, setValue, handleSubmit, reset, formState: { errors } } = useForm<CamposEntrada>({ resolver: zodResolver(formularioSchema), defaultValues: padrao })
  const medicamentoId = useWatch({ control, name: 'medicamentoId' })
  const unidadeId = useWatch({ control, name: 'unidadeId' })
  const loteOpcao = useWatch({ control, name: 'loteOpcao' })
  const lotesDisponiveis = lotes.filter((item) => item.medicamentoId === Number(medicamentoId) && item.unidadeId === Number(unidadeId))
  const campoMedicamento = register('medicamentoId')
  const campoUnidade = register('unidadeId')
  const campoLote = register('loteOpcao')
  const limparLote = () => { setValue('loteOpcao', 'NOVO'); setValue('numeroLote', ''); setValue('dataValidade', '') }

  const enviar = handleSubmit(async (campos) => {
    setSucesso('')
    const ok = await registrar({
      medicamentoId: Number(campos.medicamentoId), unidadeId: Number(campos.unidadeId),
      loteId: campos.loteOpcao === 'NOVO' ? undefined : Number(campos.loteOpcao),
      numeroLote: campos.numeroLote, quantidade: campos.quantidade, dataValidade: campos.dataValidade,
      origem: campos.origem, data: campos.data, observacao: campos.observacao, usuarioId: usuario.id,
    })
    if (ok) { reset(padrao); setValue('quantidade', Number.NaN); setSucesso('Entrada registrada com sucesso. O estoque e o histórico foram atualizados.') }
  }, () => { limparErroOperacao(); setSucesso('') })

  return <form onSubmit={enviar} noValidate className="space-y-5" aria-label="Registrar entrada">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="entrada-medicamento">Medicamento</Label><select id="entrada-medicamento" className={seletor} aria-invalid={Boolean(errors.medicamentoId)} aria-describedby={errors.medicamentoId ? 'entrada-medicamento-erro' : undefined} {...campoMedicamento} onChange={(event) => { void campoMedicamento.onChange(event); limparLote() }}><option value="">Selecione</option>{medicamentos.filter((item) => item.ativo).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>{errors.medicamentoId && <p id="entrada-medicamento-erro" role="alert" className="text-sm text-destructive">{errors.medicamentoId.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="entrada-unidade">Unidade de destino</Label><select id="entrada-unidade" className={seletor} aria-invalid={Boolean(errors.unidadeId)} aria-describedby={errors.unidadeId ? 'entrada-unidade-erro' : undefined} {...campoUnidade} onChange={(event) => { void campoUnidade.onChange(event); limparLote() }}><option value="">Selecione</option>{unidades.filter((item) => item.status === 'ATIVA').map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>{errors.unidadeId && <p id="entrada-unidade-erro" role="alert" className="text-sm text-destructive">{errors.unidadeId.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="entrada-lote-opcao">Lote</Label><select id="entrada-lote-opcao" className={seletor} aria-describedby="entrada-lote-ajuda" {...campoLote} onChange={(event) => { void campoLote.onChange(event); const lote = lotesDisponiveis.find((item) => String(item.id) === event.target.value); setValue('numeroLote', lote?.numero ?? ''); setValue('dataValidade', lote?.dataValidade ?? '') }}><option value="NOVO">Novo lote</option>{lotesDisponiveis.map((item) => <option key={item.id} value={item.id}>{item.numero} · {item.quantidade} disponíveis</option>)}</select><p id="entrada-lote-ajuda" className="text-helper text-muted-foreground">{!medicamentoId || !unidadeId ? 'Selecione medicamento e unidade para visualizar lotes existentes.' : 'Use um lote existente ou informe os dados de um novo lote.'}</p></div>
      <div className="space-y-2"><Label htmlFor="entrada-numero">Número do lote</Label><Input id="entrada-numero" className="h-11" readOnly={loteOpcao !== 'NOVO'} placeholder="Ex.: LAG-2026-001" aria-invalid={Boolean(errors.numeroLote)} aria-describedby={errors.numeroLote ? 'entrada-numero-erro entrada-lote-readonly' : 'entrada-lote-readonly'} {...register('numeroLote')} /><p id="entrada-lote-readonly" className="text-helper text-muted-foreground">{loteOpcao === 'NOVO' ? 'Informe o identificador impresso no lote.' : 'Preenchido automaticamente pelo lote selecionado.'}</p>{errors.numeroLote && <p id="entrada-numero-erro" role="alert" className="text-sm text-destructive">{errors.numeroLote.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="entrada-quantidade">Quantidade</Label><Input id="entrada-quantidade" className="h-11" type="number" min="1" step="1" placeholder="0" aria-invalid={Boolean(errors.quantidade)} aria-describedby={errors.quantidade ? 'entrada-quantidade-erro' : undefined} {...register('quantidade', { valueAsNumber: true })} />{errors.quantidade && <p id="entrada-quantidade-erro" role="alert" className="text-sm text-destructive">{errors.quantidade.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="entrada-validade">Validade</Label><Input id="entrada-validade" className="h-11" type="date" readOnly={loteOpcao !== 'NOVO'} aria-invalid={Boolean(errors.dataValidade)} aria-describedby={errors.dataValidade ? 'entrada-validade-erro entrada-validade-ajuda' : 'entrada-validade-ajuda'} {...register('dataValidade')} /><p id="entrada-validade-ajuda" className="text-helper text-muted-foreground">{loteOpcao === 'NOVO' ? 'Informe a data de validade do novo lote.' : 'Preenchida automaticamente pelo lote selecionado.'}</p>{errors.dataValidade && <p id="entrada-validade-erro" role="alert" className="text-sm text-destructive">{errors.dataValidade.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="entrada-origem">Origem</Label><Input id="entrada-origem" className="h-11" placeholder="Ex.: Almoxarifado municipal" aria-invalid={Boolean(errors.origem)} aria-describedby={errors.origem ? 'entrada-origem-erro' : undefined} {...register('origem')} />{errors.origem && <p id="entrada-origem-erro" role="alert" className="text-sm text-destructive">{errors.origem.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="entrada-data">Data da entrada</Label><Input id="entrada-data" className="h-11" type="date" aria-invalid={Boolean(errors.data)} aria-describedby={errors.data ? 'entrada-data-erro' : undefined} {...register('data')} />{errors.data && <p id="entrada-data-erro" role="alert" className="text-sm text-destructive">{errors.data.message}</p>}</div>
    </div>
    <div className="space-y-2"><Label htmlFor="entrada-observacao">Observação (opcional)</Label><textarea id="entrada-observacao" rows={3} className="ui-control min-h-24 py-2" aria-invalid={Boolean(errors.observacao)} aria-describedby={errors.observacao ? 'entrada-observacao-erro' : undefined} {...register('observacao')} />{errors.observacao && <p id="entrada-observacao-erro" role="alert" className="text-sm text-destructive">{errors.observacao.message}</p>}</div>
    {erroOperacao && <p role="alert" className="rounded-md border border-destructive/20 bg-red-50 p-3 text-sm text-destructive">{erroOperacao}</p>}
    {sucesso && <p role="status" className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{sucesso}</p>}
    <Button type="submit" disabled={carregando}>{carregando ? 'Registrando…' : 'Registrar entrada'}</Button>
  </form>
}
