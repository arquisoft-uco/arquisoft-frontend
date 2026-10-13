import { History } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import LineaTiempo from '../../../../shared/components/ui/LineaTiempo';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { varianteEstadoProyecto } from '../../../../shared/utils/estado-variante';
import { useEstadosProyectoGrado } from '../../hooks/useEstadosProyectoGrado';

interface Props {
  proyectoGradoId: string;
}

export default function HistorialEstadosProyectoPanel({ proyectoGradoId }: Props) {
  const { data, isLoading, isError, error, refetch } = useEstadosProyectoGrado(proyectoGradoId);

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudo cargar el historial de estados"
        descripcion="Inténtalo nuevamente."
        detalle={getApiErrorMessage(error, 'No se pudo cargar el historial de estados.')}
        onReintentar={refetch}
      />
    );
  }
  if (isLoading || !data) {
    return <Skeleton variante="lineas" etiqueta="Cargando historial de estados…" />;
  }
  if (data.length === 0) {
    return <EmptyState icono={History} titulo="Este proyecto aún no tiene estados registrados" />;
  }

  const pasos = data.map((h) => ({
    id: h.estado.id,
    nombre: h.estado.nombre,
    variante: varianteEstadoProyecto(h.estado.id),
    fecha: h.fechaActualizacion,
  }));

  return <LineaTiempo etiqueta="Historial de estados del proyecto de grado" pasos={pasos} />;
}
