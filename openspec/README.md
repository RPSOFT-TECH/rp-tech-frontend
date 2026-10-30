# OpenSpec en RP-TECH Frontend

Spec-driven development con [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec).

## Qué se versiona

| Ruta | En git | Propósito |
|------|--------|-----------|
| `openspec/config.yaml` | Sí | Contexto general del stack, diseño, tokens y reglas arquitectónicas |
| `openspec/specs/` | Sí | Especificaciones formales vigentes (`design-system`, `frontend-architecture`, `feature-module-contract`) |
| `openspec/changes/` | Sí | Propuestas, diseños y tareas de cambios activos y archivados |

## Convenciones de Arquitectura y Diseño

1. **Tokens y Paleta Base (`src/app/globals.css`):**
   - Paleta corporativa basada en **OKLCH** con primario técnico `oklch(0.6723 0.1606 244.9955)`.
   - Modos claro y oscuro (`.dark`) consistentes.
   - Radio de bordes base: `1.3rem`.
   - Sistema de sombras con sutil tinte azulado (`rgba(29, 161, 242, 0.15)`).

2. **Tipografía Oficial:**
   - **Sans:** `Be Vietnam Pro` (optimizado con Next.js Google Fonts `next/font/google`, variable `--font-sans`).
   - **Serif:** `Georgia, serif` (variable `--font-serif`).
   - **Mono:** `Menlo, monospace` (variable `--font-mono`).

3. **Arquitectura Feature-Based Modular (Estilo SOFI-WEB):**
   - `src/app/**/page.tsx`: Páginas delgadas (*thin routes*), sólo componen layout y montan vistas.
   - `src/features/<domain>/`: Módulos de dominio aislados con vistas, hooks, componentes y contratos de datos.
   - `src/components/ui/`: Componentes atómicos base reutilizables.
   - `src/components/app-shell.tsx`: Shell de navegación global (sidebar, cabecera de usuario).
   - `src/lib/`: Infraestructura compartida (simulación de datos, validaciones Zod, permisos).

## Flujo de Trabajo con OpenSpec

- **Proponer un cambio:** Crear propuesta con análisis de impacto y tareas.
- **Aplicar:** Implementar modularmente respetando contratos de datos y tipado TypeScript estricto.
- **Verificar:** Ejecución mandatoria de `npx tsc --noEmit` y `npm run build`.
- **Archivar:** Mover la propuesta a `openspec/changes/archive/` al finalizar.
