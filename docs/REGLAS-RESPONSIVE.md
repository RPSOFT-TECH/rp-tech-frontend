# Reglas de Código Responsive — RP-TECH

Este documento describe los estándares de adaptabilidad responsiva para PC, tablets y dispositivos móviles en **RP-TECH**.

---

## 1. Breakpoints Oficiales

Usar los breakpoints canónicos de Tailwind CSS configurados en el proyecto:

| Breakpoint | Ancho mínimo | Dispositivo objetivo |
| --- | --- | --- |
| `sm` | `640px` | Móviles grandes y phablets |
| `md` | `768px` | Tablets en vertical |
| `lg` | `1024px` | Tablets en horizontal y laptops pequeñas |
| `xl` | `1280px` | Pantallas de escritorio estándar |
| `2xl` | `1536px` | Monitores de alta resolución |

**Regla:** Prohibido usar anchos fijos arbitrarios con sintaxis `min-[820px]` o similares salvo excepción extrema documentada.

---

## 2. Shell Adaptable

1. **Escritorio (`lg` en adelante):**
   - Barra lateral fija izquierda (`w-60`) con logo, empresa actual, menú y botón de cierre de sesión.
   - Contenido principal desplazado hacia la derecha (`lg:ml-60`).
2. **Móviles y Tablets (`< lg`):**
   - Barra de navegación inferior fija (`h-14`) que maximiza el área de interacción con el pulgar.
   - Contenedor principal con padding inferior (`pb-14` a `pb-28`) para evitar superposición con barras de acción o navegación.

---

## 3. Tablas vs. Tarjetas en Dispositivos Móviles

Para listados de alta densidad (como el módulo de casos y reporte de servicios):

- **En PC / Escritorio (`md:block`):** Renderizar `<table>` completa con encabezados detallados y columnas fijas.
- **En Móvil (`md:hidden`):** Ocultar la tabla y renderizar tarjetas individuales táctiles (`rounded-xl p-4 shadow-sm border border-border`) que agrupen la información de manera legible.

### Ejemplo Canónico:
```tsx
<div className="hidden md:block">
  <table className="w-full">
    {/* Contenido tabular */}
  </table>
</div>

<div className="md:hidden grid grid-cols-1 gap-4">
  {casos.map((caso) => (
    <Link key={caso.id} href={`/casos/${caso.id}`} className="block bg-card p-4 rounded-xl border border-border">
      {/* Información condensada en tarjeta */}
    </Link>
  ))}
</div>
```

---

## 4. Estándar de Accesibilidad Táctil (Touch Targets)

En interfaces operativas de campo (utilizadas por técnicos en plantas textiles):

- Todos los botones, campos de entrada, selects y enlaces clickeables deben tener una altura mínima de **44px** para facilitar el tap táctil con guantes o en condiciones de movimiento.
- Utilizar la clase utilitaria canónica `min-h-11` (o `h-11`).
- Mantener espaciado mínimo de `gap-3` entre botones adyacentes para evitar pulsaciones erróneas.
