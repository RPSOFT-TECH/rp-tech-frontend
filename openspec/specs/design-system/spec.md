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
- **THEN** the minimum touch height SHALL be at least `44px` (`min-height: 44px`)
