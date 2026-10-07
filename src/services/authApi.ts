import { z } from 'zod'
import { mockApi } from './mockApi.ts'
import type { Armazenamento } from './persistencia.ts'
import type { Usuario } from '../types/index.ts'

export const CHAVE_SESSAO = 'conectasus_session'
const SENHA_DEMONSTRACAO = '123456'
const sessaoSchema = z.object({ usuarioId: z.number().int().positive() })
type ServicoUsuarios = Pick<typeof mockApi, 'getUsuarios'>

/** Autenticação de demonstração; a sessão guarda apenas o ID, sem senha. */
export function criarAuthApi(
  usuariosApi: ServicoUsuarios = mockApi,
  obterStorage: () => Armazenamento = () => window.localStorage,
) {
  const storage = () => obterStorage()

  return {
    async login(email: string, senha: string): Promise<Usuario> {
      const usuarios = await usuariosApi.getUsuarios()
      const usuario = usuarios.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.ativo)
      if (!usuario || senha !== SENHA_DEMONSTRACAO || (usuario.role === 'UBS' && usuario.unidadeId === undefined)) {
        throw new Error('E-mail ou senha inválidos.')
      }
      storage().setItem(CHAVE_SESSAO, JSON.stringify({ usuarioId: usuario.id }))
      return usuario
    },
    async restaurarSessao(): Promise<Usuario | null> {
      const valor = storage().getItem(CHAVE_SESSAO)
      if (valor === null) return null
      let sessao: unknown
      try { sessao = JSON.parse(valor) } catch { sessao = null }
      const validacao = sessaoSchema.safeParse(sessao)
      if (!validacao.success) {
        storage().removeItem(CHAVE_SESSAO)
        return null
      }
      const usuarios = await usuariosApi.getUsuarios()
      const usuario = usuarios.find((item) => item.id === validacao.data.usuarioId && item.ativo)
      if (!usuario || (usuario.role === 'UBS' && usuario.unidadeId === undefined)) {
        storage().removeItem(CHAVE_SESSAO)
        return null
      }
      return usuario
    },
    logout(): void { storage().removeItem(CHAVE_SESSAO) },
  }
}

export const authApi = criarAuthApi()
