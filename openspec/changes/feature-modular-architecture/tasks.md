# Tasks: Feature-Based Modular Architecture Migration

- [ ] **1. Dominio `features/casos`**
  - [ ] 1.1 Crear directorio `src/features/casos/` con `components/`, `hooks/`, `views/` y `index.ts`.
  - [ ] 1.2 Mover componentes modulares del formulario (`BloqueCliente`, `BloqueEquipo`, `BloqueIncidencia`, `BloqueModoServicio`, `ModalConfirmacionModo`) y el hook `useNuevoCasoForm.ts`.
  - [ ] 1.3 Crear vista `NuevoCasoView` y adelgazar `src/app/(app)/casos/nuevo/page.tsx`.
  - [ ] 1.4 Crear vista `ListaCasosView` y adelgazar `src/app/(app)/casos/page.tsx`.
  - [ ] 1.5 Crear vista `DetalleCasoView` y adelgazar `src/app/(app)/casos/[id]/page.tsx`.
  - [ ] 1.6 Exportar barrel en `src/features/casos/index.ts`.
  - [ ] 1.7 Verificar tipado `npx tsc --noEmit`.

- [ ] **2. Dominio `features/servicios`**
  - [ ] 2.1 Crear directorio `src/features/servicios/` con `components/`, `views/` y `index.ts`.
  - [ ] 2.2 Modularizar componentes de reporte (`ChecklistRevision`, `RepuestosList`, `FirmasDigitales`) y tarjeta de servicio (`TarjetaServicio`).
  - [ ] 2.3 Crear vista `MisServiciosView` y adelgazar `src/app/(app)/mis-servicios/page.tsx`.
  - [ ] 2.4 Crear vista `ReporteServicioView` y adelgazar `src/app/(app)/mis-servicios/[id]/reporte/page.tsx`.
  - [ ] 2.5 Exportar barrel en `src/features/servicios/index.ts`.
  - [ ] 2.6 Verificar tipado `npx tsc --noEmit`.

- [ ] **3. Dominio `features/auth`**
  - [ ] 3.1 Crear `src/features/auth/views/LoginView.tsx` y adelgazar `src/app/login/page.tsx`.
  - [ ] 3.2 Crear `src/features/auth/views/SinAccesoView.tsx` y adelgazar `src/app/sin-acceso/page.tsx`.
  - [ ] 3.3 Exportar barrel en `src/features/auth/index.ts`.

- [ ] **4. Higiene, Limpieza y Verificación Final**
  - [ ] 4.1 Eliminar `src/components/casos` y `src/hooks/useNuevoCasoForm.ts` obsoletos.
  - [ ] 4.2 Validar build de producción completo con `npm run build`.
  - [ ] 4.3 Marcar todas las tareas completadas en OpenSpec.
