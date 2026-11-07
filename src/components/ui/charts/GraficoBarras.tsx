'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function GraficoBarras({
  datos,
  etiqueta,
}: {
  datos: { nombre: string; valor: number }[];
  etiqueta: string;
}) {
  return (
    <section className="h-64 rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      <p className="mb-2 text-sm font-semibold text-foreground">{etiqueta}</p>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={datos}>
          <XAxis dataKey="nombre" tick={{ fontSize: 11 }} interval={0} />
          <YAxis allowDecimals={false} width={28} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="valor" name="Visitas" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
