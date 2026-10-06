import { z } from 'zod'
import type { Lote, Medicamento, Movimentacao, Unidade, Usuario } from '../types/index.ts'

const id = z.number().int().positive()
const quantidade = z.number().int().nonnegative()
const texto = z.string().min(1)

const usuarioSchema = z.object({
  id, nome: texto, email: z.email(), role: z.enum(['ADMIN', 'GESTOR', 'UBS']),
  unidadeId: id.optional(), ativo: z.boolean(),
}) satisfies z.ZodType<Usuario>
const unidadeSchema = z.object({
  id, nome: texto, codigo: texto, endereco: texto,
  telefone: z.string().optional(), responsavel: z.string().optional(), status: z.enum(['ATIVA', 'INATIVA']),
}) satisfies z.ZodType<Unidade>
const medicamentoSchema = z.object({
  id, nome: texto, principioAtivo: texto, concentracao: texto, formaFarmaceutica: texto,
  unidadeMedida: texto, codigo: texto, estoqueMinimo: quantidade,
  estoqueMaximo: quantidade.optional(), ativo: z.boolean(),
}) satisfies z.ZodType<Medicamento>
const loteSchema = z.object({
  id, medicamentoId: id, numero: texto, quantidade,
  dataEntrada: z.iso.date(), dataValidade: z.iso.date(), unidadeId: id,
}) satisfies z.ZodType<Lote>
const movimentacaoSchema = z.object({
  id, tipo: z.enum(['ENTRADA', 'SAIDA', 'TRANSFERENCIA']), medicamentoId: id,
  loteId: id.optional(), quantidade: quantidade.positive(), origemId: id.optional(), destinoId: id.optional(),
  usuarioId: id, dataHora: z.iso.datetime({ offset: true }),
  motivo: z.string().optional(), observacao: z.string().optional(),
}) satisfies z.ZodType<Movimentacao>

export const dadosSchema = z.object({
  usuarios: z.array(usuarioSchema),
  unidades: z.array(unidadeSchema),
  medicamentos: z.array(medicamentoSchema),
  lotes: z.array(loteSchema),
  movimentacoes: z.array(movimentacaoSchema),
}).superRefine((dados, ctx) => {
  const erro = (message: string) => ctx.addIssue({ code: 'custom', message })
  for (const [nome, registros] of Object.entries(dados)) {
    if (new Set(registros.map((registro) => registro.id)).size !== registros.length) erro(`IDs duplicados em ${nome}.`)
  }
  const unidades = new Set(dados.unidades.map((item) => item.id))
  const medicamentos = new Set(dados.medicamentos.map((item) => item.id))
  const usuarios = new Set(dados.usuarios.map((item) => item.id))
  const lotes = new Map(dados.lotes.map((item) => [item.id, item]))
  for (const usuario of dados.usuarios) {
    if ((usuario.role === 'UBS' && usuario.unidadeId === undefined)
      || (usuario.unidadeId !== undefined && !unidades.has(usuario.unidadeId))) erro('Usuário com unidade inválida.')
  }
  for (const lote of dados.lotes) {
    if (!medicamentos.has(lote.medicamentoId) || !unidades.has(lote.unidadeId)) erro('Lote com referência inválida.')
  }
  for (const movimento of dados.movimentacoes) {
    if (!medicamentos.has(movimento.medicamentoId) || !usuarios.has(movimento.usuarioId)) erro('Movimentação com referência inválida.')
    if (movimento.origemId !== undefined && !unidades.has(movimento.origemId)) erro('Origem inexistente.')
    if (movimento.destinoId !== undefined && !unidades.has(movimento.destinoId)) erro('Destino inexistente.')
    if (movimento.tipo !== 'ENTRADA' && movimento.origemId === undefined) erro('Origem obrigatória.')
    if (movimento.tipo !== 'SAIDA' && movimento.destinoId === undefined) erro('Destino obrigatório.')
    if (movimento.tipo === 'TRANSFERENCIA' && movimento.origemId === movimento.destinoId) erro('Transferência para a mesma unidade.')
    if (movimento.loteId !== undefined) {
      const lote = lotes.get(movimento.loteId)
      const unidadeId = movimento.tipo === 'ENTRADA' ? movimento.destinoId : movimento.origemId
      if (!lote || lote.medicamentoId !== movimento.medicamentoId || lote.unidadeId !== unidadeId) erro('Movimentação com lote incompatível.')
    }
  }
})

export type DadosPersistidos = z.infer<typeof dadosSchema>
