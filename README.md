# rp-tech-frontend

## Descripción
Frontend del sistema **RP‑TECH**, una aplicación de gestión de órdenes de servicio técnico para maquinaria de impresión textil. Usa Next.js (App Router), TypeScript estricto, Tailwind CSS y la UI de **shadcn/ui**.

## Requisitos
- Git
- Node.js 20+ (incluye npm)
- (Opcional) Vercel CLI para despliegues locales

## Instalación
```bash
git clone https://github.com/goldz9999/rp-tech-frontend.git
cd rp-tech-frontend
npm install
```

## Levantar el proyecto
```bash
npm run dev   # http://localhost:3000
```

## Estructura de carpetas (principales)
```
src/
  app/                # Rutas de Next.js (App Router)
  components/
    ui/               # Componentes shadcn (button, input, …)
  lib/
    datos-simulados/  # Datos estáticos de ejemplo y acciones mock
    permisos/         # Definiciones de roles y acceso a rutas
    validaciones/     # Schemas Zod para formularios
```

## Datos simulados
Todo el frontend usa los archivos bajo `src/lib/datos-simulados/`. No hay conexión a backend aún.

## Ramas y flujo de trabajo
- Cada tarea se desarrolla en una rama `feature/<nombre‑tarea>`.
- Commits con prefijo `feat:`, `fix:`, `chore:` o `docs:`.
- Pull request contra `main`; **nunca** se push directamente a `main` salvo el primer commit inicial.

## Despliegue en Vercel
El repositorio está conectado a Vercel. Cada push a `main` genera una preview automática.

## Notas
- La paleta de colores y el tema están definidos en `src/app/globals.css`.
- El alias `@/*` permite importar con `@/` desde `src/`.
- Las notificaciones usan **sonner** (`npm i sonner`).
