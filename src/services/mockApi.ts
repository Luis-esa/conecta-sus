import { agregarEstoque } from '../utils/estoque.ts'
import { carregarDados, type Armazenamento } from './persistencia.ts'

/** Ponto de acesso dos futuros stores. A fábrica permite testar sem tocar no navegador. */
export function criarMockApi(obterStorage: () => Armazenamento = () => window.localStorage) {
  const ler = () => carregarDados(obterStorage())

  return {
    async getDadosAplicacao() {
      const { unidades, medicamentos, lotes, movimentacoes } = ler()
      return { unidades, medicamentos, lotes, movimentacoes }
    },
    async inicializarDados(): Promise<void> { ler() },
    async getUsuarios() { return ler().usuarios },
    async getUnidades() { return ler().unidades },
    async getMedicamentos() { return ler().medicamentos },
    async getLotes() { return ler().lotes },
    async getEstoque() { return agregarEstoque(ler().lotes) },
    async getMovimentacoes() { return ler().movimentacoes },
  }
}

// Entradas, saídas e transferências serão acrescentadas aqui nas etapas respectivas,
// usando os mesmos dados e a camada de persistência; não há operações fictícias de escrita.
export const mockApi = criarMockApi()
