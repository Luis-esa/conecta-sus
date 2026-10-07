import { criarDadosIniciais } from '../data/seed.ts'
import { dadosSchema, type DadosPersistidos } from './dadosSchema.ts'

export const CHAVES_DADOS = {
  usuarios: 'conectasus_users',
  unidades: 'conectasus_unidades',
  medicamentos: 'conectasus_medicamentos',
  lotes: 'conectasus_lotes',
  movimentacoes: 'conectasus_movimentacoes',
} as const satisfies Record<keyof DadosPersistidos, string>

export type Armazenamento = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** Não mantém cache: cada leitura reflete os dados atualmente persistidos. */
export function carregarDados(storage: Armazenamento, agora = new Date()): DadosPersistidos {
  const entradas = Object.entries(CHAVES_DADOS)
  const registros = entradas.map(([campo, chave]) => ({ campo, chave, valor: storage.getItem(chave) }))
  const existentes = registros.filter((registro) => registro.valor !== null)

  if (existentes.length === 0) {
    const dados = dadosSchema.parse(criarDadosIniciais(agora))
    const gravadas: string[] = []
    try {
      for (const [campo, chave] of entradas) {
        storage.setItem(chave, JSON.stringify(dados[campo as keyof DadosPersistidos]))
        gravadas.push(chave)
      }
    } catch (cause) {
      // Reverte somente as chaves novas desta tentativa (ex.: limite de espaço).
      for (const chave of gravadas) storage.removeItem(chave)
      throw new Error('Não foi possível salvar os dados iniciais neste navegador.', { cause })
    }
    return dados
  }

  if (existentes.length !== entradas.length) {
    throw new Error('Dados locais incompletos. Os registros existentes foram preservados; não foi feita reinicialização automática.')
  }

  try {
    const dados: unknown = Object.fromEntries(registros.map(({ campo, valor }) => [campo, JSON.parse(valor!)]))
    return dadosSchema.parse(dados)
  } catch (cause) {
    throw new Error('Dados locais inválidos. Os registros foram preservados; não foi feita reinicialização automática.', { cause })
  }
}

/** Valida o conjunto inteiro e grava lote/histórico; restaura a versão anterior se a segunda escrita falhar. */
export function salvarOperacao(storage: Armazenamento, dados: DadosPersistidos): DadosPersistidos {
  const validos = dadosSchema.parse(dados)
  const chaves = [CHAVES_DADOS.lotes, CHAVES_DADOS.movimentacoes]
  const anteriores = chaves.map((chave) => storage.getItem(chave))
  if (anteriores.some((valor) => valor === null)) throw new Error('Dados locais incompletos. A operação não foi gravada.')
  let gravadas = 0
  try {
    storage.setItem(chaves[0], JSON.stringify(validos.lotes))
    gravadas++
    storage.setItem(chaves[1], JSON.stringify(validos.movimentacoes))
    gravadas++
  } catch (cause) {
    for (let i = gravadas - 1; i >= 0; i--) storage.setItem(chaves[i], anteriores[i]!)
    throw new Error('Não foi possível salvar a movimentação neste navegador.', { cause })
  }
  return validos
}
