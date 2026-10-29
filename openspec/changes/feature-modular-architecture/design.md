## Arquitectura y Diseño Técnico

### 1. Estructura de Directorios

```text
src/
├── app/                        # Thin App Router Segments
│   ├── (app)/
│   │   ├── casos/
│   │   │   ├── page.tsx        # <ListaCasosView />
│   │   │   ├── nuevo/page.tsx  # <NuevoCasoView />
│   │   │   └── [id]/page.tsx   # <DetalleCasoView />
│   │   └── mis-servicios/
│   │       ├── page.tsx        # <MisServiciosView />
│   │       └── [id]/reporte/
│   │           └── page.tsx    # <ReporteServicioView />
│   ├── login/page.tsx          # <LoginView />
│   └── sin-acceso/page.tsx     # <SinAccesoView />
│
├── features/                   # Módulos de Dominio Aislados
│   ├── casos/
│   │   ├── components/         # BloqueCliente, BloqueEquipo, BloqueIncidencia, BloqueModoServicio, ModalConfirmacionModo
│   │   ├── hooks/              # useNuevoCasoForm
│   │   ├── views/              # ListaCasosView, NuevoCasoView, DetalleCasoView
│   │   └── index.ts            # Barrel público
│   ├── servicios/
│   │   ├── components/         # ChecklistRevision, RepuestosList, FirmasDigitales, TarjetaServicio
│   │   ├── views/              # MisServiciosView, ReporteServicioView
│   │   └── index.ts            # Barrel público
│   └── auth/
│       ├── views/              # LoginView, SinAccesoView
│       └── index.ts            # Barrel público
│
├── components/
│   ├── app-shell.tsx           # Shell compartido
│   └── ui/                     # Primitivas shadcn/ui
│
└── lib/                        # Infraestructura y backend simulation (inmutable)
```

### 2. Contrato de Imports y Dependencias
- `app/**/page.tsx` sólo importa vistas desde `@/features/<domain>`.
- `features/<domain>` importa de `@/components/ui`, `@/lib/*`, y utilidades transversales.
- Primitivas en `components/ui` no conocen la lógica de `features/`.

### 3. Preservación de Lógica y Compatibilidad
- `sugerirModoServicio`, `crearCaso`, `obtenerCasoPorId`, `obtenerCasos`: quedan intactos en `src/lib/datos-simulados/actions.ts`.
- Validación Zod con `casoSchema`: queda intacta en `src/lib/validaciones/caso.ts`.
- Soporte multiempresa y roles vigentes: se mantiene exactamente igual.
