import { useState } from 'react';
import { ClipboardCheck, MessageSquare } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEvaluacionesFichaCoordinador } from '../../hooks/useEvaluacionesFichaCoordinador';
import type { EvaluacionFichaPerfilEstudiante } from '../../models/EvaluacionFichaPerfilEstudiante';
import TarjetaEvaluacionFicha from '../TarjetaEvaluacionFicha';
import ObservacionesEvaluacionCoordinadorPanel from './ObservacionesEvaluacionCoordinadorPanel';

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
  const [abierta, setAbierta] = useState<EvaluacionFichaPerfilEstudiante | null>(null);

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
            <TarjetaEvaluacionFicha key={evaluacion.id} evaluacion={evaluacion}>
              <Button
                variante="secundario"
                tamano="sm"
                icono={MessageSquare}
                onClick={() => setAbierta(evaluacion)}
              >
                Ver observaciones
              </Button>
            </TarjetaEvaluacionFicha>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className={CONTENIDO}>
      {contenido()}
      {abierta && (
        <ObservacionesEvaluacionCoordinadorPanel
          evaluacion={abierta}
          onCerrar={() => setAbierta(null)}
        />
      )}
    </div>
  );
}
