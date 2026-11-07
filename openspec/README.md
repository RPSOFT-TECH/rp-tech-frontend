# OpenSpec en RP-TECH Frontend

Spec-driven development con [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec).

## Qué se versiona

| Ruta | En git | Propósito |
|------|--------|-----------|
| `openspec/config.yaml` | Sí | Contexto del stack, tokens y reglas |
| `openspec/specs/` | Sí | Contratos vigentes |
| `openspec/changes/` | Sí | Propuestas activas y archivo |

## Specs vigentes

| Spec | Cubre |
|------|--------|
| `frontend-architecture` | Capas, rutas delgadas y dirección de los imports |
| `feature-module-contract` | Carpetas del feature y agrupación por lógica |
| `global-components-policy` | Kit de `@/components/ui` y cuándo un componente es local |
| `code-standards` | Tope de 300 líneas, cero comentarios y tokens |
| `design-system` | OKLCH, tipografía y color de los estados |

## Reglas que no se negocian

1. `src/app/**/page.tsx` solo monta la vista exportada por `@/features/<dominio>`.
2. Cada feature tiene `views/`, `index.ts` y, si hace falta, `hooks/` y `components/`.
3. Los componentes de una misma pantalla viven en una subcarpeta (`lista`, `detalle`, `nuevo`, `reporte`, `clientes`, `usuarios`, `sistema`, `comun`). Un archivo suelto en `components/` solo se admite si lo comparten varios grupos o si el feature tiene pocos archivos.
4. Ningún `.ts` o `.tsx` nuevo supera **300 líneas**. El número es un tope, no un tamaño mínimo.
5. `src/` no lleva comentarios. La explicación queda en `docs/` o en estas specs.
6. El color sale de `src/app/globals.css`. No hay hex, OKLCH ni paleta Tailwind (`red-900`, `blue-50`) en componentes.
7. Tablas, modales, botones, avisos Sonner, tooltips, búsqueda, select y fecha usan el kit global.
8. `components/ui` no importa features. Un feature no importa archivos internos de otro feature.

## Tokens

- Primario: `oklch(0.6723 0.1606 244.9955)` en `--primary`.
- Estados: `chart-2`, `chart-3`, `chart-4`, `chart-5`, `primary` y `destructive`. `--secondary` no pinta etiquetas de estado.
- Tipografía: Be Vietnam Pro en `--font-sans`.
- Radio base: `1.3rem`.

## Flujo

1. Proponer en `openspec/changes/<nombre>/` con `proposal.md`, `design.md` y `tasks.md`.
2. Implementar sin cambiar la lógica de negocio salvo que la tarea lo pida.
3. Verificar con `npx eslint --max-warnings 0` sobre lo tocado y `npx tsc --noEmit`.
4. Archivar el change cuando el contrato ya está en `openspec/specs/`.
