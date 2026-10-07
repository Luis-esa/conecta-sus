import type { Role, Usuario } from '../types/index.ts'

const rotasPorPerfil: Record<Role, readonly string[]> = {
  ADMIN: ['/dashboard', '/estoque', '/medicamentos', '/lotes', '/movimentacoes', '/transferencias', '/alertas', '/relatorios', '/unidades', '/usuarios', '/historico'],
  GESTOR: ['/dashboard', '/estoque', '/medicamentos', '/lotes', '/movimentacoes', '/transferencias', '/alertas', '/relatorios'],
  UBS: ['/dashboard', '/estoque', '/lotes', '/movimentacoes', '/transferencias', '/alertas', '/historico'],
}

export function podeAcessar(usuario: Usuario, path: string): boolean {
  if (!usuario.ativo || (usuario.role === 'UBS' && usuario.unidadeId === undefined)) return false
  return rotasPorPerfil[usuario.role].includes(path)
}

export const nomePerfil: Record<Role, string> = {
  ADMIN: 'Administrador',
  GESTOR: 'Gestor municipal',
  UBS: 'Responsável UBS',
}
