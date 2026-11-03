## Why

El frontend de RP-TECH ha crecido agregando vistas de casos, reportes de servicio técnico, autenticación y administración. Actualmente, gran parte de la UI, estados interactivos y composición reside directamente en `src/app/` y en `src/components/casos/`. Para escalar ordenadamente, evitar archivos con cientos de líneas y garantizar mantenibilidad (siguiendo el modelo probado en SOFI-WEB), se adopta una arquitectura modular basada en features.

## What Changes

- Establecer **arquitectura feature-based modular**:
  - `src/features/casos/`: vistas, componentes, hooks y tipos de gestión de casos e incidentes.
  - `src/features/servicios/`: vistas y componentes de servicios técnicos de campo y reportes con firmas.
  - `src/features/auth/`: vistas de login y control de acceso.
- Convertir `src/app/` en una **capa de enrutamiento delgada** (*thin pages* que solo montan vistas con `<Suspense>`).
- Mantener `src/components/ui/` y `src/components/app-shell.tsx` como elementos compartidos de UI transversal.
- Preservar al 100% la lógica de simulación, esquemas Zod, reglas de multiempresa y cálculo de fechas/roles en `src/lib/`.
- Limpiar comentarios de relleno y carpetas residuales.

## Non-goals

- No alterar contratos de datos ni tipos de entidades (`Caso`, `Visita`, `Cliente`, `Sede`, `Equipo`, `Usuario`).
- No cambiar la lógica de sugerencia dinámica de modo ni el modal de advertencia de cambio.
- No modificar rutas ni URLs públicas existentes (`/casos`, `/casos/nuevo`, `/casos/[id]`, `/mis-servicios`, etc.).
- No agregar librerías externas de estado global innecesarias.

## Capabilities

### New Capabilities
- `frontend-architecture`: capas claras (`app/`, `features/`, `components/ui/`, `lib/`).
- `feature-module-contract`: contrato uniforme de carpetas por dominio (`components/`, `hooks/`, `views/`, `types.ts`, `index.ts`).

## Impact
- Estructura limpia y desacoplada, facilitando pruebas y navegación en el código.
- Riesgo nulo de regresión funcional al mantener la misma lógica en capas especializadas.
