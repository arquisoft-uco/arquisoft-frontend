import { CalendarClock, Trash2 } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { ConsultaPlanEstimado } from '../../hooks/usePlanEstimadoTarea';
import { formatearDias } from '../../utils/plan-estimado';

const DATO = 'flex flex-col gap-1';
const ETIQUETA = 'text-sm text-on-surface-secondary';
const VALOR = 'break-words text-base font-medium text-on-surface';

interface Props {
  consulta: ConsultaPlanEstimado;
  onAgregar: () => void;
  onEditar: () => void;
  puedeEliminar: boolean;
  onEliminar: () => void;
}

export default function PlanEstimadoTareaSeccion({
  consulta,
  onAgregar,
  onEditar,
  puedeEliminar,
  onEliminar,
}: Props) {
  const { plan, cargando, hayError, reintentar } = consulta;

  if (cargando) return <Skeleton variante="lineas" etiqueta="Cargando el plan estimado…" />;
  if (hayError) {
    return (
      <ErrorState titulo="No pudimos cargar el plan estimado" onReintentar={() => reintentar()} />
    );
  }
  if (!plan) {
    return (
      <EmptyState
        icono={CalendarClock}
        titulo="Esta tarea aún no tiene plan estimado"
        descripcion="Indica en cuántos días calculas terminarla para que tu asesor pueda seguirla."
        accion={<Button onClick={onAgregar}>Agregar plan estimado</Button>}
      />
    );
  }

  return (
    <section
      aria-labelledby="plan-estimado-titulo"
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <div className="section-header">
        <h2 id="plan-estimado-titulo" className="text-lg font-semibold text-on-surface">
          Plan estimado
        </h2>
        <Button
          variante="secundario"
          icono={CalendarClock}
          className="header-action"
          onClick={onEditar}
        >
          Editar plan estimado
        </Button>
        {puedeEliminar && (
          <Button
            variante="peligroContorno"
            icono={Trash2}
            className="header-action"
            onClick={onEliminar}
          >
            Remover plan estimado
          </Button>
        )}
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className={DATO}>
          <dt className={ETIQUETA}>Días estimados</dt>
          <dd className={VALOR}>{formatearDias(plan.tiempoEstimadoDias)}</dd>
        </div>
        <div className={DATO}>
          <dt className={ETIQUETA}>Descripción</dt>
          <dd className={`${VALOR} whitespace-pre-line`}>
            {plan.descripcionEstimado ?? 'Sin descripción'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
