// Contratos do domínio conforme PROJECT_CONTEXT.md, seção 6.
// Independentes de React, estado global e persistência.

export type Role = 'ADMIN' | 'GESTOR' | 'UBS'
export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA'
export type StatusEstoque = 'NORMAL' | 'BAIXO' | 'CRITICO'
export type TipoAlerta = 'ESTOQUE_BAIXO' | 'ESTOQUE_CRITICO' | 'VENCIMENTO'
export type StatusUnidade = 'ATIVA' | 'INATIVA'
export type StatusAlerta = 'ATIVO' | 'RESOLVIDO'
export type StatusSugestaoRedistribuicao = 'PENDENTE' | 'ACEITA' | 'IGNORADA'

export interface Usuario {
  id: number
  nome: string
  email: string
  role: Role
  unidadeId?: number
  ativo: boolean
}

export interface Unidade {
  id: number
  nome: string
  codigo: string
  endereco: string
  telefone?: string
  responsavel?: string
  status: StatusUnidade
}

export interface Medicamento {
  id: number
  nome: string
  principioAtivo: string
  concentracao: string
  formaFarmaceutica: string
  unidadeMedida: string
  codigo: string
  estoqueMinimo: number
  estoqueMaximo?: number
  ativo: boolean
}

export interface Lote {
  id: number
  medicamentoId: number
  numero: string
  quantidade: number
  dataEntrada: string
  dataValidade: string
  unidadeId: number
}

/** Saldo agregado dos lotes de um medicamento em uma unidade; não é persistido. */
export interface Estoque {
  medicamentoId: number
  unidadeId: number
  quantidade: number
}

export interface Movimentacao {
  id: number
  tipo: TipoMovimentacao
  medicamentoId: number
  loteId?: number
  quantidade: number
  origemId?: number
  destinoId?: number
  usuarioId: number
  dataHora: string
  motivo?: string
  observacao?: string
}

export interface Alerta {
  id: number
  tipo: TipoAlerta
  medicamentoId: number
  unidadeId: number
  data: string
  status: StatusAlerta
  mensagem: string
}

export interface SugestaoRedistribuicao {
  id: number
  medicamentoId: number
  origemId: number
  destinoId: number
  quantidadeSugerida: number
  motivo: string
  status: StatusSugestaoRedistribuicao
}
