# Propuesta: Alineación Arquitectónica y Estándares SOFI-WEB

## Resumen Ejecutivo

Alinear el frontend de RP-TECH con la arquitectura modular y escalable del proyecto de referencia `SOFI-WEB` (`c:\Users\diego\OneDrive\Desktop\SOFI-APM\SOFI-WEB`). Esto incluye la adopción de reglas estrictas para todo el equipo de desarrollo frontend: cero comentarios en código, límite estricto de 350 líneas por archivo, modularización en carpetas lógicas sin archivos sueltos, cero estilos hardcodeados, auditoría continua de código muerto, y documentación exhaustiva en `docs/` y `README.md`.

## Objetivos (Goals)

1. **Alineación con SOFI-WEB:** Estructura modular estricta: `app/` (thin routes), `features/<dominio>/`, `components/shell/`, `components/ui/`, `lib/`, `docs/`, `openspec/`.
2. **Cero Comentarios en Código:** Eliminar el 100% de los comentarios (`//`, `/* */`, `{/* */}`) en el código fuente de `src/`.
3. **Límite de 350 Líneas:** Ningún archivo debe exceder las 350 líneas de código; modularización en carpetas lógicas cohesivas.
4. **Cero Estilos Hardcodeados:** Reemplazo de todos los `style={{ ... }}` y colores arbitrarios por tokens semánticos OKLCH y clases canónicas (`min-h-11`).
5. **Auditoría de Código Muerto:** Eliminación de archivos huérfanos y dependencias residuales (`direcciones.ts`, etc.).
6. **Documentación Completa:** Crear `README.md` exhaustivo y guías técnicas en `docs/` (`KIT-UI.md`, `REGLAS-ARQUITECTURA.md`, `REGLAS-RESPONSIVE.md`).

## Lo que NO Cambia (Non-Goals)

1. No se modifican las reglas de negocio: aislamiento multiempresa por `empresa_id`.
2. No se alteran los rangos de vigencia de roles (`desde`, `hasta`) en autenticación.
3. No se altera el algoritmo de sugerencia de garantía de equipos (`sugerirModoServicio`).
4. No se alteran las rutas públicas existentes del App Router.
