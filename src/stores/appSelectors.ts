import type { AppState } from './appStore.ts'
import type { Estoque, Lote } from '../types/index.ts'
import { agregarEstoque } from '../utils/estoque.ts'

export const selecionarUnidades = (state: AppState) => state.unidades
export const selecionarMedicamentos = (state: AppState) => state.medicamentos
export const selecionarLotes = (state: AppState) => state.lotes
export const selecionarMovimentacoes = (state: AppState) => state.movimentacoes
export const selecionarAlertas = (state: AppState) => state.alertas
export const selecionarSugestoes = (state: AppState) => state.sugestoes
export const selecionarCarregando = (state: AppState) => state.carregando
export const selecionarDadosCarregados = (state: AppState) => state.dadosCarregados
export const selecionarErro = (state: AppState) => state.erro
export const selecionarRecarregar = (state: AppState) => state.recarregar

// Referência estável por coleção: evita novos snapshots a cada render no Zustand.
const estoques = new WeakMap<Lote[], Estoque[]>()
export function selecionarEstoque(state: AppState): Estoque[] {
  let estoque = estoques.get(state.lotes)
  if (!estoque) {
    estoque = agregarEstoque(state.lotes)
    estoques.set(state.lotes, estoque)
  }
  return estoque
}
