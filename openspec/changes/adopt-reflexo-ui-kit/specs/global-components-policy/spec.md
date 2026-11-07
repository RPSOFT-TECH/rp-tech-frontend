## MODIFIED Requirements

### Requirement: Componentes globales obligatorios

El frontend MUST usar los componentes canónicos para tablas, diálogos, avisos y ayudas. La tabla MUST ofrecer vacío y skeleton. El modal MUST conservar `abierto`, `onCerrar`, `titulo`, `descripcion` y `tamano`. El toast MUST exponer `useToast` además de `toast()` de Sonner. El shell MUST registrar el título de cada módulo con `usePageTitle`. Los gráficos MUST usar `--chart-*` y el PDF de reporte MUST generarse con los datos ya presentes en la pantalla.

#### Scenario: Lista de casos

- **WHEN** la bandeja de casos carga o queda vacía
- **THEN** la tabla de escritorio usa el DataTable global con skeleton o estado vacío

#### Scenario: Sesión aún no hidratada

- **WHEN** el shell no tiene sesión en el primer render
- **THEN** el layout igual pinta `children` y no descarta el segmento de la ruta
