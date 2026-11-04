<h1 align="center">RP-TECH Frontend</h1>

<p align="center">
  Sistema integral de gestión de órdenes de servicio técnico, incidencias y reportes para maquinaria industrial de impresión textil.<br />
  Arquitectura modular escalable basada en <strong>Features</strong> inspirada en <code>SOFI-WEB</code>, con estricto tipado TypeScript y sistema de diseño en tokens OKLCH.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zod-3-3068B7?logo=zod&logoColor=white" alt="Zod" />
  <img src="https://img.shields.io/badge/Turbopack-Enabled-000000?logo=turbopack&logoColor=white" alt="Turbopack" />
  <img src="https://img.shields.io/badge/OpenSpec-Driven-blueviolet" alt="OpenSpec" />
</p>

| Pieza | Stack Tecnológico |
| --- | --- |
| **Framework** | Next.js 16 (App Router con Turbopack) |
| **UI Library** | React 19 + TypeScript |
| **Estilos y Tokens** | Tailwind CSS v4 + variables semánticas OKLCH |
| **Tipografía** | Be Vietnam Pro (Google Fonts con soporte latin completo) |
| **Formularios** | React Hook Form + validaciones estrictas con Zod |
| **Notificaciones** | Sonner |
| **Componentes Base** | shadcn/ui (Tailwind v4 tokens adaptados) |
| **Control de Acceso** | Middleware de enrutamiento + roles por rangos de fecha |

---

## Tabla de Contenidos

1. [Arquitectura Modular](#arquitectura-modular)
2. [Mapa de Carpetas](#mapa-de-carpetas)
3. [Capas y Responsabilidades](#capas-y-responsabilidades)
4. [Design System y Tokens](#design-system-y-tokens)
5. [Seguridad, Multiempresa y Permisos](#seguridad-multiempresa-y-permisos)
6. [Convenciones Obligatorias de Código](#convenciones-obligatorias-de-código)
7. [Módulos de Negocio (Features)](#módulos-de-negocio-features)
8. [OpenSpec y Workflow de Desarrollo](#openspec-y-workflow-de-desarrollo)
9. [Instalación y Scripts](#instalación-y-scripts)
10. [Documentación Técnica Adicional](#documentación-técnica-adicional)

---

## Arquitectura Modular

Siguiendo el estándar de arquitectura modular probado en `SOFI-WEB`, RP-TECH Frontend separa radicalmente las rutas de navegación de la lógica y componentes de dominio.

```
┌─────────────────────────────────────────────────────────────┐
│  app/          Rutas Next (App Router) — páginas delgadas   │
│  features/     Módulos de dominio (auth, casos, servicios)  │
│  components/   Shell corporativo (AppShell) + ui kit        │
│  lib/          Datos simulados, reglas de negocio y Zod     │
│  docs/         Especificaciones técnicas para el equipo     │
│  openspec/     Control de cambios y contratos de features   │
└─────────────────────────────────────────────────────────────┘
```

### Diagrama de Flujo de Dependencias

```
  app/(rutas delgadas) ──► features/<dominio>/views ──► features/<dominio>/components
         │                           │
         │                           ▼
         │                   hooks / types
         ▼
  components/shell (AppShell)
         │
         ▼
  components/ui (Button, Card, Input, Table...)
         │
         ▼
  globals.css (Tokens OKLCH) · Be Vietnam Pro
```

**Regla de Oro:** Los archivos `page.tsx` en `app/` son meros montadores de vistas (*thin wrappers*). No contienen estados, llamadas directas de mutación ni JSX complejo.

---

## Mapa de Carpetas

```
src/
├── app/                        # Capa de Enrutamiento Delgada (Thin Pages)
│   ├── (app)/                  # Grupo de rutas protegidas bajo AppShell
│   │   ├── layout.tsx          # Monta <AppShell /> con Suspense
│   │   ├── administracion/     # Gestión de clientes, usuarios y catálogo
│   │   ├── casos/              # Listado general de casos con filtros
│   │   │   ├── nuevo/          # Formulario reactivo de nuevo caso
│   │   │   └── [id]/           # Ficha completa del caso y visitas
│   │   └── mis-servicios/      # Vista técnica para operadores
│   │       └── [id]/reporte/   # Reporte digital de servicio con firmas
│   ├── login/                  # Inicio de sesión
│   ├── sin-acceso/             # Pantalla de roles vencidos o sin permisos
│   ├── globals.css             # Paleta OKLCH y utilidades Tailwind v4
│   ├── layout.tsx              # Root layout con Be Vietnam Pro y Sonner
│   └── page.tsx                # Raíz redirigida por middleware
│
├── features/                   # Módulos de Dominio Aislados
│   ├── auth/                   # Autenticación y control de sesión
│   │   ├── views/              # LoginView, SinAccesoView
│   │   └── index.ts            # Barrel público del dominio
│   ├── casos/                  # Gestión de casos de servicio técnico
│   │   ├── components/         # BloqueSolicitud, BloqueCliente, BloqueEquipo, BloqueServicio
│   │   ├── hooks/              # useNuevoCasoForm
│   │   ├── views/              # ListaCasosView, NuevoCasoView, DetalleCasoView
│   │   └── index.ts            # Barrel de vistas públicas
│   └── servicios/              # Atención técnica de campo
│       ├── components/         # TarjetaServicio, RepuestosList, FirmasDigitales
│       ├── views/              # MisServiciosView, ReporteServicioView
│       ├── types.ts            # Tipos e interfaces de servicios
│       └── index.ts            # Barrel de servicios
│
├── components/                 # Componentes Transversales Reutilizables
│   ├── shell/                  # Layout maestro (AppShell, Sidebar, BottomNav)
│   └── ui/                     # Primitivas canónicas de UI (Button, Card, Input...)
│
├── lib/                        # Infraestructura y Lógica de Negocio
│   ├── datos-simulados/        # Datos mock y server actions simuladas
│   │   ├── casos/              # Modularización de tipos y mock cases
│   │   ├── clientes.ts         # Clientes con soporte y RUC
│   │   ├── contactos.ts        # Contactos por cliente
│   │   ├── sedes.ts            # Sedes y direcciones
│   │   ├── equipos.ts          # Maquinaria, cabezales y fechas
│   │   ├── usuarios.ts         # Usuarios y roles con vigencia
│   │   └── actions.ts          # Búsquedas, mutaciones y sugerencias
│   ├── permisos/               # Reglas de autorización multi-rol
│   └── validaciones/           # Esquemas Zod para formularios
│
├── docs/                       # Documentación Técnica del Frontend
│   ├── KIT-UI.md               # Catálogo de componentes UI y props
│   ├── REGLAS-ARQUITECTURA.md  # Reglas de código y modularización
│   └── REGLAS-RESPONSIVE.md    # Estándar responsive y accesibilidad táctil
│
└── openspec/                   # Especificaciones Formales y Control de Cambios
    ├── config.yaml             # Configuración del proyecto y diseño
    ├── README.md               # Guía OpenSpec para el equipo
    ├── specs/                  # Especificaciones activas
    └── changes/                # Tareas y propuestas de arquitectura
```

---

## Capas y Responsabilidades

| Capa | Ubicación | Responsabilidad | Lo que NO debe hacer |
| --- | --- | --- | --- |
| **Thin Pages** | `src/app/` | Montar la vista correspondiente y declarar Suspense. | No contener lógica de negocio, ni handlers de formularios, ni JSX pesado. |
| **Views** | `src/features/*/views` | Orquestar hooks y componentes de sección para conformar la pantalla. | No mezclar lógica de otros dominios de negocio. |
| **Components** | `src/features/*/components` | Presentar información del dominio y recibir eventos de usuario. | No hacer llamadas directas a APIs globales sin desacoplamiento. |
| **Hooks** | `src/features/*/hooks` | Manejar estados, debounce, sincronizaciones y validaciones. | No retornar JSX. |
| **UI Kit** | `src/components/ui/` | Átomos visuales genéricos (Botón, Input, Tarjeta, etc.). | No contener reglas de negocio ni imports de `features/`. |
| **Shell** | `src/components/shell/` | Estructura de navegación global, menús por rol y cabeceras. | No acoplarse a formularios específicos. |

---

## Design System y Tokens

El sistema visual utiliza el espacio de color perceptual **OKLCH** configurado directamente en `src/app/globals.css` mediante la directiva `@theme inline` de Tailwind CSS v4.

### Tokens Principales

- **`--primary`**: `oklch(0.6723 0.1606 244.9955)` (Azul técnico corporativo RP-TECH).
- **`--card`**: `oklch(0.9784 0.0011 197.1387)` (Superficie suave para paneles y tarjetas).
- **`--border`**: `oklch(0.9317 0.0118 231.6594)` (Líneas divisorias limpias y sutiles).
- **`--radius`**: `1.3rem` (Bordes redondeados modernos y amigables).
- **Sombras**: Tinte azulado sutil (`rgba(29, 161, 242, 0.15)`).

### Tipografía Oficial: Be Vietnam Pro

Cargada de forma optimizada en `src/app/layout.tsx` a través de `next/font/google`:
- Subconjuntos: `latin`.
- Pesos soportados: `300`, `400`, `500`, `600`, `700`, `800`.
- Variable CSS: `--font-sans`.
- Fuentes auxiliares: `Georgia, serif` (`--font-serif`) y `Menlo, monospace` (`--font-mono`).

---

## Seguridad, Multiempresa y Permisos

1. **Aislamiento Multiempresa (`empresa_id`):**
   - Todos los datos simulados y futuras llamadas API filtran estrictamente por la empresa del usuario autenticado (`empresa_id`).
   - El rol `superadmin` es el único con visibilidad transversal multitenant.
2. **Vigencia Temporal de Roles:**
   - La asignación de roles incluye campos `desde` y `hasta`.
   - Si la fecha actual no se encuentra en el rango de vigencia, el rol queda inactivo.
   - Si un usuario no posee ningún rol vigente, es redirigido a `/sin-acceso`.
3. **Sugerencia Automática de Modo de Servicio:**
   - Si el equipo tiene menos de 12 meses de instalación → `Garantía del equipo`.
   - Si tiene más de 12 meses y el cliente tiene contrato vigente → `Garantía de soporte técnico`.
   - En cualquier otro caso → `Facturado`.
   - Si el usuario selecciona un modo diferente al sugerido, el sistema exige ingresar un motivo justificado mediante validación Zod.

---

## Convenciones Obligatorias de Código

Para mantener la máxima legibilidad y calidad arquitectónica:

1. **Cero Comentarios en el Código:**
   - Prohibidos los comentarios triviales, decorativos o de cabecera (`// src/...`).
   - El código debe ser autoexplicativo a través de tipos fuertes y nombres semánticos.
2. **Límite de 350 Líneas por Archivo:**
   - Ningún archivo puede exceder las 350 líneas de código.
   - Si un archivo crece, se debe modularizar en carpetas lógicas cohesionadas.
3. **Cero Estilos Hardcodeados:**
   - Usar siempre tokens semánticos (`text-primary`, `bg-card`, etc.).
   - Prohibido el uso de valores hexadecimales en duro o atributos `style={{ ... }}`.
   - Utilizar la clase utilitaria `min-h-11` para garantizar áreas táctiles de 44px.
4. **Auditoría Continua de Código Muerto:**
   - Todo archivo, función o exportación huérfana debe ser eliminada de inmediato.

---

## Módulos de Negocio (Features)

### 1. `features/auth`
- Gestión del inicio de sesión (`LoginView`) con validación de credenciales.
- Detección de roles vigentes y redirección automática según perfil (`pantallaInicio`).
- Pantalla informativa de denegación de permisos (`SinAccesoView`).

### 2. `features/casos`
- **`ListaCasosView`**: Listado reactivo con búsqueda, filtros combinados (estado, técnico, tipo de servicio, rango de fechas), vista de tabla en PC y tarjetas responsivas en móvil.
- **`NuevoCasoView`**: Asistente de creación de casos dividido en 4 bloques funcionales (`BloqueSolicitud`, `BloqueCliente`, `BloqueEquipo`, `BloqueServicio`) con autocompletado y cálculo automático de garantía.
- **`DetalleCasoView`**: Ficha técnica completa del caso, datos de cliente, sede, equipo, visitas programadas e historial.

### 3. `features/servicios`
- **`MisServiciosView`**: Portal técnico para visualización de servicios programados para hoy y próximas visitas.
- **`ReporteServicioView`**: Formulario digital de informe de atención en campo con registro de horas de ingreso/salida, procedimientos técnicos, insumos/repuestos, fotografías y firmas digitales táctiles.

---

## OpenSpec y Workflow de Desarrollo

El proyecto opera bajo la metodología **OpenSpec**, donde todo cambio de arquitectura o funcionalidad requiere un ciclo formal de especificación:

1. **Propose:** Creación de propuesta en `openspec/changes/<nombre>/proposal.md`.
2. **Design:** Documentación de impacto y contratos en `design.md`.
3. **Tasks:** Plan de tareas atómicas en `tasks.md`.
4. **Apply:** Ejecución de código con verificación estricta (`tsc` y `build`).
5. **Archive:** Cierre y congelamiento en histórico de cambios.

Para más detalles, consulta `openspec/README.md`.

---

## Instalación y Scripts

### Prerrequisitos
- Node.js 20+ (recomendado 22+ o 24+)
- npm o bun

### Instalación de Dependencias
```bash
npm install
```

### Conexión con Supabase
El frontend lee y escribe en Supabase (repo `rp-tech-backend`). No hay API propia: las reglas las aplica la base (RLS y funciones).

1. Levanta el backend en local (en la carpeta de `rp-tech-backend`, con Docker Desktop abierto):
   ```bash
   npx supabase start
   npx supabase db reset
   npx supabase functions serve
   ```
   La última deja corriendo las funciones `reporte-pdf` (PDF y correo) y `usuarios` (crear usuarios).
2. Copia `.env.example` como `.env.local` y pon la **Project URL** y la clave **Publishable** que muestra `npx supabase status`. La clave **Secret** nunca va en el frontend.
3. Entra con los usuarios de prueba del backend (contraseña `Rptech2026!`), por ejemplo `coordinador@rptech.test` o `tecnico1@rptech.test`.

Los correos que envía el sistema en local se ven en Mailpit: http://127.0.0.1:54324.

**Dónde está cada cosa:**
- `src/lib/datos/`: capa de datos real. Mismos nombres que antes (`casos_lista`, `programar_visita`, `cerrar_reporte`…), así las pantallas no cambiaron. Las pantallas importan de `@/lib/datos/actions`.
- `src/lib/datos-simulados/`: los datos de prueba de antes. Ya no los usa ninguna pantalla; quedan los tipos (`types.ts`) y las fechas (`fecha.ts`).
- Fotos y firmas se suben al bucket privado `reportes`; el logo, al bucket `empresas`. Para verlos se pide un enlace temporal.

### Servidor de Desarrollo (Turbopack)
```bash
npm run dev
```

### Verificación de Tipos TypeScript
```bash
npx tsc --noEmit
```

### Compilación para Producción
```bash
npm run build
```

---

## Documentación Técnica Adicional

- [Catálogo de Componentes UI (KIT-UI.md)](docs/KIT-UI.md)
- [Política Global de Componentes Compartidos](docs/REGLAS-COMPONENTES-GLOBALES.md)
- [Reglas de Arquitectura y Modularización](docs/REGLAS-ARQUITECTURA.md)
- [Reglas de Diseño Responsive y Accesibilidad Táctil](docs/REGLAS-RESPONSIVE.md)
- [Configuración OpenSpec](openspec/config.yaml)
