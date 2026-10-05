import { ClipboardCheck } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';
import { useEvaluacionFicha } from '../../hooks/useEvaluacionFicha';
import { FechaDeEstado } from '../FichaCeldas';
import AgregarEstadoEvaluacionPanel from './AgregarEstadoEvaluacionPanel';
import AgregarObservacionEvaluacionPanel from './AgregarObservacionEvaluacionPanel';
import EstadosEvaluacionPanel from './EstadosEvaluacionPanel';
import IniciarEvaluacionBoton from './IniciarEvaluacionBoton';

const TARJETA = 'flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-card';
const CABECERA = 'flex flex-wrap items-center gap-3';
const DATO = 'text-sm text-on-surface-secondary';

interface Props {
  fichaPerfilId: string;
}

export default function RegistrarEvaluacionPanel({ fichaPerfilId }: Props) {
  const { data: evaluaciones, isLoading, isError, refetch } = useEvaluacionFicha(fichaPerfilId);

  if (isLoading) return <Skeleton variante="tarjetas" etiqueta="Cargando evaluación…" />;

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudo cargar la evaluación"
        descripcion="Inténtalo nuevamente."
        onReintentar={refetch}
      />
    );
  }

  // El backend ordena por fechaCreacion ascendente (CA-9 de HU-182): la última es la vigente.
  const vigente = evaluaciones?.[evaluaciones.length - 1];

  if (!vigente) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          icono={ClipboardCheck}
          titulo="Aún no se ha iniciado la evaluación"
          descripcion="Inicia la evaluación para registrar su estado y sus observaciones."
          accion={<IniciarEvaluacionBoton fichaPerfilId={fichaPerfilId} />}
        />
        <EstadosEvaluacionPanel />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div className={TARJETA}>
        <div className={CABECERA}>
          <ClipboardCheck size={20} className="shrink-0 text-primary" aria-hidden />
          <p className="text-sm font-semibold text-on-surface">Evaluación registrada</p>
          <Badge
            variante={
              vigente.estadoEvaluacionId
                ? varianteEstadoEvaluacion(vigente.estadoEvaluacionId)
                : 'neutro'
            }
          >
            {vigente.estadoEvaluacionNombre ?? 'Sin estado'}
          </Badge>
        </div>
        <p className={DATO}>
          Creada el <FechaDeEstado iso={vigente.fechaCreacion} />
        </p>
      </div>
      <AgregarEstadoEvaluacionPanel evaluacionId={vigente.id} fichaPerfilId={fichaPerfilId} />
      <AgregarObservacionEvaluacionPanel evaluacionId={vigente.id} />
      <EstadosEvaluacionPanel />
    </div>
  );
}
