import type { LucideIcon } from 'lucide-react';
import { Hammer } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export default function ComingSoon({ title, description, icon: Icon = Hammer }: Props) {
  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <header>
        <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
        <p className="mt-1 text-sm text-on-surface-secondary">{description}</p>
      </header>
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border bg-surface p-8 text-center shadow-card">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-muted">
          <Icon size={28} className="text-primary" aria-hidden />
        </div>
        <div>
          <p className="font-semibold text-on-surface">En construcción</p>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-on-surface-secondary">
            Este módulo estará disponible próximamente.
          </p>
        </div>
        <span className="rounded-full bg-secondary-muted px-4 py-1.5 text-xs font-semibold text-secondary">
          Próximamente
        </span>
      </div>
    </div>
  );
}
