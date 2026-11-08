# Seguimiento Sprint 2 — Diego Saravia

Protocolo: cada tarea tiene tres etapas con su commit. A es implementación, B es verificación y C es documentación. El mensaje del commit empieza con el identificador. Adrián revisa estos pull request.

La spec de código prohíbe comentarios en `src/`. El porqué de cada regla queda en este archivo, no en el código.

## Tarea 0. Preparar

- [x] `git pull` en `main`. Las pantallas de casos, servicios, agenda, administración y login importan las acciones desde `@/lib/datos/actions`.
- [ ] Levantar el backend local y entrar con `tecnico1@rptech.test` / `Rptech2026!`. La rama `feature/conexion-supabase` no es ancestro de `main`; la capa `src/lib/datos` sí está en `main`.
- [x] Este checklist.

## RPT-S2-T11. Firma con el dedo

- [x] A. Lienzo con pointer events, `touch-none`, trazo con curva, tamaño según el contenedor y la densidad de pantalla, y botón Borrar. Al soltar se guarda un PNG `data:` con `guardar_firmas`. Operador y cliente se guardan por separado. Si ya hay firma, se muestra la imagen y «Volver a firmar». Cerrado: solo lectura. Se quitó el campo de subir imagen.
- [ ] B. Probar en 375 px, cerrar el reporte y ver las dos firmas en el PDF de Mailpit. Falta el backend local y la captura.
- [x] C. Por qué no hay comentario en el componente: pointer events cubren dedo, lápiz y mouse con la misma API. `touch-action: none` (clase `touch-none`) evita que el celular mueva la página mientras se firma. La spec de `src/` no admite comentarios.

## RPT-S2-T12. Fuente local

- [ ] A
- [ ] B
- [ ] C

## RPT-S2-T13. Quitar «Cerrar reporte» del detalle del caso

- [ ] A
- [ ] B
- [ ] C. La spec deja el cierre solo al técnico asignado. El botón del coordinador se quita; la base igual lo rechaza.

## RPT-S2-T14. Aviso de hidratación en desarrollo

- [ ] A
- [ ] B
- [ ] C. `suppressHydrationWarning` en `<html>` tapa el aviso que dejan extensiones (por ejemplo la billetera Bybit) al escribir atributos antes de React. No va comentario en `layout.tsx`.
