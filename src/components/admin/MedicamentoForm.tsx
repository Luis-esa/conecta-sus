import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/stores/appStore'
import { medicamentoCadastroSchema, type MedicamentoCadastro } from '@/services/cadastroSchema'
import type { Medicamento } from '@/types'

const vazio: MedicamentoCadastro = { nome: '', principioAtivo: '', concentracao: '', formaFarmaceutica: '', unidadeMedida: '', codigo: '', estoqueMinimo: 0, estoqueMaximo: undefined, ativo: true }

export default function MedicamentoForm({ adminId, item, onSaved, returnFocusTo }: { adminId: number; item?: Medicamento; onSaved: () => void; returnFocusTo?: HTMLElement | null }) {
  const salvar = useAppStore((state) => state.salvarMedicamento)
  const carregando = useAppStore((state) => state.operacaoCarregando)
  const erro = useAppStore((state) => state.operacaoErro)
  const { register, handleSubmit, formState: { errors } } = useForm<MedicamentoCadastro>({ resolver: zodResolver(medicamentoCadastroSchema), defaultValues: item ?? vazio })
  const enviar = handleSubmit(async (dados) => {
    if (await salvar(adminId, dados, item?.id)) { toast.success(item ? 'Medicamento atualizado.' : 'Medicamento cadastrado.'); onSaved() }
  })
  const campos = [
    ['nome', 'Nome'], ['principioAtivo', 'Princípio ativo'], ['concentracao', 'Concentração'],
    ['formaFarmaceutica', 'Forma farmacêutica'], ['unidadeMedida', 'Unidade de medida'], ['codigo', 'Código'],
  ] as const
  return <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl" onCloseAutoFocus={(event) => { if (returnFocusTo?.isConnected) { event.preventDefault(); returnFocusTo.focus() } }}><DialogHeader><DialogTitle>{item ? 'Editar medicamento' : 'Cadastrar medicamento'}</DialogTitle><DialogDescription>Altere o catálogo sem remover lotes ou histórico.</DialogDescription></DialogHeader>
    <form onSubmit={enviar} className="space-y-4" noValidate><div className="grid gap-4 sm:grid-cols-2">{campos.map(([campo, titulo]) => <div key={campo} className="space-y-2"><Label htmlFor={`med-${campo}`}>{titulo}</Label><Input id={`med-${campo}`} className="h-11" {...register(campo)} aria-invalid={Boolean(errors[campo])} aria-describedby={errors[campo] ? `med-${campo}-erro` : undefined} />{errors[campo] && <p id={`med-${campo}-erro`} role="alert" className="text-sm text-destructive">{errors[campo].message}</p>}</div>)}
      <div className="space-y-2"><Label htmlFor="med-minimo">Estoque mínimo</Label><Input id="med-minimo" className="h-11" type="number" min="0" step="1" aria-invalid={Boolean(errors.estoqueMinimo)} aria-describedby={errors.estoqueMinimo ? 'med-minimo-erro' : undefined} {...register('estoqueMinimo', { valueAsNumber: true })} />{errors.estoqueMinimo && <p id="med-minimo-erro" role="alert" className="text-sm text-destructive">{errors.estoqueMinimo.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="med-maximo">Estoque máximo (opcional)</Label><Input id="med-maximo" className="h-11" type="number" min="0" step="1" aria-invalid={Boolean(errors.estoqueMaximo)} aria-describedby={errors.estoqueMaximo ? 'med-maximo-erro' : undefined} {...register('estoqueMaximo', { setValueAs: (valor: string) => valor === '' ? undefined : Number(valor) })} />{errors.estoqueMaximo && <p id="med-maximo-erro" role="alert" className="text-sm text-destructive">{errors.estoqueMaximo.message}</p>}</div></div>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" {...register('ativo')} />Ativo</label>
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
      <DialogFooter><Button type="button" variant="outline" onClick={onSaved} disabled={carregando}>Cancelar</Button><Button type="submit" disabled={carregando}>{carregando ? 'Salvando…' : 'Salvar medicamento'}</Button></DialogFooter>
    </form></DialogContent>
}
