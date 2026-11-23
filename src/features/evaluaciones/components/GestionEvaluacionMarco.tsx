import type { ReactNode } from 'react';
import { ClipboardX } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';

const RAIZ = 'flex flex-col gap-6';

interface AsignacionConEntregable {
  entregable: { proyecto: string; version: number };
}

interface ConsultaAsignacion<T> {
  data: T | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface Props<T extends AsignacionConEntregable> {
  titulo: string;
  asignacionId: string;
  usarAsignacion: (asignacionId: string) => ConsultaAsignacion<T>;
  children: (asignacion: T, onVolver: () => void) => ReactNode;
}

export default function GestionEvaluacionMarco<T extends AsignacionConEntregable>({
  titulo,
  asignacionId,
  usarAsignacion,
  children,
}: Props<T>) {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = usarAsignacion(asignacionId);
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
