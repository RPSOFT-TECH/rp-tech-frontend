# Spec: Frontend Architecture (Feature-Based Modular)

## Requirements

### Requirement: Layered Architecture Structure

The application SHALL organize code in these layers:

1. `src/app/`: App Router segments. Each `page.tsx` is a thin mount of a feature view.
2. `src/features/<domain>/`: Domain screens, grouped components, hooks, and types. Domains: `auth`, `casos`, `servicios`, `agenda`, `administracion`, `errores`.
3. `src/components/ui/`: Domain-agnostic primitives.
4. `src/components/shell/` and `src/components/layout/`: Application chrome. `AppShell` is the session shell. Header and sidebar live under `layout/`.
5. `src/components/providers.tsx` and `src/components/avisos-sonner.tsx`: Theme, tooltip, Sonner toaster, and the stored toast consumer.
6. `src/lib/`: Simulated data (`datos-simulados`), permissions, Zod schemas, and PDF helpers.

`src/app/(app)/layout.tsx` SHALL render `<AppShell>{children}</AppShell>` and SHALL NOT add another suspense boundary around the page.

#### Scenario: Route module delegates to feature view
- **WHEN** a user navigates to `/casos`, `/casos/nuevo`, `/casos/[id]`, `/mis-servicios`, `/mis-servicios/[id]/reporte`, `/agenda`, `/administracion`, or `/login`
- **THEN** `page.tsx` SHALL NOT contain the screen tree or the business state machine
- **AND** it SHALL render the view exported by `@/features/<domain>`

#### Scenario: Shell still paints the page without a session
- **WHEN** the session snapshot is null during prerender
- **THEN** `AppShell` SHALL still render `{children}`
- **AND** it SHALL NOT return `null`

### Requirement: Unidirectional Dependency Flow

- `app/` may import from `features/`, `components/`, and `lib/`.
- `features/<domain>/` may import from `components/`, `lib/`, and the public barrel of another feature.
- `components/ui/` SHALL NOT import from `features/` or `app/`.
- A feature SHALL NOT import a private file of another feature.

#### Scenario: UI primitive independence
- **WHEN** a file is added under `src/components/ui/`
- **THEN** it SHALL NOT import `src/features/` or a domain business type

### Requirement: URL Hooks and Suspense

A client component that calls `usePathname` or `useSearchParams` during prerender SHALL sit inside `<Suspense>`. The suspense boundary SHALL wrap only that reader. It SHALL NOT wrap `{children}` of a layout with `fallback={null}`.

`ConsumirAvisos` SHALL stay inside its own suspense boundary in `Providers`. Views that read `useSearchParams` SHALL keep the hook in the inner client tree and expose a suspense fallback with visible text from the view export.

#### Scenario: Case detail prerender
- **WHEN** `/casos/[id]` is prerendered
- **THEN** `usePathname` inside `ConsumirAvisos` SHALL NOT block the route
- **AND** the page segment SHALL remain in the render

### Requirement: Simulated Data Stays in Lib

Session, seed data, and simulated actions SHALL remain in `src/lib/datos-simulados`. Feature folders SHALL call those actions. They SHALL NOT copy the store into the feature.
