# Spec: Frontend Architecture (Feature-Based Modular)

## Requirements

### Requirement: Layered Architecture Structure

The application SHALL organize code into strict architectural layers:
1. `src/app/`: Next.js App Router route segments, layout definitions, and route handlers. Routes SHALL be thin wrappers that mount feature views.
2. `src/features/<domain>/`: Self-contained domain modules containing their own views, domain components, hooks, and types.
3. `src/components/ui/`: Base, domain-agnostic UI primitives (Button, Input, Card, Select, Badge, Sonner).
4. `src/components/app-shell.tsx`: Shared application chrome (top header, navigation drawer, company badge, session summary).
5. `src/lib/`: Shared utilities, data simulation infrastructure, Zod validation schemas, and permission helpers.

#### Scenario: Route module delegates to feature view
- **WHEN** a user navigates to `/casos`, `/casos/nuevo`, `/casos/[id]`, `/mis-servicios`, or `/login`
- **THEN** the `page.tsx` file SHALL NOT contain large inline UI trees or multi-stage business state machines
- **AND** it SHALL delegate rendering and business orchestration to a view component exported by the corresponding feature module in `src/features/<domain>/views`

### Requirement: Unidirectional Dependency Flow

Code SHALL respect a strictly unidirectional dependency flow:
- `app/` may import from `features/`, `components/`, and `lib/`.
- `features/<domain>/` may import from `components/ui/`, `lib/`, and the public barrel `index.ts` of other features.
- `components/ui/` SHALL NOT import from `features/` or `app/`.
- Domain features SHALL NOT directly access internal private files of another domain feature (must use public barrel exports).

#### Scenario: UI primitive independence
- **WHEN** updating or creating a component under `src/components/ui/`
- **THEN** it SHALL NOT contain any imports from `src/features/` or domain-specific business types.
