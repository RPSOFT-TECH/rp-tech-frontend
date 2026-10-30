# Política Global de Componentes Compartidos — RP-TECH

Este documento establece la **regla obligatoria de uso de componentes globales** en todo el frontend de RP-TECH.

---

## 1. Regla Global Obligatoria

En cualquier vista, página o módulo de la aplicación donde se requiera interacción visual estándar, **es obligatorio reutilizar los componentes globales canónicos** provistos en `src/components/ui/`:

1. **`DataTable` (`components/ui/data-table`):** Toda tabla de listado administrativo, casos, órdenes o reportes debe implementar `DataTable` en lugar de etiquetas `<table>` personalizadas dispersas.
2. **`Modal` (`components/ui/modal`):** Todo diálogo emergente, confirmación de acción, modal de detalle o formulario flotante debe implementar el componente global `Modal`.
3. **`Toast` (`components/ui/sonner`):** Toda retroalimentación de éxito, error o advertencia debe emitirse a través del servicio canónico `toast` de Sonner.
4. **`Tooltip` (`components/ui/tooltip`):** Toda aclaración contextual, descripción de botón o ayuda flotante debe usar el componente global `Tooltip`.
5. **`SearchInput` / Buscadores (`components/ui/search-input`):** Toda barra de búsqueda o campo de filtrado por texto debe emplear `SearchInput` para garantizar uniformidad con icono integrado, botón de limpieza y área táctil de 44px (`h-11`).
6. **`Button` (`components/ui/button`):** Todo botón interactivo debe consumir `Button` con sus variantes canónicas (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`).

---

## 2. Política de Excepción de Frontend

> [!IMPORTANT]
> **Criterio de Decisión del Frontend:**
> Se permite **no utilizar** un componente global y construir uno local **únicamente cuando el componente sea exclusivo, especializado o intrínseco a la lógica visual de un módulo o página específica**.

### ¿Cuándo SÍ se permite un componente local en `features/<dominio>/components/`?
- **Casos de interfaz especializados:**
  - Lienzos táctiles de firma digital (ej. `FirmasDigitales` en `features/servicios`).
  - Asistentes de selección dinámica con cálculo de garantías en vivo (ej. `BloqueEquipo` en `features/casos`).
  - Editores de checklists de inspección técnica multi-paso.
  - Componentes de carga de evidencia fotográfica con previsualizaciones locales.

### ¿Cuándo está ESTRICTAMENTE PROHIBIDO duplicar?
- Crear una tabla HTML desde cero en un módulo cuando `DataTable` cubre los requisitos de visualización.
- Crear un modal con `div` fijos y clases arbitrarias en lugar de `<Modal />`.
- Crear botones con etiquetas `<button className="...">` sin variante cuando `<Button />` ya estandariza la interacción.
- Implementar notificaciones flotantes con `alert()` o banners custom en lugar de `toast`.

---

## 3. Catálogo de Importación Canónica

Todos los componentes globales están exportados centralizadamente desde `@/components/ui`:

```tsx
import { 
  Button, 
  Modal, 
  Tooltip, 
  SearchInput, 
  DataTable, 
  Card, 
  Badge 
} from '@/components/ui';
import { toast } from 'sonner';
```

---

## 4. Ejemplos de Implementación

### A. Buscador Global (`SearchInput`)
```tsx
import { SearchInput } from '@/components/ui';

<SearchInput
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  onClear={() => setBusqueda('')}
  placeholder="Buscar por cliente, RUC o número de caso..."
/>
```

### B. Modal Canónico (`Modal`)
```tsx
import { useState } from 'react';
import { Modal, Button } from '@/components/ui';

export function ConfirmacionCierreModal({ abierto, onCerrar, onConfirmar }) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Confirmar Cierre de Caso"
      descripcion="¿Estás seguro de cerrar la orden de servicio técnico?"
      tamano="md"
    >
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
        <Button variant="destructive" onClick={onConfirmar}>Confirmar Cierre</Button>
      </div>
    </Modal>
  );
}
```

### C. Tooltip Informativo (`Tooltip`)
```tsx
import { Tooltip, Button } from '@/components/ui';
import { Info } from 'lucide-react';

<Tooltip contenido="Garantía de fábrica vigente hasta dic 2026">
  <Button variant="ghost" size="icon">
    <Info className="w-4 h-4 text-primary" />
  </Button>
</Tooltip>
```

### D. Tabla de Datos Global (`DataTable`)
```tsx
import { DataTable, Columna } from '@/components/ui';
import { Caso } from '@/lib/datos-simulados/casos';

const columnas: Columna<Caso>[] = [
  { clave: 'numero', encabezado: 'N° Caso' },
  { clave: 'incidencia', encabezado: 'Incidencia' },
  { clave: 'estado', encabezado: 'Estado', render: (c) => <Badge>{c.estado}</Badge> },
];

<DataTable
  columnas={columnas}
  datos={casos}
  claveFila={(c) => c.id}
  onFilaClick={(c) => router.push(`/casos/${c.id}`)}
/>
```
