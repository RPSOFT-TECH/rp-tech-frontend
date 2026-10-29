# Especificación: Estándares Obligatorios de Código Frontend

Estado: Vigente
Aplica a: Todo el código fuente en `src/` (`.ts`, `.tsx`, `.css`)

---

## 1. Cero Comentarios en el Código Fuente

El código en `src/` debe estar 100% libre de comentarios:
- Prohibidos comentarios de cabecera de archivo (`// src/...`).
- Prohibidos comentarios descriptivos en funciones, hooks y componentes.
- Prohibidos comentarios JSX (`{/* ... */}`).
- Toda la documentación técnica debe residir en `docs/` o `openspec/`.
- La autoexplicación del código se logra mediante TypeScript estricto, nombres expresivos y Zod.

---

## 2. Límite de 350 Líneas de Código por Archivo

- Ningún archivo `.ts` o `.tsx` debe superar las 350 líneas de longitud.
- Todo archivo que se acerque a 300 líneas debe ser modularizado.
- La modularización debe ser en **carpetas de lógica cohesionada** (ej. `src/lib/datos-simulados/casos/`), no en archivos sueltos desordenados.
- Cada carpeta debe contener solo los archivos necesarios y cohesionados.

---

## 3. Cero Estilos Hardcodeados (Zero Hardcode)

- Todos los colores deben provenir de la paleta semántica OKLCH configurada en `src/app/globals.css`:
  - `bg-card`, `bg-background`, `bg-muted`, `bg-primary/10`, `text-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, etc.
- Prohibido el uso de valores hexadecimales (`#...`) o RGB en componentes.
- Prohibido el uso de estilos en línea (`style={{ ... }}`).
- Para accesibilidad táctil de 44px, utilizar la clase de Tailwind `min-h-11` (o `h-11`).

---

## 4. Auditoría Continua y Eliminación de Código Muerto

- Todo archivo huérfano, import sin uso, o exportación no referenciada debe eliminarse de inmediato.
- Los alias temporales de compatibilidad deben limpiarse tan pronto como se migren las referencias.
- Las verificaciones `npx tsc --noEmit` y `npm run build` deben ejecutarse tras cada cambio para garantizar cero errores y cero advertencias.
