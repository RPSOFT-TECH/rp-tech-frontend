# Guía de Rediseño: Tablas y Paginación Estándar SOFI-WEB

Esta guía técnica está dirigida al equipo frontend (especialmente para la implementación y actualización de tablas y paginación a cargo de Luis) para estandarizar la interfaz de usuario de acuerdo a los patrones de diseño de **SOFI-WEB**, respetando las reglas de arquitectura y calidad de código de **RP-TECH**.

---

## 1. Contexto y Objetivo

El diseño actual de las tablas y controles de paginación debe evolucionar para alinearse visual y funcionalmente con las pantallas de referencia de **SOFI-WEB** (módulos de *Practicantes* y *Clasificación*):

1. **Toolbar superior unificado:** Botón de acción principal redondeado (`+ Nuevo Caso` / `+ Acción`), buscador integrado con icono y esquinas suaves, y selectores limpios.
2. **Diseño de celdas y filas enriquecidas:** Celdas de identidad con iniciales en monograma, badges de estado con indicador visual (*dot*), y columna de navegación lateral derecha con icono Chevron (`>`) interactivo.
3. **Paginación estándar en pie de tabla:** Barra inferior integrada que indica el rango de registros visibles y controles de navegación previa/siguiente.
4. **Cumplimiento estricto de las reglas globales:** 0 comentarios en el código, tokens semánticos OKLCH (sin colores fijos), componentes globales reutilizables y límite de 350 líneas por archivo.

---

## 2. Anatomía Visual de la Tabla (Basada en las Referencias)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [ + Crear Caso ]    [ 🔍 Buscar por cliente, serie o tipo...                        ] │  <- Toolbar
├────────────────────────────────────────────────────────────────────────────────────────┤
│ CASO         CLIENTE               SERIE        TIPO         ESTADO                 >  │  <- Encabezados
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [DR] CAS-001  Danilo De La Cruz     SN-84920     Mantenimiento [● ACTIVO]           >  │  <- Filas con hover
│ [AJ] CAS-002  Angel Villalobos      SN-10293     Garantía      [● PENDIENTE]        >  │
│ [SD] CAS-003  Sophia Guevara        SN-55491     Reparación    [● CERRADO]          >  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Mostrando 1 - 9 de 47                               < Anterior   Página 1 de 6   Siguiente > │ <- Footer
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### A. Encabezados de Columna
- Tipografía en mayúsculas compactas: `text-[11px]` o `text-[12px]`, `font-bold` o `font-black`, `tracking-[0.12em]`.
- Colores: `text-muted-foreground` sobre fondo sutil `bg-muted/50` o `bg-stone-100/95 dark:bg-stone-900/95`.
- Borde inferior sutil con `border-b border-border`.

### B. Celdas de Identidad (Avatar Monograma)
- Contenedor con las iniciales de 2 letras del cliente o técnico (ej: `DR`, `AJ`).
- Dimensiones: `size-7` o `size-8`, esquinas redondeadas suaves (`rounded-lg` o `rounded-md`), fondo neutro suave (`bg-muted text-muted-foreground text-xs font-bold`).
- Alineado horizontalmente junto al nombre o número identificador en `font-semibold text-foreground`.

### C. Badges de Estado con Indicador (*Dot*)
- Formato píldora redondeada (`rounded-full px-2.5 py-1 text-xs font-semibold`).
- Indicador luminoso: un pequeño círculo `size-1.5 rounded-full inline-block mr-1.5` antes del texto.
- Variantes semánticas con tokens:
  - Activo / Resuelto: `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`
  - Pendiente / En Proceso: `bg-amber-500/10 text-amber-600 dark:text-amber-400`
  - Cancelado / Crítico: `bg-destructive/10 text-destructive`

### D. Columna Lateral de Acción (`>` Chevron de Navegación)
> **Elemento destacado:** Como se observa en la referencia (resaltado con el círculo amarillo), el extremo derecho de cada fila debe incluir un icono de navegación que confirme que la fila es interactiva.
- Icono: `ChevronRight` de `lucide-react` (`size-4`).
- Estilo: `text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary`.
- Toda la fila debe poseer cursor pointer (`cursor-pointer`) y cambio de color al pasar el cursor (`hover:bg-muted/40` o `hover:bg-primary/5`).

---

## 3. Especificación del Pie de Paginación

La paginación debe ubicarse dentro del contenedor de la tabla en un pie de página dedicado (`border-t border-border/50 bg-card px-6 py-3.5`).

### Estructura en 2 Bloques:
1. **Lado Izquierdo (Información de registros):**
   - Texto: `Mostrando {from} - {to} de {totalItems}`
   - Formato: Texto en `text-xs text-muted-foreground`, con los números resaltados en `<strong className="font-bold text-foreground">`.
2. **Lado Derecho (Controles interactivos):**
   - **Botón Anterior:**
     - Clases: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all`
     - Icono: `<ChevronLeft className="size-4" /> Anterior`
     - Deshabilitado cuando `currentPage <= 1`.
   - **Indicador Central:**
     - Texto: `Página <strong className="text-primary font-bold">{currentPage}</strong> de {totalPages}`
     - Clases: `text-xs text-muted-foreground whitespace-nowrap mx-1`
   - **Botón Siguiente:**
     - Clases idénticas al botón anterior.
     - Icono: `Siguiente <ChevronRight className="size-4" />`
     - Deshabilitado cuando `currentPage >= totalPages`.

---

## 4. Reglas Globales Obligatorias que Luis Debe Respetar

Para mantener la certificación de calidad del proyecto, cualquier código enviado en ramas o PRs debe cumplir sin excepción con lo siguiente:

### 1. Cero Comentarios en el Código
- **Prohibido** incluir `//`, `/* */` o `{/* */}` en archivos `.ts` y `.tsx` dentro de `src/`.
- La documentación vive exclusivamente en archivos `.md` dentro de `docs/`. El código debe ser autoexplicativo por su tipado y nomenclatura.

### 2. Uso Obligatorio de Componentes Globales Canónicos
- Las tablas deben consumir el componente unificado `DataTable` ubicado en `@/components/ui/data-table` (o extenderlo si faltan props como paginación).
- Los botones deben usar `Button` de `@/components/ui/button`.
- El buscador debe usar `SearchInput` de `@/components/ui/search-input`.

### 3. Cero Estilos Hardcodeados ni Colores Fijos
- **Prohibido** usar colores hexadecimales (`#fff`, `#000`, etc.) o clases arbitrarias como `bg-[#22c55e]`.
- Usar únicamente tokens semánticos OKLCH del sistema:
  - Fondos: `bg-card`, `bg-background`, `bg-muted`
  - Textos: `text-foreground`, `text-muted-foreground`, `text-primary`
  - Bordes: `border-border`
- No usar `style={{ ... }}` salvo para propiedades estrictamente dinámicas de cálculo numérico (ej. porcentajes calculados en tiempo de ejecución). Clases de altura mínima como `min-h-11` deben ser clases de Tailwind.

### 4. Límite de 350 Líneas por Archivo
- Ningún archivo puede superar las 350 líneas de código.
- Si una vista o tabla crece, debe dividirse en componentes cohesivos dentro de su carpeta de feature (ej. `casosTableColumns.tsx`, `CasosTable.tsx`).

---

## 5. Implementación de Referencia Sugerida

### Ejemplo de componente `PaginationBar`:
```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-border/50 bg-card">
      <div className="text-xs text-muted-foreground">
        Mostrando <strong className="font-bold text-foreground">{from}</strong> -{' '}
        <strong className="font-bold text-foreground">{to}</strong> de{' '}
        <strong className="font-bold text-foreground">{totalItems}</strong>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </button>

        <span className="text-xs text-muted-foreground px-2">
          Página <strong className="font-bold text-primary">{currentPage}</strong> de {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Siguiente
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
```

### Ejemplo de Columna de Navegación con Chevron (`>`):
```tsx
{
  clave: 'navegacion',
  encabezado: '',
  className: 'w-10 text-right pr-4',
  render: () => (
    <ChevronRight className="size-4 inline text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
  ),
}
```
