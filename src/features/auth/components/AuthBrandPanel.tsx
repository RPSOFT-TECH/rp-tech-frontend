import { Wrench, BarChart2, ShieldCheck } from 'lucide-react';

const CARACTERISTICAS = [
  {
    icon: Wrench,
    label: 'Gestión integral de órdenes y visitas técnicas',
  },
  {
    icon: BarChart2,
    label: 'Monitoreo y reportes de servicio en tiempo real',
  },
  {
    icon: ShieldCheck,
    label: 'Control de accesos y perfiles de técnicos',
  },
] as const;

export function AuthBrandPanel() {
  return (
    <aside className="hidden lg:flex lg:w-[45%] relative bg-secondary text-secondary-foreground overflow-hidden flex-col items-center justify-center p-12 select-none">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-10">
        <div className="flex flex-col items-center gap-5">
          <div className="size-24 rounded-3xl bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center backdrop-blur-sm shadow-2xl">
            <Wrench className="size-12 text-primary" strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-none">
              RP-<span className="text-primary">TECH</span>
            </h1>
            <p className="text-secondary-foreground/45 text-[11px] font-semibold mt-2.5 tracking-[0.25em] uppercase">
              Sistema de Servicio Técnico
            </p>
          </div>
        </div>

        <div className="w-12 h-px bg-border/40" />

        <ul className="flex flex-col gap-5 text-left">
          {CARACTERISTICAS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-4">
              <div className="size-9 rounded-xl bg-primary/15 ring-1 ring-primary/25 flex items-center justify-center shrink-0">
                <Icon className="size-4 text-primary" strokeWidth={1.8} />
              </div>
              <p className="text-secondary-foreground/65 text-[12.5px] leading-snug max-w-[220px]">
                {label}
              </p>
            </li>
          ))}
        </ul>

        <p className="text-secondary-foreground/35 text-[10px] font-semibold tracking-[0.2em] uppercase">
          Versión 1.0 &middot; 2026
        </p>
      </div>
    </aside>
  );
}
