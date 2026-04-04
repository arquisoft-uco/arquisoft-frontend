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
  primary: { bg: 'bg-primary-muted', icon: 'text-primary' },
  secondary: { bg: 'bg-secondary-muted', icon: 'text-secondary' },
  tertiary: { bg: 'bg-tertiary-muted', icon: 'text-tertiary' },
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
  { icon: TrendingUp, value: '12', label: 'Proyectos Activos', accent: 'secondary' },
  { icon: Clock, value: '5', label: 'Entregables Pendientes', accent: 'tertiary' },
  { icon: BarChart3, value: '3', label: 'Evaluaciones Recientes', accent: 'primary' },
];

export default function Dashboard() {
  const username = useUsername();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 animate-fade-up">
      {/* Welcome hero */}
      <section className="hero-gradient relative overflow-hidden rounded-2xl p-8 shadow-card">
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/80">Portal Académico</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Bienvenido, {username}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/75">
            Gestión centralizada de proyectos de grado, artefactos y evaluaciones académicas.
          </p>
        </div>
        <div className="hero-pattern" aria-hidden />
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Resumen general">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const styles = STAT_ACCENT[stat.accent];
          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-card"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.bg}`}>
                <Icon size={20} className={styles.icon} aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
                <p className="text-xs text-on-surface-secondary">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick access */}
      <section aria-labelledby="acceso-rapido-titulo">
        <h2
          id="acceso-rapido-titulo"
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-on-surface-secondary"
        >
          Módulos de Gestión
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickCards.map((card) => {
            const Icon = card.icon;
            const styles = QUICK_ACCENT[card.accent];
            return (
              <Link
                key={card.route}
                to={card.route}
                className="quick-card group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 shadow-card outline-none transition-all duration-200 hover:shadow-card-hover hover:border-border-strong focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${styles.wrapper}`}>
                  <Icon size={20} className={`card-icon transition-colors duration-200 ${styles.icon}`} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-on-surface">{card.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-on-surface-secondary">
                    {card.description}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="mt-1 shrink-0 text-on-surface-secondary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
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
