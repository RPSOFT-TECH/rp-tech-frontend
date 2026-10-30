# Tareas: Alineación Arquitectónica SOFI-WEB

- [x] **Auditoría de Código Muerto y Eliminación**
  - [x] Identificar y eliminar archivo huérfano `src/lib/datos-simulados/direcciones.ts`.
  - [x] Actualizar referencias en `DetalleCasoView`, `MisServiciosView`, y `ReporteServicioView` para importar canónicamente desde `sedes`.
  - [x] Verificar que no existan imports ni exports no utilizados.

- [x] **Modularización de Archivos > 350 Líneas**
  - [x] Modularizar `src/lib/datos-simulados/casos.ts` (419 líneas) en carpeta lógica `src/lib/datos-simulados/casos/`.
  - [x] Crear `types.ts`, `casos-principales.ts`, `casos-adicionales.ts`, `casos-data.ts`, `visitas-data.ts`, `index.ts`.
  - [x] Verificar que ningún archivo en todo `src/` supere las 350 líneas (máximo actual: 287 líneas).

- [x] **Alineación de Carpetas y Shell Modular**
  - [x] Mover `AppShell` a `src/components/shell/AppShell.tsx` con barrel `src/components/shell/index.ts`.
  - [x] Actualizar `src/app/(app)/layout.tsx` para importar desde `@/components/shell`.
  - [x] Mantener `src/components/app-shell.tsx` como reexportación para retrocompatibilidad limpia.

- [x] **Eliminación Total de Comentarios en Código**
  - [x] Eliminar comentarios en `app/`, `features/`, `components/`, y `lib/`.
  - [x] Verificar con búsqueda regex que haya 0 comentarios (`//`, `/* */`, `{/* */}`) en `src/`.

- [x] **Cero Estilos Hardcodeados (Zero Hardcode)**
  - [x] Reemplazar todas las ocurrencias de `style={{ minHeight: '44px' }}` por la clase utilitaria `min-h-11`.
  - [x] Reemplazar colores fijos por tokens semánticos OKLCH (`bg-card`, `text-primary`, `border-border`, etc.).

- [x] **Documentación Exhaustiva y Reglas para el Equipo**
  - [x] Crear `docs/KIT-UI.md` con especificación de componentes del kit.
  - [x] Crear `docs/REGLAS-ARQUITECTURA.md` con reglas obligatorias para desarrolladores.
  - [x] Crear `docs/REGLAS-RESPONSIVE.md` con estándar de diseño responsive y touch targets.
  - [x] Actualizar `README.md` principal con estándar de `SOFI-WEB`.
  - [x] Actualizar `openspec/config.yaml` y agregar `openspec/specs/code-standards/spec.md`.

- [x] **Verificación y Compilación**
  - [x] Ejecutar `npx tsc --noEmit` (0 errores).
  - [x] Ejecutar `npm run build` (Build exitoso).
