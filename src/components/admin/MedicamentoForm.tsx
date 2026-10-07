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

export default function MedicamentoForm({ adminId, item, onSaved }: { adminId: number; item?: Medicamento; onSaved: () => void }) {
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
  return <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{item ? 'Editar medicamento' : 'Cadastrar medicamento'}</DialogTitle><DialogDescription>Altere o catálogo sem remover lotes ou histórico.</DialogDescription></DialogHeader>
    <form onSubmit={enviar} className="space-y-4" noValidate><div className="grid gap-4 sm:grid-cols-2">{campos.map(([campo, titulo]) => <div key={campo} className="space-y-2"><Label htmlFor={`med-${campo}`}>{titulo}</Label><Input id={`med-${campo}`} {...register(campo)} aria-invalid={Boolean(errors[campo])} />{errors[campo] && <p className="text-xs text-destructive">{errors[campo].message}</p>}</div>)}
      <div className="space-y-2"><Label htmlFor="med-minimo">Estoque mínimo</Label><Input id="med-minimo" type="number" min="0" step="1" {...register('estoqueMinimo', { valueAsNumber: true })} />{errors.estoqueMinimo && <p className="text-xs text-destructive">{errors.estoqueMinimo.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="med-maximo">Estoque máximo (opcional)</Label><Input id="med-maximo" type="number" min="0" step="1" {...register('estoqueMaximo', { setValueAs: (valor: string) => valor === '' ? undefined : Number(valor) })} />{errors.estoqueMaximo && <p className="text-xs text-destructive">{errors.estoqueMaximo.message}</p>}</div></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('ativo')} />Ativo</label>
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
      <DialogFooter><Button type="submit" disabled={carregando}>{carregando ? 'Salvando…' : 'Salvar medicamento'}</Button></DialogFooter>
    </form></DialogContent>
}
