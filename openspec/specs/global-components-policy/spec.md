# Especificación: Política global de componentes

Estado: Vigente
Aplica a: `src/features/` y `src/app/`

---

## 1. Kit obligatorio

La interacción repetida usa el kit de `@/components/ui` y los compañeros de `src/components/`. No se vuelve a construir en el feature.

| Necesidad | Se usa | No se usa |
| --- | --- | --- |
| Botón | `Button` | `<button>` con clases sueltas para una acción estándar |
| Tabla | `DataTable` de `@/components/ui` | `<table>` propio para un listado administrativo |
| Diálogo | `Modal` o `ConfirmModal` | Un `div` fijo con overlay |
| Aviso breve | `guardarAviso` y Sonner | `alert()`, un banner inventado o `ToastItem` |
| Ayuda | `Tooltip` | `title` como sustituto del tooltip del kit |
| Texto de búsqueda | `SearchInput` | Un input con botón Buscar |
| Select de formulario | `CustomSelect` | Un `<select>` nativo con otro dibujo |
| Fecha | `SelectorFecha` | Un input de fecha con otro calendario |
| KPI | `MetricCard` | Una tarjeta de métrica copiada. El listado de casos no muestra KPIs |
| Gráfico de barras | `GraficoBarras` | Otro wrapper de Recharts para el mismo gráfico |
| Estado de caso | `EstadoBadge` | Un `Badge` gris (`secondary`, `ghost`, `outline` solo) |
| PDF | `VistaPreviaPdf` | Una vista previa paralela |

La paginación de `DataTable` es de 10 filas. Con `className="h-full"` la tabla mide el alto disponible y conserva el marco cuando hay 0 o 1 fila. Sin `h-full` reserva el cuerpo de 10 filas y no se mide.

Los filtros de columna van en el encabezado de la tabla.

### Scenario: aviso de sesión

- **WHEN** el usuario entra o cierra sesión
- **THEN** el aviso es un toast de Sonner
- **AND** el de salida se guarda con `guardarAviso` antes de la navegación completa a `/login?salida=1`

### Scenario: listado
- **WHEN** una pantalla muestra un listado tabular de casos, usuarios, permisos o clientes
- **THEN** usa `DataTable`

---

## 2. Cuándo sí hay un componente local

Un archivo en `src/features/<dominio>/components/` se justifica cuando la interacción es de ese dominio y no se repite en otro:

- Bloques del alta de caso y sus modales de alta.
- Ficha, visitas y formularios de estado.
- Pasos del reporte, firmas, fotos y repuestos.
- Celdas y panel del calendario de agenda.
- Editores de la ficha de cliente.

Ese archivo igual consume `Button`, `Card`, `Modal` y los tokens. No copia el kit.

### Scenario: firma de campo
- **WHEN** el reporte necesita un lienzo de firma
- **THEN** el lienzo vive en `features/servicios/components/reporte`
- **AND** los botones de esa pantalla siguen siendo `Button`

---

## 3. Importación

```tsx
import { Button, DataTable, Modal, SearchInput, CustomSelect, SelectorFecha, MetricCard } from '@/components/ui';
import { guardarAviso } from '@/components/avisos-sonner';
import { GraficoBarras } from '@/components/ui/charts/GraficoBarras';
```

`@/components/ui` resuelve `data-table.tsx`, no la carpeta `data-table/`. La tabla en inglés queda detrás de ese adaptador.
