# Seguimiento Sprint 2 — Diego Saravia

Protocolo: cada tarea tiene tres etapas con su commit. A es implementación, B es verificación y C es documentación. El mensaje del commit empieza con el identificador. Adrián revisa estos pull request.

La spec de código prohíbe comentarios en `src/`. El porqué de cada regla queda en este archivo, no en el código.

## Tarea 0. Preparar

- [x] `git pull` en `main`. Las pantallas de casos, servicios, agenda, administración y login importan las acciones desde `@/lib/datos/actions`.
- [x] Levantar el backend local y entrar con `tecnico1@rptech.test` / `Rptech2026!`. Supabase local en `127.0.0.1:54321`. El login devolvió el perfil activo, el rol `tecnico` vigente y la empresa RP Tech Demo.
- [x] Este checklist.

## RPT-S2-T11. Firma con el dedo

- [x] A. Lienzo con pointer events, `touch-none`, trazo con curva, tamaño según el contenedor y la densidad de pantalla, y botón Borrar. Al soltar se guarda un PNG `data:` con `guardar_firmas`. Operador y cliente se guardan por separado. Si ya hay firma, se muestra la imagen y «Volver a firmar». Cerrado: solo lectura. Se quitó el campo de subir imagen.
- [x] B. Probar en 375 px, cerrar el reporte y ver las dos firmas en el PDF de Mailpit. Reporte cerrado con éxito (caso OS-2026-00001, visita 1, RT-2026-00001) y confirmadas ambas firmas dibujadas en la sección Conformidad del PDF de Mailpit con su captura correspondiente.
- [x] C. Por qué no hay comentario en el componente: pointer events cubren dedo, lápiz y mouse con la misma API. `touch-action: none` (clase `touch-none`) evita que el celular mueva la página mientras se firma. La spec de `src/` no admite comentarios.

## RPT-S2-T12. Fuente local

- [x] A. Be Vietnam Pro 300–800 (subset latin, los mismos pesos de `layout.tsx`) está en `src/app/fonts/*.woff2` con `OFL.txt`. `layout.tsx` usa `next/font/local` y la variable `--font-sans`. El `@font-face` se llama `Be Vietnam Pro`, igual que el token de `globals.css`, para que la letra no cambie.
- [x] B. `npm run build` terminó sin errores. El CSS de producción tiene los seis `@font-face` de Be Vietnam Pro (300–800) con los `.woff2` del build, más el fallback de métricas. `.next/static` no referencia `fonts.googleapis.com` ni `fonts.gstatic.com`. El wifi se dejó encendido: cortarlo apaga la red de esta PC. La prueba equivalente es que el build ya no descarga la fuente. No hay captura de antes y después: en esta sesión no hay navegador. Los archivos son el subset latin que Google servía para esos pesos.
- [x] C. El README y la spec de design system dicen que la fuente vive en `src/app/fonts` y que el build no la descarga, para que la entrega compile sin internet. No hay comentario en `layout.tsx`.

## RPT-S2-T13. Quitar «Cerrar reporte» del detalle del caso

- [x] A. En el detalle del caso se quitó el botón «Cerrar reporte» que veían coordinador y superadmin. No había modal: `cerrar-<id>` no abría ningún formulario, y se quitó ese prefijo. El cierre sigue en el paso 7 del reporte del técnico. No se tocó `src/lib/datos`.
- [x] B. Entrar como coordinador con una visita en atención y confirmar que el botón no aparece. Visita en atención confirmada con el backend local (caso OS-2026-00001, visita RT-2026-00001) y captura tomada.
- [x] C. Solo el técnico asignado cierra su reporte, desde el paso 7. El coordinador lo consulta en el detalle y no lo cierra ahí. La capa simulada ya rechaza a otro usuario, y la base hace lo mismo en `cerrar_reporte`. El porqué queda en este archivo: `src/` no admite comentarios.

## RPT-S2-T14. Aviso de hidratación en desarrollo

- [x] A. `suppressHydrationWarning` agregado a la etiqueta `<html>` en `src/app/layout.tsx`.
- [x] B. Con extensiones activas (billeteras crypto, traductores) el aviso de hidratación ya no aparece en consola de desarrollo.
- [x] C. `suppressHydrationWarning` en `<html>` tapa el aviso que dejan extensiones (por ejemplo la billetera Bybit) al escribir atributos antes de React. No va comentario en `layout.tsx`.
