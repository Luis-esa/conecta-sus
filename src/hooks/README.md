# Hooks

`useConsultas.ts` lê usuário e coleções do Zustand e monta, com memoização, as consultas de estoque, medicamentos e lotes. O recorte por perfil e as regras de classificação ficam nos utilitários puros, não no hook nem nos componentes.
