import { ClipboardCheck, Pencil } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { ConsultaPlanReal } from '../../hooks/usePlanRealTarea';
import { formatearDias } from '../../utils/plan-estimado';

const DATO = 'flex flex-col gap-1';
const ETIQUETA = 'text-sm text-on-surface-secondary';
const VALOR = 'break-words text-base font-medium text-on-surface';

interface Props {
  consulta: ConsultaPlanReal;
  onEditar: () => void;
}

export default function PlanRealTareaSeccion({ consulta, onEditar }: Props) {
  const { plan, cargando, hayError, reintentar } = consulta;

  if (cargando) return <Skeleton variante="lineas" etiqueta="Cargando el plan real…" />;
  if (hayError) {
    return <ErrorState titulo="No pudimos cargar el plan real" onReintentar={() => reintentar()} />;
  }
  if (!plan) {
    return (
      <EmptyState
        icono={ClipboardCheck}
        titulo="Esta tarea aún no tiene plan real"
        descripcion="Aquí verás los días reales que tomó terminarla."
      />
    );
  }

  return (
    <section
      aria-labelledby="plan-real-titulo"
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <div className="section-header">
        <h2 id="plan-real-titulo" className="text-lg font-semibold text-on-surface">
          Plan real
        </h2>
        <Button variante="secundario" icono={Pencil} className="header-action" onClick={onEditar}>
          Editar plan real
        </Button>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className={DATO}>
          <dt className={ETIQUETA}>Días reales</dt>
          <dd className={VALOR}>{formatearDias(plan.tiempoRealDias)}</dd>
        </div>
        <div className={DATO}>
          <dt className={ETIQUETA}>Descripción</dt>
          <dd className={`${VALOR} whitespace-pre-line`}>
            {plan.descripcionReal ?? 'Sin descripción'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
