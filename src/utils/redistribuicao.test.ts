import assert from 'node:assert/strict'
import test from 'node:test'
import { gerarSugestoesRedistribuicao } from './redistribuicao.ts'
import type { Medicamento, Unidade } from '../types/index.ts'

const medicamento: Medicamento = { id: 1, nome: 'Teste', principioAtivo: 'Teste', concentracao: '1 mg', formaFarmaceutica: 'Comprimido', unidadeMedida: 'un', codigo: 'T', estoqueMinimo: 100, ativo: true }
const unidades: Unidade[] = [1, 2, 3].map((id) => ({ id, nome: `UBS ${id}`, codigo: String(id), endereco: 'Teste', status: 'ATIVA' }))

test('sugere apenas excedente e necessidade, sem consumir o mesmo excedente duas vezes', () => {
  const sugestoes = gerarSugestoesRedistribuicao({ unidades, medicamentos: [medicamento], estoque: [
    { medicamentoId: 1, unidadeId: 1, quantidade: 260 },
    { medicamentoId: 1, unidadeId: 2, quantidade: 20 },
    { medicamentoId: 1, unidadeId: 3, quantidade: 30 },
  ] })
  assert.equal(sugestoes.length, 1)
  assert.deepEqual([sugestoes[0].origemId, sugestoes[0].destinoId, sugestoes[0].quantidadeSugerida], [1, 2, 60])
  assert.equal(sugestoes[0].estoqueOrigem, 260)
  assert.equal(sugestoes[0].estoqueDestino, 20)
})

test('não sugere quando os limites estritos não são atendidos ou a unidade está inativa', () => {
  const estoque = [{ medicamentoId: 1, unidadeId: 1, quantidade: 200 }, { medicamentoId: 1, unidadeId: 2, quantidade: 100 }]
  assert.deepEqual(gerarSugestoesRedistribuicao({ unidades, medicamentos: [medicamento], estoque }), [])
  assert.deepEqual(gerarSugestoesRedistribuicao({ unidades: [{ ...unidades[0], status: 'INATIVA' }, unidades[1]], medicamentos: [medicamento], estoque: [{ ...estoque[0], quantidade: 300 }, { ...estoque[1], quantidade: 10 }] }), [])
})
