import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/stores/appStore'
import { schemaUsuarioCadastro, type UsuarioCadastro } from '@/services/cadastroSchema'
import type { Unidade, Usuario } from '@/types'

const vazio: UsuarioCadastro = { nome: '', email: '', role: 'UBS', unidadeId: undefined, ativo: true, senha: '' }

export default function UsuarioForm({ adminId, item, unidades, onSaved, returnFocusTo }: { adminId: number; item?: Usuario; unidades: readonly Unidade[]; onSaved: () => void; returnFocusTo?: HTMLElement | null }) {
  const salvar = useAppStore((state) => state.salvarUsuario)
  const carregando = useAppStore((state) => state.operacaoCarregando)
  const erro = useAppStore((state) => state.operacaoErro)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const { register, control, handleSubmit, formState: { errors } } = useForm<UsuarioCadastro>({ resolver: zodResolver(schemaUsuarioCadastro(item?.id)), defaultValues: item ? { ...item, senha: '' } : vazio })
  const role = useWatch({ control, name: 'role' })
  const enviar = handleSubmit(async (dados) => {
    if (await salvar(adminId, dados, item?.id)) { toast.success(item ? 'Usuário atualizado.' : 'Usuário cadastrado.'); onSaved() }
  })
  return <DialogContent className="max-h-[90dvh] overflow-y-auto" onCloseAutoFocus={(event) => { if (returnFocusTo?.isConnected) { event.preventDefault(); returnFocusTo.focus() } }}><DialogHeader><DialogTitle>{item ? 'Editar usuário' : 'Cadastrar usuário'}</DialogTitle><DialogDescription>{item ? 'Deixe a senha em branco para mantê-la.' : 'Defina uma senha para o novo usuário.'}</DialogDescription></DialogHeader><form onSubmit={enviar} className="space-y-4" noValidate>
    <div className="space-y-2"><Label htmlFor="usuario-nome">Nome</Label><Input id="usuario-nome" className="h-11" {...register('nome')} aria-invalid={Boolean(errors.nome)} aria-describedby={errors.nome ? 'usuario-nome-erro' : undefined} />{errors.nome && <p id="usuario-nome-erro" role="alert" className="text-sm text-destructive">{errors.nome.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="usuario-email">E-mail</Label><Input id="usuario-email" className="h-11" type="email" {...register('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'usuario-email-erro' : undefined} />{errors.email && <p id="usuario-email-erro" role="alert" className="text-sm text-destructive">{errors.email.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="usuario-senha">{item ? 'Nova senha (opcional)' : 'Senha'}</Label><div className="relative"><Input id="usuario-senha" className="h-11 pr-12" type={mostrarSenha ? 'text' : 'password'} autoComplete="new-password" {...register('senha')} aria-invalid={Boolean(errors.senha)} aria-describedby={errors.senha ? 'usuario-senha-erro' : 'usuario-senha-ajuda'} /><button type="button" className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-control text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={mostrarSenha} onClick={() => setMostrarSenha((valor) => !valor)}>{mostrarSenha ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}</button></div><p id="usuario-senha-ajuda" className="text-helper text-muted-foreground">{item ? 'Preencha apenas se quiser alterar. ' : ''}Use pelo menos 6 caracteres.</p>{errors.senha && <p id="usuario-senha-erro" role="alert" className="text-sm text-destructive">{errors.senha.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="usuario-role">Perfil</Label><select id="usuario-role" className="ui-control h-11" {...register('role')}><option value="ADMIN">Administrador</option><option value="GESTOR">Gestor</option><option value="UBS">Responsável UBS</option></select></div>
    {role === 'UBS' && <div className="space-y-2"><Label htmlFor="usuario-unidade">Unidade vinculada</Label><select id="usuario-unidade" className="ui-control h-11" aria-invalid={Boolean(errors.unidadeId)} aria-describedby={errors.unidadeId ? 'usuario-unidade-erro' : undefined} {...register('unidadeId', { setValueAs: (valor: string) => valor === '' ? undefined : Number(valor) })}><option value="">Selecione</option>{unidades.filter((unidade) => unidade.status === 'ATIVA').map((unidade) => <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>)}</select>{errors.unidadeId && <p id="usuario-unidade-erro" role="alert" className="text-sm text-destructive">{errors.unidadeId.message}</p>}</div>}
    <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" {...register('ativo')} />Ativo</label>
    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}<DialogFooter><Button type="button" variant="outline" onClick={onSaved} disabled={carregando}>Cancelar</Button><Button type="submit" disabled={carregando}>{carregando ? 'Salvando…' : 'Salvar usuário'}</Button></DialogFooter>
  </form></DialogContent>
}
