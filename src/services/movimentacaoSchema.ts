import { z } from 'zod'

const id = z.number().int().positive()
const quantidade = z.number().int().positive('A quantidade deve ser maior que zero.')
const data = z.iso.date('Informe uma data válida.')
const observacao = z.string().max(500, 'A observação deve ter até 500 caracteres.').optional()

export const entradaSchema = z.object({
  medicamentoId: id,
  unidadeId: id,
  loteId: id.optional(),
  numeroLote: z.string().trim().min(1, 'Informe o número do lote.'),
  quantidade,
  dataValidade: data,
  origem: z.string().trim().min(1, 'Informe a origem.'),
  data,
  observacao,
  usuarioId: id,
})

export const saidaSchema = z.object({
  medicamentoId: id,
  unidadeId: id,
  loteId: id,
  quantidade,
  destinoMotivo: z.string().trim().min(1, 'Informe o destino ou motivo.'),
  data,
  observacao,
  usuarioId: id,
})

export type EntradaDados = z.infer<typeof entradaSchema>
export type SaidaDados = z.infer<typeof saidaSchema>
