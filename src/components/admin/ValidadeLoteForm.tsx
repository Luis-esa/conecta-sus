import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/stores/appStore'
import { loteValidadeSchema } from '@/services/cadastroSchema'
import type { Lote } from '@/types'

export default function ValidadeLoteForm({ adminId, lote, onSaved }: { adminId: number; lote: Lote; onSaved: () => void }) {
  const salvar = useAppStore((state) => state.corrigirValidadeLote)
  const carregando = useAppStore((state) => state.operacaoCarregando)
  const erro = useAppStore((state) => state.operacaoErro)
  const { register, handleSubmit, formState: { errors } } = useForm<{ dataValidade: string }>({ resolver: zodResolver(loteValidadeSchema), defaultValues: { dataValidade: lote.dataValidade } })
  const enviar = handleSubmit(async ({ dataValidade }) => {
    if (await salvar(adminId, lote.id, dataValidade)) { toast.success('Validade corrigida.'); onSaved() }
  })
  return <DialogContent><DialogHeader><DialogTitle>Corrigir validade</DialogTitle><DialogDescription>Lote {lote.numero}. A correção se aplica ao mesmo lote em todas as unidades. Quantidades só mudam por movimentações.</DialogDescription></DialogHeader><form onSubmit={enviar} className="space-y-4" noValidate><div className="space-y-2"><Label htmlFor="lote-validade">Nova validade</Label><Input id="lote-validade" type="date" {...register('dataValidade')} aria-invalid={Boolean(errors.dataValidade)} />{errors.dataValidade && <p className="text-sm text-destructive">{errors.dataValidade.message}</p>}</div>{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}<DialogFooter><Button type="submit" disabled={carregando}>{carregando ? 'Salvando…' : 'Salvar validade'}</Button></DialogFooter></form></DialogContent>
}
