import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/stores/appStore'
import { usuarioCadastroSchema, type UsuarioCadastro } from '@/services/cadastroSchema'
import type { Unidade, Usuario } from '@/types'

const vazio: UsuarioCadastro = { nome: '', email: '', role: 'UBS', unidadeId: undefined, ativo: true }

export default function UsuarioForm({ adminId, item, unidades, onSaved }: { adminId: number; item?: Usuario; unidades: readonly Unidade[]; onSaved: () => void }) {
  const salvar = useAppStore((state) => state.salvarUsuario)
  const carregando = useAppStore((state) => state.operacaoCarregando)
  const erro = useAppStore((state) => state.operacaoErro)
  const { register, control, handleSubmit, formState: { errors } } = useForm<UsuarioCadastro>({ resolver: zodResolver(usuarioCadastroSchema), defaultValues: item ?? vazio })
  const role = useWatch({ control, name: 'role' })
  const enviar = handleSubmit(async (dados) => {
    if (await salvar(adminId, dados, item?.id)) { toast.success(item ? 'Usuário atualizado.' : 'Usuário cadastrado.'); onSaved() }
  })
  return <DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{item ? 'Editar usuário' : 'Cadastrar usuário'}</DialogTitle><DialogDescription>Contas de demonstração usam a senha padrão do MVP.</DialogDescription></DialogHeader><form onSubmit={enviar} className="space-y-4" noValidate>
    <div className="space-y-2"><Label htmlFor="usuario-nome">Nome</Label><Input id="usuario-nome" {...register('nome')} aria-invalid={Boolean(errors.nome)} />{errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="usuario-email">E-mail</Label><Input id="usuario-email" type="email" {...register('email')} aria-invalid={Boolean(errors.email)} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="usuario-role">Perfil</Label><select id="usuario-role" className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm" {...register('role')}><option value="ADMIN">Administrador</option><option value="GESTOR">Gestor</option><option value="UBS">Responsável UBS</option></select></div>
    {role === 'UBS' && <div className="space-y-2"><Label htmlFor="usuario-unidade">Unidade vinculada</Label><select id="usuario-unidade" className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm" {...register('unidadeId', { setValueAs: (valor: string) => valor === '' ? undefined : Number(valor) })}><option value="">Selecione</option>{unidades.filter((unidade) => unidade.status === 'ATIVA').map((unidade) => <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>)}</select>{errors.unidadeId && <p className="text-xs text-destructive">{errors.unidadeId.message}</p>}</div>}
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('ativo')} />Ativo</label>
    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}<DialogFooter><Button type="submit" disabled={carregando}>{carregando ? 'Salvando…' : 'Salvar usuário'}</Button></DialogFooter>
  </form></DialogContent>
}
