# Spec: Feature Module Contract

## Requirements

### Requirement: Feature Directory Layout

Each domain feature module under `src/features/<domain>/` SHALL follow a consistent, predictable layout:
```text
src/features/<domain>/
├── components/     # Domain-specific UI components (e.g. BloqueCliente, ChecklistReporte)
├── hooks/          # Custom hooks handling data fetching, form state, and filter logic (no JSX)
├── views/          # Top-level screen views mounted by App Router pages
├── types/          # Feature-specific interfaces and DTOs (or types.ts)
└── index.ts        # Public barrel exporting only what external callers need
```

#### Scenario: Public API isolation
- **WHEN** an external module needs functionality from a feature
- **THEN** it SHALL import from `@/features/<domain>` (via `index.ts`) rather than deep subpaths.

### Requirement: State and Modularization Balance

To maintain readable code without unnecessary fragmentation:
- Features SHALL maintain a balanced number of components (~4 to 8 per domain).
- Trivial presentational fragments under ~40 lines used in only one place SHOULD be kept within the parent component.
- Complex sections (≥ 80 lines, or with their own interactive state/modals) SHALL be extracted into modular components under `components/`.
- Custom hooks SHALL be free of JSX and focus purely on data management, filter synchronization, and form handling (target ≤ 180 lines).

### Requirement: Zero Filler Comments & Business Logic Preservation

Source code SHALL NOT contain decorative ASCII banners, separator dividers, or redundant section comments. All existing multiempresa rules, active role date checks, and simulated data integrations SHALL be strictly preserved.
