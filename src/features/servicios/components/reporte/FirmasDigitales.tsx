interface FirmasDigitalesProps {
  nombreOperador: string;
  setNombreOperador: (val: string) => void;
  nombreCliente: string;
  setNombreCliente: (val: string) => void;
  textoConformidad?: string;
}

export function FirmasDigitales({
  nombreOperador,
  setNombreOperador,
  nombreCliente,
  setNombreCliente,
  textoConformidad,
}: FirmasDigitalesProps) {
  return (
    <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Firmas Digitales
      </h3>
      {textoConformidad ? (
        <p className="text-sm text-card-foreground bg-muted/40 rounded-lg p-3">{textoConformidad}</p>
      ) : null}

      <div className="space-y-2 border-b border-border pb-4">
        <label className="block text-xs font-medium text-card-foreground">Firma del Operador</label>
        <input
          type="text"
          placeholder="Nombre completo del operador"
          value={nombreOperador}
          onChange={(e) => setNombreOperador(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground min-h-11"
        />
        <div className="border-2 border-dashed border-border rounded-lg h-32 bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
          [ Recuadro para firmar con el dedo ]
        </div>
        <button
          type="button"
          className="text-xs text-destructive hover:underline font-medium py-1 min-h-11 inline-flex items-center"
        >
          Borrar firma
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-card-foreground">Firma del Cliente</label>
        <input
          type="text"
          placeholder="Nombre completo del cliente / responsable"
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground min-h-11"
        />
        <div className="border-2 border-dashed border-border rounded-lg h-32 bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
          [ Recuadro para firmar con el dedo ]
        </div>
        <button
          type="button"
          className="text-xs text-destructive hover:underline font-medium py-1 min-h-11 inline-flex items-center"
        >
          Borrar firma
        </button>
      </div>
    </div>
  );
}
