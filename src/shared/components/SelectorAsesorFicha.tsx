import { useAsesoresFichaVigentes } from '../hooks/useAsesoresFichaVigentes';
import AvisoNoDisponible from './AvisoNoDisponible';

interface Props {
  value: string;
  onChange: (id: string) => void;
  idsExcluidos?: string[];
  soloLectura?: boolean;
  id?: string;
  placeholder?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

export default function SelectorAsesorFicha({
  value,
  onChange,
  idsExcluidos = [],
  soloLectura = false,
  id,
  placeholder,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,
}: Props) {
  const { data: asesores = [], isLoading, isError } = useAsesoresFichaVigentes();

  if (isLoading) {
    return (
      <p
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="text-xs text-on-surface-secondary"
      >
        <span className="sr-only">Cargando asesores disponibles…</span>
        Cargando asesores...
      </p>
    );
  }

  if (isError) {
    return <AvisoNoDisponible recurso="asesores" />;
  }

  if (soloLectura) {
    const nombre = asesores.find((a) => a.id === value)?.nombre ?? 'Cargando...';
    return (
      <div
        id={id}
        className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-on-surface-secondary"
      >
        {nombre}
      </div>
    );
  }

  const opciones = asesores.filter((a) => !idsExcluidos.includes(a.id));

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={opciones.length === 0}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
      aria-label={ariaLabel}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-danger disabled:opacity-50"
    >
      <option value="">{placeholder ?? 'Sin asesores disponibles'}</option>
      {opciones.map((a) => (
        <option key={a.id} value={a.id}>
          {a.nombre} — {a.email}
        </option>
      ))}
    </select>
  );
}
