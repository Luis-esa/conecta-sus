import { z } from 'zod'
import type { Usuario } from '../types/index.ts'
import type { Armazenamento } from './persistencia.ts'

export const CHAVE_CREDENCIAIS = 'conectasus_credenciais'
export const SENHA_DEMONSTRACAO = '123456'

const credenciaisSchema = z.record(z.string(), z.string().min(1))
export type Credenciais = Record<string, string>

/** Dados anteriores à criação de senhas individuais usam a senha inicial do MVP. */
export function lerCredenciais(storage: Armazenamento, usuarios: readonly Usuario[]): Credenciais {
  const valor = storage.getItem(CHAVE_CREDENCIAIS)
  if (valor === null) return Object.fromEntries(usuarios.map((usuario) => [usuario.id, SENHA_DEMONSTRACAO]))
  try { return credenciaisSchema.parse(JSON.parse(valor)) }
  catch { throw new Error('Credenciais locais inválidas. Os dados existentes foram preservados.') }
}
