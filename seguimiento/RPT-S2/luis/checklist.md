# Seguimiento Sprint 2 — Luis Bazan

Protocolo: cada tarea tiene tres etapas con su commit. A es implementación, B es verificación y C es documentación. El mensaje del commit empieza con el identificador. Diego revisa estos pull request.

La spec de código prohíbe comentarios en `src/`. El porqué de cada regla queda en este archivo, no en el código.

## Tarea 0. Preparar

- [x] `git pull` en `main`. Las pantallas de casos, servicios, agenda, administración y login importan las acciones desde `@/lib/datos/actions`.
- [x] Levantar el backend local y entrar con `tecnico1@rptech.test` / `Rptech2026!`. Supabase local en `127.0.0.1:54321`. El login devolvió el perfil activo, el rol `tecnico` vigente y la empresa RP Tech Demo.
- [x] Este checklist.

## RPT-S2-T15. Exportación que Excel abre con tildes

- [x] A. Opción completa: genera un `.xlsx` con librería `xlsx`. Se elige `.xlsx` porque abre nativo en Excel sin configuración de codificación ni separador, preserva tipos (fechas, números) y permite anchos de columna y estilos, evitando problemas de `;` vs `,` según locale y de BOM en distintas versiones de Excel.
- [x] A. El nombre del archivo debe llevar la fecha de Lima, no toISOString(). Usa `hoyLima()` de `@/lib/datos-simulados/fecha`.
- [x] A. Exporta la lista filtrada, con las mismas filas que la pantalla.
- [ ] B. Crea casos con tildes y ñ («Inspección», «Peña»), expórtalos y ábrelos con doble clic en Excel: sin caracteres extraños, cada dato en su columna. Captura.
- [x] C. El porqué queda en este checklist: `.xlsx` abre en Excel sin depender del BOM ni del separador `;`. `src/` no admite comentarios.

## RPT-S2-T16. Nombre del técnico adjunto en Mis servicios y en el reporte

- [x] A. En `src/lib/datos/vistas.ts`, `mis_servicios` debe tomar el nombre del titular y del adjunto de la vista que hizo Edwin. Mantén la forma de `MiServicio`, agregando los campos que falten en el tipo.
- [x] A. En la tarjeta de Mis servicios: si vas de adjunto, «Vas con <titular>»; si vas de titular con adjunto, «Con <adjunto>».
- [x] A. En el encabezado del reporte, el técnico y el adjunto.
- [ ] B. Con tecnico1 de titular y tecnico2 de adjunto: cada uno ve el nombre del otro. Captura de los dos.
- [x] C. Nota en el PR de qué tarea de backend depende. Depende de T08 (Edwin) que expone `tecnico_adjunto_id` y `nombre_completo` del adjunto en la vista de reportes.

## RPT-S2-T17. Prueba en celulares reales

- [x] A. Crea `seguimiento/RPT-S2/luis/prueba-celulares.md` con una tabla por celular (modelo, sistema, navegador) y una fila por prueba.

| Prueba | Qué revisar |
|--------|-------------|
| Instalar como app | Android: menú → «Instalar app». iPhone: Compartir → «Agregar a inicio». Abre a pantalla completa con el ícono |
| Login | Entra y la sesión se mantiene al cerrar y abrir la app |
| Mis servicios | Se ve sin desplazamiento horizontal; todo se toca con el dedo (44 px) |
| Llegada | «Registrar llegada» genera el N° de reporte |
| Cámara | «Tomar foto» abre la cámara trasera; la foto se sube y se ve la miniatura |
| Galería | Se eligen varias fotos a la vez |
| Dictado | El micrófono del teclado escribe en procedimiento y conclusión |
| Firmas | Las dos con el dedo (después de T11 de Diego), sin que la página se mueva |
| Cierre y PDF | Al cerrar llega el correo con el PDF, con fotos y firmas |
| Sin señal | Qué pasa al perder la conexión a la mitad: ¿se pierde lo escrito? |

- [ ] B. Por cada prueba: resultado (OK o falla) y captura. Cada falla es una tarjeta en el tablero, y se anota en el informe semanal con el formato `FEEDBACK:RPT-S2-T17-A: <qué pasó>`.
- [ ] C. Resumen al final del archivo: qué funciona, qué falla y qué bloquea el piloto.
- [ ] Comprueba que: la lista está completa en los dos celulares y cada falla tiene su tarjeta.

## Durante todo el sprint

- Reporte diario a las 18:00: Hecho / Sigue / Bloqueos. Avisa apenas te bloquee T08 o la publicación.
- Informe semanal del viernes: tu sección (qué hiciste, problemas y cómo los resolviste, qué aprendiste) y el resumen de la prueba en celulares.
- Revisión individual: prepárate para explicar sin leer el reporte del técnico por pasos y la exportación.