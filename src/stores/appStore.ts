import { create } from 'zustand'
import { mockApi } from '../services/mockApi.ts'
import type { Alerta, SugestaoRedistribuicao } from '../types/index.ts'

type ServicoAplicacao = Pick<typeof mockApi, 'getDadosAplicacao'>
type DadosAplicacao = Awaited<ReturnType<ServicoAplicacao['getDadosAplicacao']>>

export interface AppState extends DadosAplicacao {
  // null significa não calculado; [] significará calculado sem resultados.
  alertas: Alerta[] | null
  sugestoes: SugestaoRedistribuicao[] | null
  carregando: boolean
  dadosCarregados: boolean
  erro: string | null
  inicializar: () => Promise<void>
  recarregar: () => Promise<void>
}

/** A fábrica permite validar novas sessões sem compartilhar estado entre testes. */
export function criarAppStore(servico: ServicoAplicacao = mockApi) {
  let emAndamento: Promise<void> | null = null

  return create<AppState>()((set, get) => {
    const carregar = (): Promise<void> => {
      if (emAndamento) return emAndamento

      // Reserva a requisição antes de notificar assinantes, inclusive em StrictMode.
      emAndamento = Promise.resolve().then(async () => {
        try {
          const dados = await servico.getDadosAplicacao()
          set({ ...dados, dadosCarregados: true, erro: null, alertas: null, sugestoes: null })
        } catch {
          // Mantém o último conjunto válido em caso de falha ao atualizar.
          set({ erro: 'Não foi possível carregar os dados locais. Os registros existentes foram preservados.' })
        } finally {
          emAndamento = null
          set({ carregando: false })
        }
      })
      set({ carregando: true, erro: null })
      return emAndamento
    }

    return {
      unidades: [], medicamentos: [], lotes: [], movimentacoes: [],
      alertas: null, sugestoes: null,
      carregando: false, dadosCarregados: false, erro: null,
      inicializar: () => emAndamento ?? (get().dadosCarregados ? Promise.resolve() : carregar()),
      recarregar: carregar,
    }
  })
}

export const useAppStore = criarAppStore()
