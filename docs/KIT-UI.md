# KIT UI — RP-TECH

Kit Core del frontend: componentes y átomos reutilizables basados en los **tokens de diseño RP-TECH** (`globals.css`) con Tailwind CSS v4. No contiene lógica de negocio.

## Reglas Generales

1. **Uso Obligatorio de Componentes Globales:** En todo el sistema es obligatorio reutilizar los componentes globales canónicos (`DataTable`, `Modal`, `Toast`, `Tooltip`, `SearchInput`, `Button`). Solo se permite crear componentes locales cuando un requerimiento de interfaz sea **estrictamente exclusivo y especializado de un módulo** (decisión del desarrollador frontend).
2. **Tokens semánticos siempre:** Usar tokens CSS vía clases Tailwind (`bg-card`, `text-primary`, `border-border`, `text-muted-foreground`, etc.). Prohibido valores hexadecimales o RGB en duro (`#1da1f2`, `rgb(...)`) dentro de los componentes.
3. **Cero estilos en línea:** No usar `style={{ ... }}`. Usar utilidades Tailwind canónicas (`min-h-11`).
4. **Cero comentarios en código:** Los componentes del kit son autoexplicativos mediante TypeScript y nombres semánticos.
5. **Accesibilidad táctil:** Todo elemento interactivo debe cumplir el área táctil mínima de 44px (`min-h-11` o `h-11`).

---

## 1. Button — `components/ui/button`

Botón canónico con variantes, tamaños y compatibilidad con `asChild` para links.

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `variant` | `'default'` \| `'destructive'` \| `'outline'` \| `'secondary'` \| `'ghost'` \| `'link'` | `'default'` | Variante visual (`default` = azul primario corporativo). |
| `size` | `'default'` \| `'sm'` \| `'lg'` \| `'icon'` | `'default'` | Tamaño del botón (`default` = `h-9 px-4 py-2`). |
| `asChild` | `boolean` | `false` | Renderiza el componente hijo con las clases del botón (ej. `Link`). |
| resto | `ButtonHTMLAttributes<HTMLButtonElement>` | — | `type`, `disabled`, `onClick`, `className`, etc. |

### Ejemplo
```tsx
import { Button } from '@/components/ui';

<Button onClick={guardar}>Guardar</Button>
<Button variant="destructive" size="sm">Eliminar</Button>
```

---

## 2. DataTable — `components/ui/data-table`

Tabla de datos genérica responsiva con tipado estricto por entidad.

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `columnas` | `Columna<T>[]` | Requerido | Configuración de columnas (`clave`, `encabezado`, `render`, `className`). |
| `datos` | `T[]` | Requerido | Array de objetos a listar. |
| `claveFila` | `(fila: T) => string \| number` | Requerido | Función para extraer la key única de la fila. |
| `cargando` | `boolean` | `false` | Muestra estado de carga centralizado. |
| `textoVacio` | `string` | `'No se encontraron resultados.'` | Mensaje cuando no hay registros. |
| `onFilaClick` | `(fila: T) => void` | — | Callback al hacer click en una fila. |

### Ejemplo
```tsx
import { DataTable, Columna } from '@/components/ui';

const columnas: Columna<Caso>[] = [
  { clave: 'numero', encabezado: 'N° Caso' },
  { clave: 'razon_social', encabezado: 'Cliente' },
  { clave: 'estado', encabezado: 'Estado', render: (c) => <Badge>{c.estado}</Badge> },
];

<DataTable
  columnas={columnas}
  datos={casos}
  claveFila={(c) => c.id}
  onFilaClick={(c) => router.push(`/casos/${c.id}`)}
/>
```

---

## 3. Modal — `components/ui/modal`

Diálogo modal accesible montado en Portal con animación y cierre por Escape o clic exterior.

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `abierto` | `boolean` | Requerido | Estado de visibilidad. |
| `onCerrar` | `() => void` | Requerido | Callback para cerrar el modal. |
| `titulo` | `string` | — | Título del encabezado. |
| `descripcion` | `string` | — | Subtítulo descriptivo. |
| `tamano` | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | `'md'` | Ancho máximo del contenedor. |
| `children` | `ReactNode` | Requerido | Contenido del cuerpo del modal. |

### Ejemplo
```tsx
import { Modal, Button } from '@/components/ui';

<Modal abierto={abierto} onCerrar={() => setAbierto(false)} titulo="Detalle del Servicio">
  <p>Contenido del modal...</p>
  <div className="flex justify-end gap-2 mt-4">
    <Button onClick={() => setAbierto(false)}>Aceptar</Button>
  </div>
</Modal>
```

---

## 4. SearchInput — `components/ui/search-input`

Campo de búsqueda global con icono de lupa, botón de limpiar y altura táctil de 44px (`h-11`).

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `value` | `string` | — | Valor del input. |
| `onChange` | `(e) => void` | — | Callback de cambio. |
| `onClear` | `() => void` | — | Callback al presionar el botón de limpiar (icono X). |
| `placeholder` | `string` | `'Buscar...'` | Texto de ayuda. |

### Ejemplo
```tsx
import { SearchInput } from '@/components/ui';

<SearchInput
  value={filtro}
  onChange={(e) => setFiltro(e.target.value)}
  onClear={() => setFiltro('')}
  placeholder="Buscar por RUC o serie..."
/>
```

---

## 5. Tooltip — `components/ui/tooltip`

Tooltip flotante ligero con cálculo de coordenadas relativas sin dependencias externas pesadas.

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `contenido` | `string` | Requerido | Texto flotante a desplegar. |
| `posicion` | `'top'` \| `'bottom'` \| `'left'` \| `'right'` | `'top'` | Posición cardinal respecto al elemento. |
| `children` | `ReactNode` | Requerido | Elemento trigger que activa el tooltip al hover/focus. |

### Ejemplo
```tsx
import { Tooltip, Button } from '@/components/ui';

<Tooltip contenido="Exportar reporte en PDF" posicion="bottom">
  <Button variant="outline">Exportar</Button>
</Tooltip>
```

---

## 6. Card — `components/ui/card`

Contenedor canónico de información con elevación sutil y borde suave.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card className="shadow-sm">
  <CardHeader className="pb-3 border-b border-border/50">
    <CardTitle className="text-base font-semibold">Cliente</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4 pt-4">
    <p>Información del cliente...</p>
  </CardContent>
</Card>
```

---

## 7. Input y Textarea — `components/ui/input`, `components/ui/textarea`

Campos de entrada estándar con tokens semánticos de borde y foco.

---

## 8. Badge — `components/ui/badge`

Insignia o etiqueta de estado para identificación rápida.

---

## 9. Sonner Toaster — `components/ui/sonner`

Wrapper canónico de notificaciones toast para feedback inmediato al usuario.

```tsx
import { toast } from 'sonner';

toast.success('Caso registrado con éxito');
toast.error('Ocurrió un error al procesar la solicitud');
```
