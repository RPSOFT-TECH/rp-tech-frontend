export function FotosReporte() {
  return (
    <>
      <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fotos de Ingreso</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="border-2 border-dashed border-border hover:border-primary text-card-foreground rounded-lg py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 bg-muted/50 transition-colors min-h-11"
          >
            Tomar foto
          </button>
          <button
            type="button"
            className="border border-border hover:bg-muted text-card-foreground rounded-lg py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 bg-card transition-colors min-h-11"
          >
            Subir foto
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="h-20 bg-muted rounded-lg border border-border flex items-center justify-center text-xs text-muted-foreground">Miniatura 1</div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fotos de Salida</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="border-2 border-dashed border-border hover:border-primary text-card-foreground rounded-lg py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 bg-muted/50 transition-colors min-h-11"
          >
            Tomar foto
          </button>
          <button
            type="button"
            className="border border-border hover:bg-muted text-card-foreground rounded-lg py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 bg-card transition-colors min-h-11"
          >
            Subir foto
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="h-20 bg-muted rounded-lg border border-border flex items-center justify-center text-xs text-muted-foreground">Miniatura 1</div>
        </div>
      </div>
    </>
  );
}
