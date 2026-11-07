# Especificación: Estándares obligatorios de código

Estado: Vigente
Aplica a: `src/**/*.ts`, `src/**/*.tsx` y `src/**/*.css`

---

## 1. Cero comentarios en el código

El código en `src/` no lleva comentarios:

- Sin cabecera de archivo.
- Sin comentarios de función, hook o componente.
- Sin comentarios JSX (`{/* ... */}`).
- Sin banners ni separadores decorativos.

La documentación vive en `docs/` y `openspec/`. El código se explica con nombres y tipos.

---

## 2. Tope de 300 líneas

Ningún archivo `.ts` o `.tsx` nuevo supera las 300 líneas. El límite es un máximo, no un tamaño mínimo.

- Al acercarse a 300 líneas, el archivo se parte.
- La parte nueva entra en una carpeta de la misma lógica, no como otro archivo suelto al lado de una pila.
- Un grupo con pocos archivos puede quedarse plano. Ejemplo: `features/auth/components`.
- Un archivo compartido por varios grupos puede quedarse en la raíz de `components/`. Ejemplo: `EstadoCaso.tsx`.

Archivos que hoy superan el tope y no se parten solo para cuadrar el número:

- `src/components/ui/sidebar.tsx` (primitiva shadcn).
- `src/lib/datos-simulados/acciones/reportes.ts`.
- `src/lib/datos-simulados/acciones/vistas.ts`.
- `src/features/servicios/hooks/useAccionesReporte.ts`.

Esos archivos no crecen. El cambio que los toque los divide si la división cabe sin romper la primitiva o el contrato de datos.

### Scenario: un formulario de alta pasa de 300 líneas

- **WHEN** un bloque de `features/casos/components/nuevo` se acerca a 300 líneas
- **THEN** se extrae a otro archivo dentro de `nuevo/` o de `nuevo/altas/`
- **AND** la página `src/app/(app)/casos/nuevo/page.tsx` sigue siendo un montaje delgado

---

## 3. Color solo por tokens

Los colores salen de `src/app/globals.css`:

- Utilidades: `bg-card`, `bg-background`, `bg-muted`, `bg-primary/15`, `text-primary`, `text-chart-2`, `text-foreground`, `text-muted-foreground`, `border-border`, `border-destructive/40`.
- Prohibido escribir hex, `rgb`, `hsl` u OKLCH en un componente.
- Prohibido usar la paleta fija de Tailwind (`text-red-900`, `bg-blue-50`, `text-amber-900`).
- `--secondary` no se usa como color de una etiqueta de estado.
- `style` solo expresa una medida calculada en runtime, como el alto de fila de `DataTable`. El color no va en `style`.
- El control táctil usa `min-h-11`.

### Scenario: etiqueta de estado

- **WHEN** se pinta el estado de un caso
- **THEN** se usa `EstadoBadge`
- **AND** sus clases son las de `chart-2`, `chart-3`, `chart-4`, `chart-5`, `primary` o `destructive` definidas en la spec `design-system`

---

## 4. Código muerto

Todo archivo, import o export sin uso se elimina en el mismo cambio. No se dejan alias de una ruta vieja después de mover el archivo.

`npx eslint --max-warnings 0` sobre los archivos tocados y `npx tsc --noEmit` cierran el cambio.
