import {
  LayoutDashboard, Package, Pill, Boxes, ArrowDownUp, ArrowLeftRight,
  Bell, ChartNoAxesCombined, Building2, Users, History,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  path: string
  title: string
  description: string
  icon: LucideIcon
  group: 'Visão geral' | 'Estoque' | 'Operações' | 'Monitoramento' | 'Análise' | 'Administração'
  resources: string[]
}

// Uma fonte para rotas, títulos do header e menus de desktop/tablet.
export const navigation: NavigationItem[] = [
  { path: '/dashboard', title: 'Dashboard', description: 'Uma visão integrada dos medicamentos e das unidades de saúde do município.', icon: LayoutDashboard, group: 'Visão geral', resources: ['Indicadores de estoque', 'Situação das unidades', 'Movimentações recentes'] },
  { path: '/estoque', title: 'Estoque', description: 'Acompanhe a disponibilidade de medicamentos em cada unidade de saúde.', icon: Package, group: 'Estoque', resources: ['Consulta por unidade', 'Pesquisa de medicamentos', 'Situação do estoque'] },
  { path: '/medicamentos', title: 'Medicamentos', description: 'Organize o catálogo de medicamentos da rede municipal de saúde.', icon: Pill, group: 'Estoque', resources: ['Catálogo de medicamentos', 'Princípio ativo', 'Limites de estoque'] },
  { path: '/lotes', title: 'Lotes', description: 'Consulte lotes, quantidades e datas de validade dos medicamentos.', icon: Boxes, group: 'Estoque', resources: ['Identificação dos lotes', 'Validade', 'Disponibilidade por unidade'] },
  { path: '/movimentacoes', title: 'Movimentações', description: 'Acompanhe as entradas e saídas de medicamentos das unidades.', icon: ArrowDownUp, group: 'Operações', resources: ['Registro de entradas', 'Registro de saídas', 'Consulta por período'] },
  { path: '/transferencias', title: 'Transferências', description: 'Organize a movimentação de medicamentos entre unidades de saúde.', icon: ArrowLeftRight, group: 'Operações', resources: ['Origem e destino', 'Medicamento e lote', 'Histórico de transferências'] },
  { path: '/alertas', title: 'Alertas', description: 'Identifique situações que precisam de atenção na gestão dos medicamentos.', icon: Bell, group: 'Monitoramento', resources: ['Estoque baixo ou crítico', 'Próximos do vencimento', 'Notificações'] },
  { path: '/redistribuicao', title: 'Redistribuição e consumo', description: 'Analise excedentes, necessidades e consumo dos medicamentos.', icon: ArrowLeftRight, group: 'Monitoramento', resources: ['Sugestões de redistribuição', 'Consumo médio mensal', 'Meses de estoque'] },
  { path: '/relatorios', title: 'Relatórios', description: 'Consulte informações para apoiar o planejamento da assistência farmacêutica.', icon: ChartNoAxesCombined, group: 'Análise', resources: ['Estoque e validade', 'Movimentações', 'Análise de consumo'] },
  { path: '/unidades', title: 'Unidades', description: 'Organize as unidades de saúde que integram a rede municipal.', icon: Building2, group: 'Administração', resources: ['Cadastro de unidades', 'Responsáveis', 'Situação cadastral'] },
  { path: '/usuarios', title: 'Usuários', description: 'Gerencie os usuários responsáveis pelo acompanhamento dos medicamentos.', icon: Users, group: 'Administração', resources: ['Cadastro de usuários', 'Perfis de acesso', 'Vínculo com a unidade'] },
  { path: '/historico', title: 'Histórico', description: 'Acompanhe os registros das operações realizadas nas unidades de saúde.', icon: History, group: 'Análise', resources: ['Registro de operações', 'Usuário responsável', 'Consulta por período'] },
]
