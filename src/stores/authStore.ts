import { create } from 'zustand'
import { authApi } from '../services/authApi.ts'
import type { Usuario } from '../types/index.ts'

type ServicoAuth = Pick<typeof authApi, 'login' | 'restaurarSessao' | 'logout'>

export interface AuthState {
  usuarioAtual: Usuario | null
  isAuthenticated: boolean
  inicializado: boolean
  carregando: boolean
  erro: string | null
  inicializar: () => Promise<void>
  login: (email: string, senha: string) => Promise<boolean>
  logout: () => boolean
}

export function criarAuthStore(servico: ServicoAuth = authApi) {
  let inicializacao: Promise<void> | null = null
  return create<AuthState>()((set, get) => ({
    usuarioAtual: null,
    isAuthenticated: false,
    inicializado: false,
    carregando: false,
    erro: null,
    inicializar: () => {
      if (inicializacao) return inicializacao
      if (get().inicializado) return Promise.resolve()
      inicializacao = Promise.resolve().then(async () => {
        try {
          const usuarioAtual = await servico.restaurarSessao()
          set({ usuarioAtual, isAuthenticated: usuarioAtual !== null, erro: null })
        } catch {
          set({ erro: 'Não foi possível recuperar a sessão neste navegador.' })
        } finally {
          inicializacao = null
          set({ inicializado: true, carregando: false })
        }
      })
      set({ carregando: true })
      return inicializacao
    },
    login: async (email, senha) => {
      if (inicializacao) await inicializacao
      set({ carregando: true, erro: null })
      try {
        const usuarioAtual = await servico.login(email, senha)
        set({ usuarioAtual, isAuthenticated: true, inicializado: true })
        return true
      } catch (error) {
        set({ erro: error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.' })
        return false
      } finally {
        set({ carregando: false })
      }
    },
    logout: () => {
      try {
        servico.logout()
        set({ usuarioAtual: null, isAuthenticated: false, erro: null })
        return true
      } catch {
        set({ erro: 'Não foi possível encerrar a sessão. Tente novamente.' })
        return false
      }
    },
  }))
}

export const useAuthStore = criarAuthStore()
