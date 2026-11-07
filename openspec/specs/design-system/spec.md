# Spec: Design System & Design Tokens (RP-TECH)

## Requirements

### Requirement: Centralized OKLCH Palette & Theme Tokens

The RP-TECH frontend SHALL define all color values, elevation shadows, border radii, and spacing variables inside `src/app/globals.css` using Tailwind CSS v4 `@theme inline` mapping and standard OKLCH color space. Hardcoded hex color values SHALL NOT be used directly inside UI components.

#### Scenario: Primary technical color token resolution
- **GIVEN** any interactive primary component (buttons, active tabs, highlight tags)
- **WHEN** rendered in light mode
- **THEN** it SHALL resolve `var(--primary)` which maps to `oklch(0.6723 0.1606 244.9955)`
- **AND** foreground text SHALL resolve `var(--primary-foreground)` which maps to `oklch(1.0000 0 0)`

#### Scenario: Dark mode color token resolution
- **GIVEN** any container or surface element
- **WHEN** the `.dark` class is present on the ancestor tree
- **THEN** `--background` SHALL resolve to `oklch(0 0 0)`
- **AND** `--card` SHALL resolve to `oklch(0.2097 0.0080 274.5332)`
- **AND** `--foreground` SHALL resolve to `oklch(0.9328 0.0025 228.7857)`

### Requirement: Typography Hierarchy & Font Families

The application SHALL use `Be Vietnam Pro` as its primary sans-serif font, loaded and optimized via `next/font/google` in `src/app/layout.tsx`. System serif (`Georgia, serif`) and monospace (`Menlo, monospace`) SHALL be available via standard CSS variables.

#### Scenario: Body text font family
- **WHEN** rendering standard UI text, labels, and form controls
- **THEN** the font applied SHALL be `var(--font-sans)` with fallback to `ui-sans-serif, sans-serif, system-ui`

#### Scenario: Technical identifiers and serial numbers
- **WHEN** displaying equipment serial numbers (`numero_serie`) or case numbers (`numero`)
- **THEN** the component SHALL apply `font-mono` resolving to `var(--font-mono)` (`Menlo, monospace`)

### Requirement: Elevation, Radius and Touch Targets

All card containers, interactive modals, and inputs SHALL adhere to the standard radius of `1.3rem` (`--radius: 1.3rem`) and subtle tinted shadows (`rgba(29, 161, 242, 0.15)`).

#### Scenario: Mobile and touch usability
- **GIVEN** interactive buttons, select inputs, and links
- **WHEN** rendered on touch or mobile devices
- **THEN** the minimum touch height SHALL be at least `44px` (`min-h-11`)

### Requirement: Status Colors Use Chart and Semantic Tokens

Case status labels SHALL use existing theme utilities. Components SHALL NOT introduce `--success`, `--warning`, `--danger`, or `--info`, and SHALL NOT hardcode hex or OKLCH numbers. `--secondary` SHALL NOT color a status label.

| Estado | Utilities |
| --- | --- |
| `por_programar` | `border-chart-3/50 bg-chart-3/20 text-foreground` |
| `programado` | `border-primary/40 bg-primary/15 text-primary` |
| `en_atencion`, `cerrado` | `border-chart-2/40 bg-chart-2/15 text-chart-2` |
| `atendido` | `border-chart-4/40 bg-chart-4/15 text-chart-4` |
| `en_espera` | `border-chart-5/40 bg-chart-5/15 text-chart-5` |
| `anulado` | `border-destructive/40 bg-destructive/15 text-destructive` |

`chart-3` is pale. Its badge text SHALL stay `text-foreground`.

#### Scenario: Status badge is not gray
- **WHEN** a case status is rendered
- **THEN** `EstadoBadge` SHALL apply the row of the table above
- **AND** it SHALL NOT use the `secondary` or `ghost` badge variant as the status color

### Requirement: Libraries That Draw UI

New UI SHALL be built with the libraries already adopted: Tailwind v4, shadcn primitives, Radix, Base UI buttons, lucide-react, Sonner, Recharts, and Be Vietnam Pro. PrimeReact and Ant Design stay installed for the inherited kit. New screens SHALL NOT switch the theme to PrimeReact green or replace Be Vietnam Pro with Poppins. Zod SHALL remain on the 3.x line already declared in `package.json`.
