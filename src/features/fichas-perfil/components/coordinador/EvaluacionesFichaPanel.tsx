import { ClipboardCheck } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEvaluacionesFichaCoordinador } from '../../hooks/useEvaluacionesFichaCoordinador';
import type { FichaPerfil } from '../../models/FichaPerfil';
import TarjetaEvaluacionFicha from '../TarjetaEvaluacionFicha';

const CONTENIDO = 'flex flex-col gap-4';
const TOTAL = 'text-sm text-on-surface-secondary';

interface Props {
  ficha: FichaPerfil;
  onCerrar: () => void;
}

function textoTotal(total: number): string {
  return `${total} ${total === 1 ? 'evaluación' : 'evaluaciones'}`;
}

export default function EvaluacionesFichaPanel({ ficha, onCerrar }: Props) {
  const { data, isLoading, isError, error, refetch } = useEvaluacionesFichaCoordinador(ficha.id);

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
        <p aria-live="polite" className={TOTAL}>
          {textoTotal(evaluaciones.length)}
        </p>
        <ul className="flex flex-col gap-3">
          {evaluaciones.map((evaluacion) => (
            <TarjetaEvaluacionFicha key={evaluacion.id} evaluacion={evaluacion} />
          ))}
        </ul>
      </>
    );
  }

  return (
    <SidePanel
      titulo="Evaluaciones de la ficha"
      descripcion={ficha.tituloProyecto}
      onCerrar={onCerrar}
      pie={(solicitarCierre) => <FormActions onCancelar={solicitarCierre} />}
    >
      <div className={CONTENIDO}>{contenido()}</div>
    </SidePanel>
  );
}
