import { useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import UnidadeForm from '@/components/admin/UnidadeForm'
import { ConsultaEstado } from '@/components/consultas/ConsultaUI'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
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
  const [focoAnterior, setFocoAnterior] = useState<HTMLElement | null>(null)
  const abrir = (id: number | null) => { setFocoAnterior(document.activeElement as HTMLElement | null); limparErro(); setEditando(id); setAberto(true) }
  return <ConsultaEstado carregado={carregado} erro={erro}><div className="space-y-5"><PageHeader title="Unidades" description="Cadastre unidades e atualize seus dados sem apagar movimentações anteriores." actions={<Button onClick={() => abrir(null)}>Cadastrar unidade</Button>} /><section className="overflow-hidden rounded-xl border bg-white"><div className="border-b px-5 py-4"><h2 className="font-semibold">Unidades da rede</h2><p className="text-sm text-muted-foreground">{unidades.length} unidades cadastradas</p></div><Table className="min-w-[700px]"><TableHeader className="bg-muted/60"><TableRow><TableHead>Nome</TableHead><TableHead>Código</TableHead><TableHead>Endereço</TableHead><TableHead>Responsável</TableHead><TableHead>Situação</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader><TableBody>{unidades.map((item) => <TableRow key={item.id}><TableCell className="max-w-48 whitespace-normal font-medium">{item.nome}</TableCell><TableCell>{item.codigo}</TableCell><TableCell className="max-w-64 whitespace-normal">{item.endereco}</TableCell><TableCell className="max-w-44 whitespace-normal">{item.responsavel || '—'}</TableCell><TableCell><StatusBadge label={item.status === 'ATIVA' ? 'Ativa' : 'Inativa'} tone={item.status === 'ATIVA' ? 'success' : 'muted'} /></TableCell><TableCell><Button size="sm" variant="outline" aria-label={`Editar unidade ${item.nome}`} onClick={() => abrir(item.id)}>Editar</Button></TableCell></TableRow>)}</TableBody></Table></section>{usuario?.role === 'ADMIN' && <Dialog open={aberto} onOpenChange={setAberto}>{aberto && <UnidadeForm key={editando ?? 'novo'} adminId={usuario.id} item={unidades.find((item) => item.id === editando)} onSaved={() => setAberto(false)} returnFocusTo={focoAnterior} />}</Dialog>}</div></ConsultaEstado>
}
