import { z } from 'zod'

const texto = z.string().trim().min(1, 'Campo obrigatório.')
const codigo = texto.max(40, 'Use até 40 caracteres.')

export const medicamentoCadastroSchema = z.object({
  nome: texto, principioAtivo: texto, concentracao: texto, formaFarmaceutica: texto,
  unidadeMedida: texto, codigo, estoqueMinimo: z.number().int().nonnegative(),
  estoqueMaximo: z.number().int().nonnegative().optional(), ativo: z.boolean(),
}).refine((item) => item.estoqueMaximo === undefined || item.estoqueMaximo >= item.estoqueMinimo,
  { path: ['estoqueMaximo'], message: 'O máximo deve ser maior ou igual ao mínimo.' })

export const unidadeCadastroSchema = z.object({
  nome: texto, codigo, endereco: texto, telefone: z.string().trim().optional(),
  responsavel: z.string().trim().optional(), status: z.enum(['ATIVA', 'INATIVA']),
})

export const usuarioCadastroSchema = z.object({
  nome: texto, email: z.email('Informe um e-mail válido.'), role: z.enum(['ADMIN', 'GESTOR', 'UBS']),
  unidadeId: z.number().int().positive().optional(), ativo: z.boolean(),
  senha: z.union([z.literal(''), z.string().min(6, 'Use pelo menos 6 caracteres na senha.')]).optional(),
}).refine((item) => item.role !== 'UBS' || item.unidadeId !== undefined,
  { path: ['unidadeId'], message: 'Vincule uma unidade ao usuário UBS.' })

export function schemaUsuarioCadastro(id?: number) {
  return usuarioCadastroSchema.refine((item) => id !== undefined || Boolean(item.senha),
    { path: ['senha'], message: 'Informe uma senha para o novo usuário.' })
}

export const loteValidadeSchema = z.object({ dataValidade: z.iso.date('Informe uma data válida.') })

export type MedicamentoCadastro = z.infer<typeof medicamentoCadastroSchema>
export type UnidadeCadastro = z.infer<typeof unidadeCadastroSchema>
export type UsuarioCadastro = z.infer<typeof usuarioCadastroSchema>
