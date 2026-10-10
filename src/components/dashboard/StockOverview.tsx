import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Ponto { nome: string; quantidade: number; cor: string }

export default function StockOverview({ dados }: { dados: Ponto[] }) {
  const total = dados.reduce((soma, item) => soma + item.quantidade, 0)
  return (
    <section className="rounded-xl border bg-white p-5 sm:p-6" aria-labelledby="titulo-grafico">
      <div className="mb-5">
        <h2 id="titulo-grafico" className="text-lg font-semibold">Situação do estoque</h2>
        <p className="mt-1 text-sm text-muted-foreground">{total} combinações de medicamento e unidade com lote cadastrado</p>
      </div>
      {total === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">Sem registros de estoque para o gráfico.</p> : (
        <div className="h-48 w-full" role="img" aria-label={`Situação do estoque: ${dados.map((item) => `${item.nome}: ${item.quantidade}`).join(', ')}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} layout="vertical" margin={{ top: 2, right: 12, bottom: 2, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="nome" width={58} tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip formatter={(valor) => [valor, 'Medicamentos por unidade']} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="quantidade" radius={[0, 4, 4, 0]} maxBarSize={25} isAnimationActive={false}>
                {dados.map((item) => <Cell key={item.nome} fill={item.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs text-muted-foreground" aria-label="Legenda e valores do gráfico">
        {dados.map((item) => <span key={item.nome} className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: item.cor }} />{item.nome}: <strong className="font-semibold text-foreground">{item.quantidade}</strong></span>)}
      </div>
    </section>
  )
}
