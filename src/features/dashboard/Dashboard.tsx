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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUsername } from '../../hooks/useAuth';

interface QuickCard {
  route: string;
  icon: LucideIcon;
  label: string;
  description: string;
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
  },
  secondary: {
    wrapper: 'bg-secondary-muted group-hover:bg-secondary',
    icon: 'text-secondary group-hover:text-white',
  },
  tertiary: {
    wrapper: 'bg-tertiary-muted group-hover:bg-tertiary',
    icon: 'text-tertiary-muted-foreground group-hover:text-white',
  },
} as const;

const STAT_ACCENT = {
  primary: { bg: 'bg-primary-muted', icon: 'text-primary', trend: 'text-primary' },
  secondary: { bg: 'bg-secondary-muted', icon: 'text-secondary', trend: 'text-secondary' },
  tertiary: { bg: 'bg-tertiary-muted', icon: 'text-tertiary-muted-foreground', trend: 'text-tertiary-muted-foreground' },
} as const;

const quickCards: QuickCard[] = [
  { route: '/fichas-perfil', icon: FileText, label: 'Fichas de Perfil', description: 'Gestionar expedientes académicos', accent: 'primary' },
  { route: '/proyectos-grado', icon: GraduationCap, label: 'Proyectos de Grado', description: 'Seguimiento de tesis e investigación', accent: 'secondary' },
  { route: '/artefactos', icon: Folder, label: 'Artefactos', description: 'Arquitecturas y diseños técnicos', accent: 'tertiary' },
  { route: '/entregables', icon: Send, label: 'Entregables', description: 'Control de envíos y entregas', accent: 'primary' },
  { route: '/evaluaciones', icon: ClipboardCheck, label: 'Evaluaciones', description: 'Calificar y revisar desempeño', accent: 'secondary' },
  { route: '/solicitudes', icon: ClipboardList, label: 'Solicitudes', description: 'Trámites institucionales', accent: 'tertiary' },
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

      {/* Quick access */}
      <section aria-labelledby="acceso-rapido-titulo">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2
            id="acceso-rapido-titulo"
            className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-secondary"
          >
            Módulos de Gestión
          </h2>
          <span className="text-[11px] text-on-surface-secondary">{quickCards.length} módulos</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {quickCards.map((card) => {
            const Icon = card.icon;
            const styles = QUICK_ACCENT[card.accent];
            return (
              <Link
                key={card.route}
                to={card.route}
                className="quick-card group flex items-start gap-4 rounded-xl border border-border bg-surface p-4 shadow-card outline-none transition-all duration-200 hover:border-border-strong hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-5"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 sm:h-11 sm:w-11 ${styles.wrapper}`}
                >
                  <Icon size={19} className={`transition-colors duration-200 ${styles.icon}`} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-surface">{card.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-on-surface-secondary">
                    {card.description}
                  </p>
                </div>
                <ArrowRight
                  size={15}
                  className="mt-1 shrink-0 text-on-surface-secondary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-60"
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
