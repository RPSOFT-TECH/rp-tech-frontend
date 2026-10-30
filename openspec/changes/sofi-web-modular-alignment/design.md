# Diseño: Alineación Arquitectónica SOFI-WEB y Estándares

## 1. Estructura de Carpetas

```
src/
├── app/                  # Thin routes (solo montan vistas)
├── features/             # Módulos de dominio aislados
│   ├── auth/             # LoginView, SinAccesoView
│   ├── casos/            # ListaCasosView, NuevoCasoView, DetalleCasoView
│   └── servicios/        # MisServiciosView, ReporteServicioView
├── components/           # Componentes transversales
│   ├── shell/            # AppShell
│   └── ui/               # Kit UI canónico
├── lib/                  # Infraestructura
│   ├── datos-simulados/
│   │   └── casos/        # Submódulo modularizado de casos
│   ├── permisos/
│   └── validaciones/
docs/                     # Documentación para desarrolladores
└── openspec/             # Especificaciones formales y trazabilidad
```

## 2. Decisiones de Diseño

1. **Modularización de Datos Simulados:**
   - `src/lib/datos-simulados/casos.ts` (419 líneas) se divide en `src/lib/datos-simulados/casos/`:
     - `types.ts`: Interfaces `Caso` y `Visita`.
     - `casos-principales.ts`: Casos 1 al 8.
     - `casos-adicionales.ts`: Casos 9 al 16.
     - `casos-data.ts`: Exportación combinada.
     - `visitas-data.ts`: Mock de visitas.
     - `index.ts`: Barrel público.
   - Cada archivo se mantiene strictly por debajo de 200 líneas.

2. **Componentes Shell:**
   - `AppShell` migra a `src/components/shell/AppShell.tsx` con exportación limpia en `src/components/shell/index.ts`.

3. **Cero Estilos Hardcodeados:**
   - Todos los `style={{ minHeight: '44px' }}` se reemplazan por `min-h-11`.
   - Se utilizan tokens semánticos: `bg-card`, `text-primary`, `border-border`, etc.

4. **Cero Comentarios en Código:**
   - Todo comentario en `src/**/*.ts` y `src/**/*.tsx` es eliminado. Toda la explicación conceptual vive en `docs/` y `README.md`.
