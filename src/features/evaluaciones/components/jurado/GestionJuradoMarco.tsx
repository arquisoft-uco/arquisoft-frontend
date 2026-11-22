import type { ReactNode } from 'react';
import { ClipboardX } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEvaluacionAsignadaJurado } from '../../hooks/useEvaluacionAsignadaJurado';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';

const RAIZ = 'flex flex-col gap-6';

interface Props {
  titulo: string;
  evaluacionJuradoId: string;
  children: (asignacion: EvaluacionAsignadaJurado, onVolver: () => void) => ReactNode;
}

export default function GestionJuradoMarco({ titulo, evaluacionJuradoId, children }: Props) {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } =
    useEvaluacionAsignadaJurado(evaluacionJuradoId);
  const rutaListado = `/evaluaciones${search}`;
  const asignacion = data ?? undefined;
  const descripcion = asignacion
    ? `${asignacion.entregable.proyecto} · versión ${asignacion.entregable.version}`
    : undefined;

  function volver() {
    navigate(rutaListado);
  }

  function contenido() {
    if (isLoading) return <Skeleton variante="tabla" etiqueta="Cargando la evaluación" />;
    if (isError) {
      return (
        <ErrorState
          titulo="No se pudo cargar la evaluación"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={() => void refetch()}
        />
      );
    }
    if (!asignacion) {
      return (
        <EmptyState
          icono={ClipboardX}
          titulo="Esta evaluación no está entre tus asignaciones"
          descripcion="Puede que ya no esté disponible. Vuelve a tu lista para elegir otra."
          accion={
            <Button variante="secundario" onClick={volver}>
              Volver a mis evaluaciones
            </Button>
          }
        />
      );
    }
    return children(asignacion, volver);
  }

  return (
    <div className={RAIZ}>
      <PageHeader
        titulo={titulo}
        descripcion={descripcion}
        migas={[{ etiqueta: 'Evaluaciones', to: rutaListado }, { etiqueta: titulo }]}
      />
      {contenido()}
    </div>
  );
}
