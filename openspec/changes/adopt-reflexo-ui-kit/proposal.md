## Why

RP-TECH ya separa las pantallas por módulo, pero el kit global es mínimo: tabla sin vacío ni skeleton, modal de portal, toast directo de Sonner y un sidebar armado a mano. Reflexo ya tiene el shell, los diálogos, el DataTable, los gráficos, el PDF y el manejo de error que este producto necesita. Se adopta ese kit en RP-TECH y se pinta con los tonos y la tipografía que ya existen.

## What Changes

- Entrada de las librerías del kit: recharts, framer-motion, next-themes, Radix, Ant Design, PrimeReact, date-fns, react-day-picker, xlsx, jspdf, html2canvas y @react-pdf/renderer.
- Sidebar colapsable, header con título de página, DataTable con vacío y skeleton, Dialog, ConfirmModal, LoadingActionModal, ToastProvider, tooltip, pickers, gráfico de barras y vista previa PDF.
- Cada módulo de la app (casos, agenda, administración, mis servicios y reporte) registra su título y usa el mismo shell.
- Páginas `error` y `not-found`.
- El primario sigue en `oklch(0.6723 0.1606 244.9955)` y la fuente sigue siendo Be Vietnam Pro.

## Non-goals

- No cambiar contratos de `Caso`, `Visita`, `Cliente`, reportes ni `datos-simulados`.
- No cambiar URLs públicas.
- No restaurar Supabase.
- No copiar pacientes, citas, historial clínico, GHL, pagos ni el video de bienvenida de Reflexo.
- No subir Zod a la versión 4 ni reemplazar la sesión simulada por axios.

## Capabilities

### New Capabilities

- `reflexo-ui-kit`: shell, componentes globales, gráficos, PDF y errores con los tokens de RP-TECH.

### Modified Capabilities

- `global-components-policy`: el DataTable, el modal, el toast y el tooltip pasan al contrato visual de Reflexo, conservando las props en español de tabla y modal.

## Impact

- `src/components/ui`, `src/components/layout`, `src/components/shell/AppShell.tsx`, `src/app/layout.tsx`, vistas de casos, agenda, administración y servicios.
- El bundle crece por Ant Design, PrimeReact, recharts y PDF.
