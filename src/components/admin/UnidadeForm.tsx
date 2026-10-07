import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/stores/appStore'
import { unidadeCadastroSchema, type UnidadeCadastro } from '@/services/cadastroSchema'
import type { Unidade } from '@/types'

const vazio: UnidadeCadastro = { nome: '', codigo: '', endereco: '', telefone: '', responsavel: '', status: 'ATIVA' }

export default function UnidadeForm({ adminId, item, onSaved }: { adminId: number; item?: Unidade; onSaved: () => void }) {
  const salvar = useAppStore((state) => state.salvarUnidade)
  const carregando = useAppStore((state) => state.operacaoCarregando)
  const erro = useAppStore((state) => state.operacaoErro)
  const { register, handleSubmit, formState: { errors } } = useForm<UnidadeCadastro>({ resolver: zodResolver(unidadeCadastroSchema), defaultValues: item ?? vazio })
  const enviar = handleSubmit(async (dados) => {
    if (await salvar(adminId, dados, item?.id)) { toast.success(item ? 'Unidade atualizada.' : 'Unidade cadastrada.'); onSaved() }
  })
  const campos = [['nome', 'Nome'], ['codigo', 'Código'], ['endereco', 'Endereço'], ['telefone', 'Telefone'], ['responsavel', 'Responsável']] as const
  return <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{item ? 'Editar unidade' : 'Cadastrar unidade'}</DialogTitle><DialogDescription>O código identifica a unidade em toda a rede.</DialogDescription></DialogHeader><form onSubmit={enviar} className="space-y-4" noValidate><div className="grid gap-4 sm:grid-cols-2">{campos.map(([campo, titulo]) => <div key={campo} className="space-y-2"><Label htmlFor={`unidade-${campo}`}>{titulo}</Label><Input id={`unidade-${campo}`} {...register(campo)} aria-invalid={Boolean(errors[campo])} />{errors[campo] && <p className="text-xs text-destructive">{errors[campo].message}</p>}</div>)}<div className="space-y-2"><Label htmlFor="unidade-status">Situação</Label><select id="unidade-status" className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm" {...register('status')}><option value="ATIVA">Ativa</option><option value="INATIVA">Inativa</option></select></div></div>{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}<DialogFooter><Button type="submit" disabled={carregando}>{carregando ? 'Salvando…' : 'Salvar unidade'}</Button></DialogFooter></form></DialogContent>
}
