import { AlertTriangle } from 'lucide-react';

interface Props {
  recurso: string;
}

export default function AvisoNoDisponible({ recurso }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-tertiary/40 bg-tertiary-muted px-3 py-2 text-xs text-tertiary-muted-foreground"
    >
      <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
      <span>
        El catálogo de {recurso} no está disponible: el backend aún no expone este endpoint.
      </span>
    </div>
  );
}
