<h1 align="center">RP-TECH Frontend</h1>

<p align="center">
  Sistema de órdenes de servicio técnico.<br />
  Frontend modular por features, páginas delgadas y un kit visual propio sobre tokens OKLCH.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zod-3-3068B7?logo=zod&logoColor=white" alt="Zod" />
  <img src="https://img.shields.io/badge/OpenSpec-Driven-blueviolet" alt="OpenSpec" />
</p>

| Pieza | Qué se usa |
| --- | --- |
| Framework | Next.js 16.4 App Router, `cacheComponents` y `partialPrefetching` |
| UI | React 19 y TypeScript |
| Estilos | Tailwind CSS v4 y tokens de `src/app/globals.css` |
| Tipografía | Be Vietnam Pro (`next/font/google`, `--font-sans`) |
| Formularios | React Hook Form y Zod 3 |
| Avisos | Sonner |
| Iconos | lucide-react |
| Tablas y gráficos | `DataTable` propio y Recharts |
| PDF y Excel | `@react-pdf/renderer`, jsPDF, html2canvas y `xlsx` |

---

## Tabla de contenidos

1. [Arquitectura](#arquitectura)
2. [Mapa de carpetas](#mapa-de-carpetas)
3. [Agrupar por lógica](#agrupar-por-lógica)
4. [Componentes globales](#componentes-globales)
5. [Librerías](#librerías)
6. [Tokens y etiquetas de estado](#tokens-y-etiquetas-de-estado)
7. [Reglas de código](#reglas-de-código)
8. [Features](#features)
9. [OpenSpec](#openspec)
10. [Scripts](#scripts)

---

## Arquitectura

Las rutas no contienen la pantalla. Montan una vista del feature.

```
app/  →  features/<dominio>/views  →  components agrupados por lógica
                │
                ▼
         hooks, utils, types
                │
                ▼
         @/components/ui  y  @/lib
```

| Capa | Ruta | Hace | No hace |
| --- | --- | --- | --- |
| Página | `src/app/**/page.tsx` | Importa la vista del barrel y la monta | Estado, formularios, JSX de pantalla |
| Vista | `src/features/<dominio>/views` | Compone la pantalla y sus hooks | Importar archivos privados de otro feature |
| Componentes | `src/features/<dominio>/components/<grupo>` | UI de esa lógica | Llamar datos que pertenecen a otro dominio |
| Hooks | `src/features/<dominio>/hooks` | Estado y acciones, sin JSX | Pintar interfaz |
| UI | `src/components/ui` | Primitivas compartidas | Importar `features/` o `app/` |
| Shell | `src/components/shell` y `src/components/layout` | Sidebar, header y sesión | Formularios de un caso |
| Lib | `src/lib` | Datos simulados, permisos, Zod, PDF | Componentes visuales |

Flujo permitido: `app` → `features` → `components/ui` y `lib`. Un feature importa otro solo por `@/features/<dominio>`.

`src/app/(app)/layout.tsx` solo devuelve `<AppShell>{children}</AppShell>`. `AppShell` siempre pinta `{children}`. Si no hay sesión, usa un main mínimo y redirige a `/login` en el cliente.

`usePathname` y `useSearchParams` en un Client Component bloquean el prerender si quedan fuera de `<Suspense>`. El aviso de Sonner (`ConsumirAvisos`) vive en su propio `Suspense` dentro de `Providers`. Ese límite no envuelve la página. No uses `fallback={null}` alrededor de `{children}` ni `export const instant = false` para tapar ese hook.

---

## Mapa de carpetas

```
src/
├── app/
│   ├── (app)/
│   │   ├── layout.tsx                 # AppShell
│   │   ├── administracion/page.tsx
│   │   ├── agenda/page.tsx
│   │   ├── casos/page.tsx
│   │   ├── casos/nuevo/page.tsx
│   │   ├── casos/[id]/page.tsx
│   │   └── mis-servicios/
│   │       ├── page.tsx
│   │       └── [id]/reporte/page.tsx
│   ├── login/page.tsx
│   ├── sin-acceso/page.tsx
│   ├── layout.tsx                     # Be Vietnam Pro y Providers
│   └── globals.css                    # Única fuente de color
├── features/
│   ├── auth/components + views
│   ├── agenda/components + utils + views
│   ├── casos/components/{lista,detalle,nuevo} + hooks + views
│   ├── administracion/components/{comun,clientes,usuarios,sistema} + views
│   ├── servicios/components/reporte + hooks + views
│   └── errores/views
├── components/
│   ├── ui/                            # Kit global
│   ├── layout/header y layout/sidebar
│   ├── shell/AppShell.tsx
│   ├── pdf/VistaPreviaPdf.tsx
│   ├── avisos-sonner.tsx
│   └── providers.tsx
└── lib/
    ├── datos-simulados/               # acciones/, semilla/, store, fecha
    ├── permisos/
    ├── validaciones/
    └── pdf/
```

Datos simulados, sesión y permisos siguen en `src/lib/datos-simulados` y `src/lib/permisos`. No se mueven a un feature.

---

## Agrupar por lógica

Dentro de `components/` los archivos van en una carpeta que nombra la pantalla o el subdominio. Nada queda suelto en la raíz si hay varios archivos de la misma lógica.

| Feature | Carpeta | Qué agrupa |
| --- | --- | --- |
| casos | `components/lista` | Filtros y resultado del listado |
| casos | `components/detalle` | Ficha, visitas y formularios de estado |
| casos | `components/nuevo` | Bloques del alta |
| casos | `components/nuevo/altas` | Modales de cliente, sede, contacto y equipo |
| casos | `components/EstadoCaso.tsx` | Etiqueta compartida por lista y detalle. Se queda en la raíz porque no pertenece a un solo grupo |
| administracion | `comun`, `clientes`, `usuarios`, `sistema` | Utilidad compartida, ficha de cliente, usuarios y parámetros |
| servicios | `components/reporte` | Pasos del informe, firmas, fotos y repuestos |
| agenda | `components` y `utils` | Grilla del mes y panel del día |
| auth | `components` | Pocos archivos de login. No hace falta partirlos |

Cada feature publica su API en `index.ts`. La página importa ese barrel.

```tsx
import { ListaCasosView } from '@/features/casos';

export default function ListaCasosPage() {
  return <ListaCasosView />;
}
```

---

## Componentes globales

La UI repetida sale de `@/components/ui`. No se reescribe en el feature.

| Necesidad | Componente | Import |
| --- | --- | --- |
| Acción | `Button` | `@/components/ui` |
| Listado | `DataTable` | `@/components/ui` |
| Diálogo y confirmación | `Modal`, `ConfirmModal` | `@/components/ui/modal`, `@/components/ui/ConfirmModal` |
| Aviso | Sonner | `guardarAviso` de `@/components/avisos-sonner` y `SonnerToaster` |
| Ayuda flotante | `Tooltip` | `@/components/ui` |
| Búsqueda | `SearchInput` | `@/components/ui` |
| Select de formulario | `CustomSelect` | `@/components/ui` |
| Fecha | `SelectorFecha` | `@/components/ui` |
| KPI reutilizable | `MetricCard` | `@/components/ui` |
| Barras | `GraficoBarras` | `@/components/ui/charts/GraficoBarras` |
| Estado de caso | `EstadoBadge` | `@/features/casos` vía `etiquetaEstado` / `EstadoCaso` |
| Tarjeta, campo, aviso fijo | `Card`, `Input`, `Textarea`, `Badge`, `Alert` | `@/components/ui` |
| PDF | `VistaPreviaPdf` | `@/components/pdf/VistaPreviaPdf` |

`DataTable` pagina de 10 en 10. Si la tabla lleva `className="h-full"`, mide el alto con `useAjustePagina` y no baja de esa tarjeta cuando hay 0 o 1 fila. Las tablas que no llenan el alto reservan el cuerpo de 10 filas y no se miden.

La búsqueda de casos escribe al teclear. No lleva botón Buscar.

`MetricCard` existe para KPIs. El listado de casos no lo muestra.

Un componente local solo se crea cuando la interacción es de ese dominio y no sirve en otro: firmas, pasos del reporte, bloques del alta, celda del calendario. Aunque sea local, usa `Button`, `Modal`, `Card` y los tokens.

---

## Librerías

| Librería | Uso |
| --- | --- |
| `next` 16.4 y `react` 19.3 | App Router y UI |
| `tailwindcss` 4 | Utilidades sobre los tokens |
| `shadcn`, Radix y `@base-ui/react` | Primitivas. `Button` sale de Base UI |
| `class-variance-authority` y `cn` | Variantes y fusión de clases |
| `lucide-react` | Iconos |
| `sonner` y `next-themes` | Avisos y tema claro/oscuro |
| `react-hook-form` y `zod` ^3.25 | Formularios. Zod se queda en la versión 3 |
| `recharts` | `GraficoBarras` |
| `framer-motion` | Filas de la tabla |
| `date-fns`, `dayjs`, `react-day-picker` | Fechas del kit |
| `@react-pdf/renderer`, `jspdf`, `html2canvas` | PDF |
| `xlsx` | Exportación Excel del listado |
| `primereact` 10.9.7 y `antd` | Dependencias ya instaladas del kit. La pantalla nueva no copia su tema |

No se agregan Poppins, un verde de PrimeReact ni variables `--success`, `--warning`, `--danger` o `--info`. Esos papeles los cubren `primary`, `destructive` y `chart-1` … `chart-5`.

---

## Tokens y etiquetas de estado

Los colores viven en `src/app/globals.css`. En componentes se usan las utilidades (`bg-primary`, `text-chart-2`, `border-destructive/40`), nunca un hex, un `rgb` ni un número OKLCH.

| Token | Papel |
| --- | --- |
| `--primary` / `--chart-1` | Azul RP-TECH |
| `--chart-2` y `--chart-4` | Verdes |
| `--chart-3` | Dorado. Es claro: el texto del badge va en `text-foreground` |
| `--chart-5` | Rojo cálido |
| `--destructive` | Rojo de anulación y error |
| `--secondary` | Superficie oscura o gris. No se usa en etiquetas de estado |

| Estado | Clases |
| --- | --- |
| Por programar | `border-chart-3/50 bg-chart-3/20 text-foreground` |
| Programado | `border-primary/40 bg-primary/15 text-primary` |
| En atención y Cerrado | `border-chart-2/40 bg-chart-2/15 text-chart-2` |
| Atendido | `border-chart-4/40 bg-chart-4/15 text-chart-4` |
| En espera | `border-chart-5/40 bg-chart-5/15 text-chart-5` |
| Anulado | `border-destructive/40 bg-destructive/15 text-destructive` |

Tipografía: Be Vietnam Pro. Números de caso y horas usan `font-mono`.

---

## Reglas de código

1. **Tope de 300 líneas.** Ningún `.ts` o `.tsx` nuevo pasa de 300 líneas. No es un mínimo de tamaño: es el máximo. Al acercarse, se parte en una carpeta de la misma lógica. Hoy se pasan y no se parten solo para cuadrar el número: `src/components/ui/sidebar.tsx` (primitiva shadcn), `src/lib/datos-simulados/acciones/reportes.ts`, `src/lib/datos-simulados/acciones/vistas.ts` y `src/features/servicios/hooks/useAccionesReporte.ts`. Esos archivos no crecen; el siguiente cambio los divide.
2. **Cero comentarios en `src/`.** Sin cabeceras, sin comentarios JSX y sin banners. La explicación vive en `docs/` y `openspec/`.
3. **Sin colores en duro.** Tampoco clases de paleta Tailwind (`text-red-900`, `bg-blue-50`).
4. **`style` solo para una medida calculada en runtime**, como el alto de fila de la tabla. El color no va en `style`.
5. **Área táctil:** `min-h-11` donde el control se usa con el dedo.
6. **Código muerto:** se borra en el mismo cambio. Los alias que ya nadie importa también.
7. **Verificación:** `npx eslint --max-warnings 0` sobre lo tocado y `npx tsc --noEmit`.

La lógica de negocio, la sesión, las URLs y los datos simulados no se reescriben para acomodar una carpeta.

---

## Features

| Feature | Rutas | Vista pública |
| --- | --- | --- |
| auth | `/login`, `/sin-acceso` | `LoginView`, `SinAccesoView` |
| casos | `/casos`, `/casos/nuevo`, `/casos/[id]` | `ListaCasosView`, `NuevoCasoView`, `DetalleCasoView` |
| servicios | `/mis-servicios`, `/mis-servicios/[id]/reporte` | `MisServiciosView`, `ReporteServicioView` |
| agenda | `/agenda` | `AgendaView` |
| administracion | `/administracion` | `AdministracionView` |
| errores | error y no encontrado | `ErrorSistemaView`, `NoEncontradoView` |

Casos no muestra tarjetas KPI ni chips de bandeja. Nuevo caso y Excel van en la misma fila que el buscador. La query `bandeja` sigue filtrando si llega en la URL.

Agenda es un mes de lunes a domingo más el panel del día. Las visitas salen de `tecnicos()` y `agenda_tecnico`. La fecha viaja en `?fecha=`.

Multiempresa: las consultas filtran por `empresa_id`. Solo `superadmin` cruza empresas. Un rol vale entre `desde` y `hasta`. Sin rol vigente, la entrada va a `/sin-acceso`.

Modo de servicio sugerido: menos de 12 meses desde la instalación es garantía del equipo; con más de 12 meses y contrato vigente es garantía de soporte; si no, facturado. Otro modo exige motivo.

---

## OpenSpec

Las reglas formales están en `openspec/specs/`:

- `frontend-architecture`
- `feature-module-contract`
- `global-components-policy`
- `code-standards`
- `design-system`

Un cambio de estructura se propone en `openspec/changes/<nombre>/` y, al cerrarse, se archiva. La guía corta está en `openspec/README.md`.

---

## Scripts

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

Más detalle operativo: [reglas de arquitectura](docs/REGLAS-ARQUITECTURA.md), [componentes globales](docs/REGLAS-COMPONENTES-GLOBALES.md), [kit UI](docs/KIT-UI.md) y [responsive](docs/REGLAS-RESPONSIVE.md).
