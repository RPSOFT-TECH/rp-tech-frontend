# Reglas de Arquitectura Frontend — RP-TECH

Este documento establece las reglas obligatorias de diseño de software y organización de carpetas para todos los desarrolladores que trabajen en el frontend de **RP-TECH**.

---

## 1. Principio Fundamental: Rutas Delgadas (Thin Pages)

Las carpetas bajo `src/app/` representan exclusivamente el enrutamiento de **Next.js App Router**:

- **Prohibido:** Colocar lógica de negocio, manipulación directa de formularios o estados complejos en los archivos `page.tsx` dentro de `src/app/`.
- **Obligatorio:** Cada `page.tsx` debe ser un contenedor delgado (*thin page*) de no más de 5 a 15 líneas que únicamente monte la vista correspondiente proveniente de `src/features/<dominio>`.

### Ejemplo Canónico:
```tsx
import { ListaCasosView } from '@/features/casos';

export default function ListaCasosPage() {
  return <ListaCasosView />;
}
```

---

## 2. Organización Modular por Features (`src/features/<dominio>/`)

Cada dominio de negocio debe estar encapsulado en su respectiva carpeta dentro de `src/features/`:

```
src/features/<dominio>/
├── components/       # Componentes de presentación específicos del dominio
├── hooks/            # Hooks de lógica de estado y validaciones (sin JSX)
├── views/            # Vistas principales de página que componen componentes y hooks
├── types.ts          # Interfaces, tipos y DTOs del dominio
└── index.ts          # Barrel público que exporta únicamente lo necesario
```

### Contrato de la Carpeta de Feature
1. **Views:** Vistas completas compuestas con `Suspense` y manejo de layout local.
2. **Components:** Componentes reutilizables únicamente dentro de ese dominio.
3. **Hooks:** Lógica de formulario, llamadas de acción y estados aislados. Los hooks no deben contener JSX.
4. **Index Barrel:** Exporta solo las vistas públicas (y tipos o hooks necesarios fuera del dominio) para evitar ciclos y fuga de dependencias de cliente en componentes de servidor.

---

## 3. Límite Estricto de Líneas: Máximo 350 Líneas por Archivo

Ningún archivo en el repositorio debe exceder las **350 líneas de código**.

- Si un archivo se aproxima a las 300 líneas, debe ser descompuesto en subcomponentes lógicos o submódulos especializados.
- La modularización debe organizarse en **carpetas lógicas**, no en archivos sueltos desordenados en la raíz.
- Cada carpeta debe contener solo los archivos necesarios y cohesivos para su propósito.

---

## 4. Cero Comentarios en el Código

El código debe ser autoexplicativo a través de:
- Nombres de variables, funciones y componentes claros y expresivos en español técnico.
- Tipado estricto con TypeScript (`strict: true`).
- Esquemas de validación Zod legibles.

**Prohibido:**
- Comentarios de cabecera de archivo (`// src/app/...`).
- Comentarios explicativos triviales (`// Seleccionar cliente`).
- Comentarios de bloque decorativos (`// ─── Clientes ───`).
- Comentarios JSX (`{/* ... */}`).

Toda la documentación conceptual, reglas y flujos deben residir en la carpeta `docs/` o `openspec/`, nunca como ruido en el código fuente.

---

## 5. Cero Estilos Hardcodeados (Zero Hardcode)

1. **Tokens de color:** Todos los colores deben provenir de las variables CSS y tokens del sistema de diseño configurados en `globals.css` (`bg-card`, `text-primary`, `border-border`, `bg-muted`, etc.).
2. **Prohibido:** Usar colores hexadecimales (`#1da1f2`), RGB o clases fijas arbitrarias en componentes.
3. **Prohibido:** Usar estilos en línea (`style={{ minHeight: '44px' }}`). En su lugar, utilizar clases utilitarias de Tailwind CSS (`min-h-11`).

---

## 6. Política Global de Componentes Compartidos

- **Mandato Global:** Todo requerimiento estándar de interfaz debe reutilizar los componentes globales provistos en `@/components/ui` (`DataTable`, `Modal`, `Toast`, `Tooltip`, `SearchInput`, `Button`).
- **Política de Excepción (Decisión de Frontend):** Únicamente cuando un componente sea **exclusivo, especializado o intrínseco a la interacción particular de un módulo o página** (ej. bloque de firmas digitales en pantalla táctil, asistente interactivo de cotización o selector dinámico de modos y garantías), el desarrollador frontend está facultado para implementar un componente local dentro de `src/features/<dominio>/components/`.
- **Prohibición de duplicación:** Está prohibido reescribir tablas HTML genéricas, modales arbitrarios o botones sin variantes cuando el kit global ya cubre la necesidad.

---

## 7. Auditoría Continua de Código Muerto

- Todo código que no sea importado ni referenciado en el proyecto debe ser eliminado inmediatamente.
- Prohibido mantener archivos de "compatibilidad temporal" o alias que no se consuman en ninguna ruta activa.
- Antes de cada entrega, verificar que `npx tsc --noEmit` y `npm run build` compilen con 0 errores y 0 advertencias de módulos huérfanos.

---

## 7. Aislamiento Multiempresa y Permisos

- Toda consulta, filtro o mutación debe respetar el `empresa_id` del usuario autenticado en la sesión, excepto para el rol `superadmin`.
- Los roles de usuario solo son válidos si se encuentran dentro de su rango de vigencia (`desde` y `hasta`).
- La función de recomendación de modo de servicio (`sugerirModoServicio`) y las reglas de garantía de equipos son invariantes y no deben modificarse sin especificación formal previa.
