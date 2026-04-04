import { Link } from 'react-router';
import {
  ArrowRight,
  FileText,
  GraduationCap,
  Folder,
  Send,
  ClipboardCheck,
  ClipboardList,
  TrendingUp,
  Clock,
  BarChart3,
  Sparkles,
  BookOpen,
  CloudUpload,
  Map,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUsername } from '../../hooks/useAuth';

interface FlowCard {
  step: number;
  route: string;
  icon: LucideIcon;
  label: string;
  description: string;
  accent: 'primary' | 'secondary' | 'tertiary';
}

interface SupportCard {
  route: string;
  icon: LucideIcon;
  label: string;
  description: string;
  dependsLabel: string;
  accent: 'primary' | 'secondary' | 'tertiary';
}

interface StatCard {
  icon: LucideIcon;
  value: string;
  label: string;
  trend: string;
  accent: 'primary' | 'secondary' | 'tertiary';
}

const QUICK_ACCENT = {
  primary: {
    wrapper: 'bg-primary-muted group-hover:bg-primary',
    icon: 'text-primary group-hover:text-white',
    step: 'bg-primary/15 text-primary',
  },
  secondary: {
    wrapper: 'bg-secondary-muted group-hover:bg-secondary',
    icon: 'text-secondary group-hover:text-white',
    step: 'bg-secondary/15 text-secondary',
  },
  tertiary: {
    wrapper: 'bg-tertiary-muted group-hover:bg-tertiary',
    icon: 'text-tertiary-muted-foreground group-hover:text-white',
    step: 'bg-tertiary-muted text-tertiary-muted-foreground',
  },
} as const;

const STAT_ACCENT = {
  primary: { bg: 'bg-primary-muted', icon: 'text-primary', trend: 'text-primary' },
  secondary: { bg: 'bg-secondary-muted', icon: 'text-secondary', trend: 'text-secondary' },
  tertiary: { bg: 'bg-tertiary-muted', icon: 'text-tertiary-muted-foreground', trend: 'text-tertiary-muted-foreground' },
} as const;

/** Main linear flow: steps 1 → 6 */
const flowCards: FlowCard[] = [
  { step: 1, route: '/fichas-perfil',     icon: FileText,       label: 'Fichas de Perfil',     description: 'Expedientes académicos', accent: 'primary'   },
  { step: 2, route: '/proyectos-grado',   icon: GraduationCap,  label: 'Proyectos de Grado',   description: 'Tesis e investigación',  accent: 'secondary' },
  { step: 3, route: '/artefactos',        icon: Folder,         label: 'Artefactos',           description: 'Diseños y arquitecturas', accent: 'tertiary' },
  { step: 4, route: '/entregables',       icon: Send,           label: 'Entregables',          description: 'Control de entregas',    accent: 'primary'   },
  { step: 5, route: '/evaluaciones',      icon: ClipboardCheck, label: 'Evaluaciones',         description: 'Calificación y revisión', accent: 'secondary' },
  { step: 6, route: '/biblioteca',        icon: BookOpen,       label: 'Biblioteca',           description: 'Recursos académicos',    accent: 'tertiary'  },
];

/** Modules that branch off / depend on flow nodes */
const supportCards: SupportCard[] = [
  { route: '/repositorio-artefactos', icon: CloudUpload,    label: 'Repositorio de Artefactos', description: 'Repositorio centralizado de artefactos técnicos', dependsLabel: 'Requerido por Artefactos',      accent: 'tertiary'  },
  { route: '/mapas-ruta',             icon: Map,            label: 'Mapas de Ruta',             description: 'Planificación e itinerarios de proyectos',       dependsLabel: 'Requiere Proyectos de Grado',  accent: 'secondary' },
  { route: '/solicitudes',            icon: ClipboardList,  label: 'Solicitudes',               description: 'Trámites y solicitudes institucionales',          dependsLabel: 'Requiere Proyectos de Grado',  accent: 'primary'   },
];

const statCards: StatCard[] = [
  { icon: TrendingUp, value: '12', label: 'Proyectos Activos', trend: '+3 este mes', accent: 'secondary' },
  { icon: Clock, value: '5', label: 'Entregables Pendientes', trend: 'Próximo vence hoy', accent: 'tertiary' },
  { icon: BarChart3, value: '3', label: 'Evaluaciones Recientes', trend: 'Actualizado hace 2h', accent: 'primary' },
];

export default function Dashboard() {
  const username = useUsername();
  const firstName = username.split(/[._@]/)[0];
  const displayName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
    : username;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 animate-fade-up sm:gap-8">
      {/* Welcome hero */}
      <section className="hero-gradient relative overflow-hidden rounded-2xl p-6 shadow-card sm:p-8" aria-label="Bienvenida">
        <div className="relative z-10 flex flex-col gap-1 sm:gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-white/70" aria-hidden />
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">Portal Académico</p>
          </div>
          <h1 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
            Hola, {displayName} 👋
          </h1>
          <p className="max-w-md text-sm text-white/75">
            Gestión centralizada de proyectos de grado, artefactos y evaluaciones académicas.
          </p>
        </div>
        <div className="hero-pattern" aria-hidden />
        {/* Decorative circle */}
        <div
          className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 sm:-right-8 sm:-top-8 sm:h-56 sm:w-56"
          aria-hidden
        />
        <div
          className="absolute -bottom-16 -right-4 h-36 w-36 rounded-full bg-white/5"
          aria-hidden
        />
      </section>

      {/* Stats row */}
      <section
        className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
        aria-label="Resumen general"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const styles = STAT_ACCENT[stat.accent];
          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-card transition-shadow duration-200 hover:shadow-card-hover sm:p-5"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${styles.bg}`}>
                <Icon size={19} className={styles.icon} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-on-surface sm:text-2xl">{stat.value}</p>
                <p className="truncate text-xs font-medium text-on-surface">{stat.label}</p>
                <p className={`mt-0.5 truncate text-[11px] ${styles.trend}`}>{stat.trend}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main flow */}
      <section aria-labelledby="flujo-titulo">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2
            id="flujo-titulo"
            className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-secondary"
          >
            Flujo de Gestión
          </h2>
          <span className="text-[11px] text-on-surface-secondary">{flowCards.length} pasos</span>
        </div>

        {/* On lg+: inline flex row with ChevronRight separators.
            On smaller: 2-col then 3-col grid. */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:flex lg:items-stretch lg:gap-0">
          {flowCards.map((card, idx) => {
            const Icon = card.icon;
            const styles = QUICK_ACCENT[card.accent];
            const isLast = idx === flowCards.length - 1;
            return (
              <div key={card.route} className="lg:flex lg:flex-1 lg:items-stretch">
                <Link
                  to={card.route}
                  className="group flex flex-1 flex-col gap-2.5 rounded-xl border border-border bg-surface p-3.5 shadow-card outline-none transition-all duration-200 hover:border-border-strong hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-4"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded px-1 text-[10px] font-bold ${styles.step}`}
                    >
                      {String(card.step).padStart(2, '0')}
                    </span>
                    <ArrowRight
                      size={12}
                      className="text-on-surface-secondary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-60"
                      aria-hidden
                    />
                  </div>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 ${styles.wrapper}`}
                  >
                    <Icon size={15} className={`transition-colors duration-200 ${styles.icon}`} aria-hidden />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold leading-tight text-on-surface">{card.label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-on-surface-secondary">
                      {card.description}
                    </p>
                  </div>
                </Link>

                {/* Arrow connector — desktop only, between cards */}
                {!isLast && (
                  <div className="hidden lg:flex lg:shrink-0 lg:items-center lg:px-0.5" aria-hidden>
                    <ChevronRight size={13} className="text-border-strong" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Complementary / dependent modules */}
      <section aria-labelledby="complementarios-titulo">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2
            id="complementarios-titulo"
            className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-secondary"
          >
            Módulos Complementarios
          </h2>
          <span className="text-[11px] text-on-surface-secondary">{supportCards.length} módulos</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {supportCards.map((card) => {
            const Icon = card.icon;
            const styles = QUICK_ACCENT[card.accent];
            return (
              <Link
                key={card.route}
                to={card.route}
                className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-card outline-none transition-all duration-200 hover:border-border-strong hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-5"
              >
                {/* Dependency badge */}
                <div className="flex items-center gap-1.5">
                  <GitBranch size={10} className="shrink-0 text-on-surface-secondary" aria-hidden />
                  <span className="truncate text-[10px] font-medium text-on-surface-secondary">
                    {card.dependsLabel}
                  </span>
                </div>
                {/* Icon + text */}
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${styles.wrapper}`}
                  >
                    <Icon size={17} className={`transition-colors duration-200 ${styles.icon}`} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-on-surface">{card.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-on-surface-secondary">
                      {card.description}
                    </p>
                  </div>
                  <ArrowRight
                    size={13}
                    className="mt-1 shrink-0 text-on-surface-secondary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-60"
                    aria-hidden
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
