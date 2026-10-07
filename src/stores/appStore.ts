import { create } from 'zustand'
import { ZodError } from 'zod'
import { mockApi } from '../services/mockApi.ts'
import type { EntradaDados, SaidaDados, TransferenciaDados } from '../services/movimentacaoSchema.ts'
import type { MedicamentoCadastro, UnidadeCadastro, UsuarioCadastro } from '../services/cadastroSchema.ts'
import { gerarAlertas, type AlertaAtual } from '../utils/alertas.ts'
import { agregarEstoque } from '../utils/estoque.ts'
import { gerarSugestoesRedistribuicao, type SugestaoDetalhada } from '../utils/redistribuicao.ts'

type ServicoAplicacao = Pick<typeof mockApi, 'getDadosAplicacao'> & Partial<Pick<typeof mockApi, 'registrarEntrada' | 'registrarSaida' | 'registrarTransferencia' | 'salvarMedicamento' | 'salvarUnidade' | 'salvarUsuario' | 'corrigirValidadeLote'>>
type DadosAplicacao = Awaited<ReturnType<ServicoAplicacao['getDadosAplicacao']>>

export interface AppState extends DadosAplicacao {
  // null significa não carregado; [] significa dados carregados sem alertas.
  alertas: AlertaAtual[] | null
  sugestoes: SugestaoDetalhada[] | null
  carregando: boolean
  dadosCarregados: boolean
  erro: string | null
  operacaoCarregando: boolean
  operacaoErro: string | null
  inicializar: () => Promise<void>
  recarregar: () => Promise<void>
  registrarEntrada: (dados: EntradaDados) => Promise<boolean>
  registrarSaida: (dados: SaidaDados) => Promise<boolean>
  registrarTransferencia: (dados: TransferenciaDados) => Promise<boolean>
  salvarMedicamento: (adminId: number, dados: MedicamentoCadastro, id?: number) => Promise<boolean>
  salvarUnidade: (adminId: number, dados: UnidadeCadastro, id?: number) => Promise<boolean>
  salvarUsuario: (adminId: number, dados: UsuarioCadastro, id?: number) => Promise<boolean>
  corrigirValidadeLote: (adminId: number, loteId: number, dataValidade: string) => Promise<boolean>
  limparErroOperacao: () => void
}

/** A fábrica permite validar novas sessões sem compartilhar estado entre testes. */
export function criarAppStore(servico: ServicoAplicacao = mockApi) {
  let emAndamento: Promise<void> | null = null
  let operacaoEmAndamento = false

  return create<AppState>()((set, get) => {
    const carregar = (): Promise<void> => {
      if (emAndamento) return emAndamento

      // Reserva a requisição antes de notificar assinantes, inclusive em StrictMode.
      emAndamento = Promise.resolve().then(async () => {
        try {
          const dados = await servico.getDadosAplicacao()
          set({ ...dados, dadosCarregados: true, erro: null, alertas: gerarAlertas(dados), sugestoes: gerarSugestoesRedistribuicao({ ...dados, estoque: agregarEstoque(dados.lotes) }) })
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

    const operar = async (executar: () => Promise<DadosAplicacao>): Promise<boolean> => {
      if (operacaoEmAndamento) return false
      operacaoEmAndamento = true
      if (emAndamento) await emAndamento
      set({ operacaoCarregando: true, operacaoErro: null })
      try {
        const dados = await executar()
        set({ ...dados, dadosCarregados: true, alertas: gerarAlertas(dados), sugestoes: gerarSugestoesRedistribuicao({ ...dados, estoque: agregarEstoque(dados.lotes) }), erro: null })
        return true
      } catch (error) {
        const mensagem = error instanceof ZodError ? error.issues[0]?.message : error instanceof Error ? error.message : null
        set({ operacaoErro: mensagem || 'Não foi possível registrar a movimentação.' })
        return false
      } finally {
        operacaoEmAndamento = false
        set({ operacaoCarregando: false })
      }
    }

    return {
      usuarios: [], unidades: [], medicamentos: [], lotes: [], movimentacoes: [],
      alertas: null, sugestoes: null,
      carregando: false, dadosCarregados: false, erro: null,
      operacaoCarregando: false, operacaoErro: null,
      inicializar: () => emAndamento ?? (get().dadosCarregados ? Promise.resolve() : carregar()),
      recarregar: carregar,
      registrarEntrada: (dados) => operar(() => {
        if (!servico.registrarEntrada) throw new Error('Registro de entrada indisponível.')
        return servico.registrarEntrada(dados)
      }),
      registrarSaida: (dados) => operar(() => {
        if (!servico.registrarSaida) throw new Error('Registro de saída indisponível.')
        return servico.registrarSaida(dados)
      }),
      registrarTransferencia: (dados) => operar(() => {
        if (!servico.registrarTransferencia) throw new Error('Registro de transferência indisponível.')
        return servico.registrarTransferencia(dados)
      }),
      salvarMedicamento: (adminId, dados, id) => operar(() => {
        if (!servico.salvarMedicamento) throw new Error('Cadastro de medicamentos indisponível.')
        return servico.salvarMedicamento(adminId, dados, id)
      }),
      salvarUnidade: (adminId, dados, id) => operar(() => {
        if (!servico.salvarUnidade) throw new Error('Cadastro de unidades indisponível.')
        return servico.salvarUnidade(adminId, dados, id)
      }),
      salvarUsuario: (adminId, dados, id) => operar(() => {
        if (!servico.salvarUsuario) throw new Error('Cadastro de usuários indisponível.')
        return servico.salvarUsuario(adminId, dados, id)
      }),
      corrigirValidadeLote: (adminId, loteId, dataValidade) => operar(() => {
        if (!servico.corrigirValidadeLote) throw new Error('Correção de lote indisponível.')
        return servico.corrigirValidadeLote(adminId, loteId, dataValidade)
      }),
      limparErroOperacao: () => set({ operacaoErro: null }),
    }
  })
}

export const useAppStore = criarAppStore()
