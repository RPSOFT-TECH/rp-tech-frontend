# Spec: Feature Module Contract

## Requirements

### Requirement: Feature Directory Layout

Each domain under `src/features/<domain>/` SHALL expose a public barrel and keep its screen logic in predictable folders.

```text
src/features/<domain>/
├── components/          # UI of this domain, grouped by logic when there is more than a handful
│   └── <grupo>/         # lista, detalle, nuevo, reporte, clientes, usuarios, sistema, comun
├── hooks/               # State and actions. No JSX
├── views/               # Screens mounted by app routes
├── utils/               # Pure helpers of this domain, when needed
├── types.ts             # Or types/ when the types split
└── index.ts             # Only the public API
```

Folders that do not apply to a domain SHALL be omitted. `auth` keeps a flat `components/` folder because it has few files. `errores` only has `views/`.

#### Scenario: Public API isolation
- **WHEN** a route or another feature needs a screen or a shared type
- **THEN** it SHALL import from `@/features/<domain>`
- **AND** it SHALL NOT import a private file of that feature

#### Scenario: Same-feature imports
- **WHEN** a view of the same feature needs a block that is not part of the public API
- **THEN** it MAY import that file by a relative path inside the feature

### Requirement: Group Components by Logic

Files that belong to the same screen or sub-domain SHALL live in one folder. A loose file at `components/` root is allowed only when it is shared by more than one group, or when the whole domain has few components.

Current groups:

- `casos/components/lista`, `casos/components/detalle`, `casos/components/nuevo`, `casos/components/nuevo/altas`
- `casos/components/EstadoCaso.tsx` stays at the root because list and detail both use it
- `administracion/components/comun`, `clientes`, `usuarios`, `sistema`
- `servicios/components/reporte`
- `agenda/components` plus `agenda/utils`

#### Scenario: New case form files
- **WHEN** a component only serves the new-case flow
- **THEN** it SHALL live under `features/casos/components/nuevo`
- **AND** a modal that creates a client, site, contact, or equipment SHALL live under `features/casos/components/nuevo/altas`

#### Scenario: Small domain
- **WHEN** a domain has about four cohesive components or fewer
- **THEN** those files MAY stay directly in `components/` without an extra folder

### Requirement: Hooks and Views

- A view SHALL orchestrate hooks and section components. It SHALL stay at or under 300 lines.
- A hook SHALL NOT return JSX.
- A page in `src/app` SHALL mount the view and SHALL NOT own the screen state.

#### Scenario: Thin route
- **WHEN** a user opens `/casos`, `/casos/nuevo`, `/casos/[id]`, `/agenda`, `/administracion`, `/mis-servicios`, or `/login`
- **THEN** `page.tsx` SHALL render the feature view and nothing else of the screen

### Requirement: No Source Comments

Source files SHALL NOT contain header comments, JSX comments, or decorative separators. Business rules for multi-company scope, role dates, and simulated data SHALL stay in force when files move.
