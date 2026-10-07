import { useState } from 'react'
import UnidadeForm from '@/components/admin/UnidadeForm'
import { ConsultaEstado } from '@/components/consultas/ConsultaUI'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppStore } from '@/stores/appStore'
import { selecionarDadosCarregados, selecionarErro, selecionarUnidades } from '@/stores/appSelectors'
import { useAuthStore } from '@/stores/authStore'

export default function Unidades() {
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const unidades = useAppStore(selecionarUnidades)
  const carregado = useAppStore(selecionarDadosCarregados)
  const erro = useAppStore(selecionarErro)
  const limparErro = useAppStore((state) => state.limparErroOperacao)
  const [editando, setEditando] = useState<number | null>(null)
  const [aberto, setAberto] = useState(false)
  const abrir = (id: number | null) => { limparErro(); setEditando(id); setAberto(true) }
  return <ConsultaEstado carregado={carregado} erro={erro}><div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Cadastre unidades e atualize seus dados sem apagar movimentações anteriores.</p><Button onClick={() => abrir(null)}>Cadastrar unidade</Button></div><section className="overflow-hidden rounded-xl border bg-white"><div className="border-b px-5 py-4"><h2 className="font-semibold">Unidades da rede</h2><p className="text-sm text-muted-foreground">{unidades.length} unidades cadastradas</p></div><div className="overflow-x-auto"><Table className="min-w-[700px]"><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Código</TableHead><TableHead>Endereço</TableHead><TableHead>Responsável</TableHead><TableHead>Situação</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader><TableBody>{unidades.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.nome}</TableCell><TableCell>{item.codigo}</TableCell><TableCell>{item.endereco}</TableCell><TableCell>{item.responsavel || '—'}</TableCell><TableCell>{item.status === 'ATIVA' ? 'Ativa' : 'Inativa'}</TableCell><TableCell><Button size="sm" variant="outline" onClick={() => abrir(item.id)}>Editar</Button></TableCell></TableRow>)}</TableBody></Table></div></section>{usuario?.role === 'ADMIN' && <Dialog open={aberto} onOpenChange={setAberto}>{aberto && <UnidadeForm key={editando ?? 'novo'} adminId={usuario.id} item={unidades.find((item) => item.id === editando)} onSaved={() => setAberto(false)} />}</Dialog>}</div></ConsultaEstado>
}
