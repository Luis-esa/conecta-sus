import { useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import UsuarioForm from '@/components/admin/UsuarioForm'
import { ConsultaEstado } from '@/components/consultas/ConsultaUI'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppStore } from '@/stores/appStore'
import { selecionarDadosCarregados, selecionarErro, selecionarUnidades, selecionarUsuarios } from '@/stores/appSelectors'
import { useAuthStore } from '@/stores/authStore'

const papeis = { ADMIN: 'Administrador', GESTOR: 'Gestor', UBS: 'Responsável UBS' }

export default function Usuarios() {
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const usuarios = useAppStore(selecionarUsuarios)
  const unidades = useAppStore(selecionarUnidades)
  const carregado = useAppStore(selecionarDadosCarregados)
  const erro = useAppStore(selecionarErro)
  const limparErro = useAppStore((state) => state.limparErroOperacao)
  const [editando, setEditando] = useState<number | null>(null)
  const [aberto, setAberto] = useState(false)
  const abrir = (id: number | null) => { limparErro(); setEditando(id); setAberto(true) }
  const nomesUnidades = new Map(unidades.map((item) => [item.id, item.nome]))
  return <ConsultaEstado carregado={carregado} erro={erro}><div className="space-y-5"><PageHeader title="Usuários" description="Gerencie perfis e vínculos com unidades. Registros históricos permanecem associados ao usuário original." actions={<Button onClick={() => abrir(null)}>Cadastrar usuário</Button>} /><section className="overflow-hidden rounded-xl border bg-white"><div className="border-b px-5 py-4"><h2 className="font-semibold">Usuários cadastrados</h2><p className="text-sm text-muted-foreground">{usuarios.length} usuários</p></div><div className="overflow-x-auto"><Table className="min-w-[700px]"><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Perfil</TableHead><TableHead>Unidade</TableHead><TableHead>Situação</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader><TableBody>{usuarios.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.nome}</TableCell><TableCell>{item.email}</TableCell><TableCell>{papeis[item.role]}</TableCell><TableCell>{item.unidadeId ? nomesUnidades.get(item.unidadeId) ?? '—' : '—'}</TableCell><TableCell>{item.ativo ? 'Ativo' : 'Inativo'}</TableCell><TableCell><Button size="sm" variant="outline" onClick={() => abrir(item.id)}>Editar</Button></TableCell></TableRow>)}</TableBody></Table></div></section>{usuario?.role === 'ADMIN' && <Dialog open={aberto} onOpenChange={setAberto}>{aberto && <UsuarioForm key={editando ?? 'novo'} adminId={usuario.id} item={usuarios.find((item) => item.id === editando)} unidades={unidades} onSaved={() => setAberto(false)} />}</Dialog>}</div></ConsultaEstado>
}
