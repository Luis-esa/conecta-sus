import { useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { selecionarDadosCarregados, selecionarErro, selecionarEstoque, selecionarLotes, selecionarMedicamentos, selecionarUnidades } from '@/stores/appSelectors'
import { useAuthStore } from '@/stores/authStore'
import { criarConsultas } from '@/utils/consultas'

export function useConsultas() {
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const unidades = useAppStore(selecionarUnidades)
  const medicamentos = useAppStore(selecionarMedicamentos)
  const lotes = useAppStore(selecionarLotes)
  const estoque = useAppStore(selecionarEstoque)
  const dadosCarregados = useAppStore(selecionarDadosCarregados)
  const erro = useAppStore(selecionarErro)
  const consultas = useMemo(() => usuario ? criarConsultas({ unidades, medicamentos, lotes, estoque }, usuario) : null,
    [usuario, unidades, medicamentos, lotes, estoque])
  return { consultas, usuario, dadosCarregados, erro }
}
