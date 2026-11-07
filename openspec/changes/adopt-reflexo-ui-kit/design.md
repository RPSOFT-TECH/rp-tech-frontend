## Context

RP-TECH conserva la sesión simulada, `menuDeRoles` y los contratos de casos y reportes. El kit visual de Reflexo se copia a `src/components/ui` y `src/components/layout`, y se recolorea con los tokens OKLCH y Be Vietnam Pro que ya están en `globals.css`.

## Goals / Non-Goals

**Goals:**

- Mismo shell en todos los módulos: `SidebarProvider`, sidebar por permisos, header con título y área de contenido.
- DataTable, Dialog, ConfirmModal, toast con `useToast`, tooltip, pickers, gráfico y PDF de vista previa.
- `error.tsx` y `not-found.tsx`.
- `AppShell` sigue pintando `{children}` cuando la sesión de servidor es nula.

**Non-Goals:**

- Dominios clínicos de Reflexo, axios, Zod 4, Supabase y cambio de URLs.

## Decisions

1. El menú sale de `menuDeRoles` y de `SesionUsuario`. No se llama al perfil de Reflexo.
2. `DataTable` y `Modal` conservan las props en español. Por dentro usan el vacío, el skeleton y Radix Dialog.
3. `toast()` de `sonner` sigue válido. `ToastProvider` agrega `useToast`.
4. PrimeReact queda en 10.9.7 y `react-day-picker` en 9.14, que es lo que usan los componentes copiados. El tema verde no se importa.
5. El título de página vive en un store externo para no hacer `setState` dentro de `useEffect`.
6. El PDF del reporte técnico usa `jspdf` y `html2canvas` sobre los campos que el reporte ya tiene en memoria.

## Risks / Trade-offs

- Ant Design, PrimeReact y recharts aumentan el bundle.
- El CSS propio del rango de fechas puede pisar estilos si se importa `lara-light-green`. No se importa.
- `src/components/ui/sidebar.tsx` supera 350 líneas porque es el primitivo de shadcn. Partirlo a mano rompe el contrato de exports.

## Migration Plan

1. Librerías.
2. Primitivos y shell.
3. Título, tabla, Excel, gráfico y PDF en cada módulo.
4. `npx tsc --noEmit` y recorrido en el puerto 3002.

## Open Questions

- Ninguna. El color y la tipografía de RP-TECH no se reemplazan.
