import type { Medicamento, Unidade, Usuario } from '../types/index.ts'

// Cadastros exclusivamente fictícios para demonstração.
export const unidadesIniciais: Unidade[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  nome: `UBS ${String(index + 1).padStart(2, '0')}`,
  codigo: `UBS${String(index + 1).padStart(2, '0')}`,
  endereco: `Endereço demonstrativo ${index + 1}, Lagarto - SE`,
  status: 'ATIVA',
}))

export const usuariosIniciais: Usuario[] = [
  { id: 1, nome: 'Administrador Demo', email: 'admin@conectasus.com', role: 'ADMIN', ativo: true },
  { id: 2, nome: 'Gestor Demo', email: 'gestor@conectasus.com', role: 'GESTOR', ativo: true },
  ...unidadesIniciais.map((unidade): Usuario => ({
    id: unidade.id + 2,
    nome: `Responsável Demo ${unidade.nome}`,
    email: `ubs${String(unidade.id).padStart(2, '0')}@conectasus.com`,
    role: 'UBS',
    unidadeId: unidade.id,
    ativo: true,
  })),
]

const catalogo: [nome: string, concentracao: string, forma: string][] = [
  ['Paracetamol', '500 mg', 'Comprimido'],
  ['Dipirona', '500 mg', 'Comprimido'],
  ['Amoxicilina', '500 mg', 'Cápsula'],
  ['Losartana', '50 mg', 'Comprimido'],
  ['Ibuprofeno', '600 mg', 'Comprimido'],
  ['Omeprazol', '20 mg', 'Cápsula'],
  ['Metformina', '850 mg', 'Comprimido'],
  ['Atenolol', '50 mg', 'Comprimido'],
  ['Captopril', '25 mg', 'Comprimido'],
  ['Enalapril', '10 mg', 'Comprimido'],
  ['Hidroclorotiazida', '25 mg', 'Comprimido'],
  ['Furosemida', '40 mg', 'Comprimido'],
  ['Sinvastatina', '20 mg', 'Comprimido'],
  ['Ácido acetilsalicílico', '100 mg', 'Comprimido'],
  ['Loratadina', '10 mg', 'Comprimido'],
  ['Prednisona', '20 mg', 'Comprimido'],
  ['Azitromicina', '500 mg', 'Comprimido'],
  ['Cefalexina', '500 mg', 'Cápsula'],
  ['Sulfato ferroso', '40 mg', 'Comprimido'],
  ['Ácido fólico', '5 mg', 'Comprimido'],
]

export const medicamentosIniciais: Medicamento[] = catalogo.map(([nome, concentracao, forma], index) => ({
  id: index + 1,
  nome: `${nome} ${concentracao}`,
  principioAtivo: nome,
  concentracao,
  formaFarmaceutica: forma,
  unidadeMedida: forma.toLowerCase(),
  codigo: `MED${String(index + 1).padStart(3, '0')}`,
  estoqueMinimo: 100,
  estoqueMaximo: 300,
  ativo: true,
}))
