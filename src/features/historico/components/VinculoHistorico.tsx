'use client';

import { useEffect, useState } from 'react';
import { Link2 } from 'lucide-react';
import {
  sugerir_vinculo,
  vincular_historico,
  type HistoricoDetalle,
  type SugerenciaVinculo,
  type TipoVinculo,
} from '@/lib/datos/actions';
import { Button, Input } from '@/components/ui';

const ETIQUETA: Record<TipoVinculo, string> = { cliente: 'Cliente', equipo: 'Equipo', tecnico: 'Técnico', sede: 'Sede' };

interface Eleccion {
  id: string | null;
  etiqueta: string;
}

// Un campo de vínculo: busca por parecido en RP-TECH y deja elegir. No crea clientes nuevos:
// solo apunta a registros que ya existen (regla del sprint).
function CampoVinculo({
  tipo,
  leido,
  valor,
  onElegir,
}: {
  tipo: TipoVinculo;
  leido: string | null;
  valor: Eleccion;
  onElegir: (e: Eleccion) => void;
}) {
  const [texto, setTexto] = useState(leido ?? '');
  const [sugerencias, setSugerencias] = useState<SugerenciaVinculo[]>([]);

  useEffect(() => {
    let vigente = true;
    const t = setTimeout(() => {
      sugerir_vinculo(tipo, texto).then((s) => vigente && setSugerencias(s));
    }, 300);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [tipo, texto]);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{ETIQUETA[tipo]}</p>
        {leido ? <p className="truncate text-xs text-muted-foreground">En el papel: «{leido}»</p> : null}
      </div>
      <p className="text-sm">
        {valor.id ? (
          <span className="font-medium text-foreground">{valor.etiqueta}</span>
        ) : (
          <span className="text-muted-foreground">Sin vincular</span>
        )}
        {valor.id ? (
          <button type="button" className="ml-2 text-xs font-semibold text-muted-foreground hover:underline" onClick={() => onElegir({ id: null, etiqueta: '' })}>
            Quitar
          </button>
        ) : null}
      </p>
      <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={`Buscar ${ETIQUETA[tipo].toLowerCase()} en RP-TECH`} className="h-10" />
      {sugerencias.length > 0 ? (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {sugerencias.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onElegir({ id: s.id, etiqueta: s.etiqueta })}
                className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="min-w-0 break-words">{s.etiqueta}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{Math.round(s.puntaje * 100)}%</span>
              </button>
            </li>
          ))}
        </ul>
      ) : texto.trim() ? (
        <p className="text-xs text-muted-foreground">Sin coincidencias.</p>
      ) : null}
    </div>
  );
}

export function VinculoHistorico({ reporte, onGuardado }: { reporte: HistoricoDetalle; onGuardado: () => void }) {
  const inicial = (id: string | null, etiqueta: string | null): Eleccion => ({ id, etiqueta: etiqueta ?? '' });
  const [cliente, setCliente] = useState(inicial(reporte.cliente_id, reporte.cliente_id ? reporte.cliente : null));
  const [equipo, setEquipo] = useState(inicial(reporte.equipo_id, reporte.equipo_id ? reporte.equipo : null));
  const [tecnico, setTecnico] = useState(inicial(reporte.tecnico_id, reporte.tecnico_id ? reporte.tecnico : null));
  const [sede, setSede] = useState(inicial(reporte.sede_id, reporte.sede));
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const guardar = async () => {
    setGuardando(true);
    setMensaje(null);
    const r = await vincular_historico(reporte.id, {
      cliente_id: cliente.id,
      equipo_id: equipo.id,
      tecnico_id: tecnico.id,
      sede_id: sede.id,
    });
    setGuardando(false);
    if (r.ok) {
      setMensaje({ tipo: 'ok', texto: 'Vínculo guardado.' });
      onGuardado();
    } else {
      setMensaje({ tipo: 'error', texto: r.error ?? 'No se pudo guardar el vínculo.' });
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Link2 className="size-4" />
        Vincular con RP-TECH
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Elige el registro que corresponde a lo escrito en el papel. Así el reporte aparece en el historial del cliente y del equipo.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <CampoVinculo tipo="cliente" leido={reporte.cliente_texto} valor={cliente} onElegir={setCliente} />
        <CampoVinculo tipo="equipo" leido={reporte.equipo_texto} valor={equipo} onElegir={setEquipo} />
        <CampoVinculo tipo="tecnico" leido={reporte.tecnico_texto} valor={tecnico} onElegir={setTecnico} />
        <CampoVinculo tipo="sede" leido={reporte.direccion_texto} valor={sede} onElegir={setSede} />
      </div>
      {mensaje ? (
        <p className={`mt-4 text-sm ${mensaje.tipo === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}>{mensaje.texto}</p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={guardar} disabled={guardando} className="min-h-11">
          {guardando ? 'Guardando…' : 'Guardar vínculo'}
        </Button>
      </div>
    </section>
  );
}
