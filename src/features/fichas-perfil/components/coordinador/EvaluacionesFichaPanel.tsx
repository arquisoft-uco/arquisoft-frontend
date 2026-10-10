import { ClipboardCheck } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEvaluacionesFichaCoordinador } from '../../hooks/useEvaluacionesFichaCoordinador';
import TarjetaEvaluacionFicha from '../TarjetaEvaluacionFicha';

const CONTENIDO = 'flex flex-col gap-4';
const TOTAL = 'text-sm text-on-surface-secondary';

interface Props {
  fichaPerfilId: string;
}

function textoTotal(total: number): string {
  return `${total} ${total === 1 ? 'evaluación' : 'evaluaciones'}`;
}

export default function EvaluacionesFichaPanel({ fichaPerfilId }: Props) {
  const { data, isLoading, isError, error, refetch } =
    useEvaluacionesFichaCoordinador(fichaPerfilId);

  const evaluaciones = data ?? [];

  function contenido() {
    if (isLoading) {
      return <Skeleton variante="tarjetas" etiqueta="Cargando evaluaciones…" />;
    }
    if (isError) {
      return (
        <ErrorState
          titulo="No pudimos cargar las evaluaciones"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={refetch}
        />
      );
    }
    if (evaluaciones.length === 0) {
      return (
        <EmptyState
          icono={ClipboardCheck}
          titulo="Esta ficha aún no tiene evaluaciones"
          descripcion="Cuando el comité de currículum la evalúe, las verás aquí."
        />
      );
    }

    return (
      <>
        <p className={TOTAL}>{textoTotal(evaluaciones.length)}</p>
        <ul className="flex flex-col gap-3">
          {evaluaciones.map((evaluacion) => (
            <TarjetaEvaluacionFicha key={evaluacion.id} evaluacion={evaluacion} />
          ))}
        </ul>
      </>
    );
  }

  return <div className={CONTENIDO}>{contenido()}</div>;
}
