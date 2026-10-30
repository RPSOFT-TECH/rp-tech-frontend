# Especificación: Política Global de Componentes Compartidos

Estado: Vigente
Aplica a: Todos los módulos en `src/features/` y rutas en `src/app/`

---

## 1. Declaración de Política

En todo el frontend de RP-TECH rige el principio de **máxima reutilización de componentes canónicos** para garantizar coherencia visual, accesibilidad táctil de 44px y mantenimiento centralizado.

### Componentes Globales de Uso Obligatorio
1. **`DataTable` (`components/ui/data-table`):** Para tablas de datos, ordenamiento y listados tabulares.
2. **`Modal` (`components/ui/modal`):** Para ventanas emergentes, diálogos de confirmación y formularios flotantes.
3. **`Toast` (`components/ui/sonner`):** Para retroalimentación y alertas temporales.
4. **`Tooltip` (`components/ui/tooltip`):** Para ayudas contextuales flotantes.
5. **`SearchInput` (`components/ui/search-input`):** Para buscadores y filtros de texto con botón de limpieza.
6. **`Button` (`components/ui/button`):** Para cualquier acción clickeable con variantes estándar.

---

## 2. Regla de Excepción y Autonomía de Frontend

Se autoriza prescindir del uso de componentes globales y desarrollar componentes locales en `src/features/<dominio>/components/` **únicamente bajo las siguientes condiciones:**

1. El componente resuelve una necesidad de interacción **exclusiva, altamente especializada y no generalizable** para otros dominios.
2. Ejemplos válidos:
   - Lienzo de dibujo y captura de firmas táctiles (`FirmasDigitales`).
   - Selector interactivo de modos de servicio y garantías con sugerencias dinámicas (`BloqueEquipo`).
   - Bloque de lista de repuestos dinámicos con agregado/remoción en vivo (`RepuestosList`).
3. La decisión corresponde al criterio técnico del desarrollador frontend para optimizar la experiencia de usuario (UX) en campo.
