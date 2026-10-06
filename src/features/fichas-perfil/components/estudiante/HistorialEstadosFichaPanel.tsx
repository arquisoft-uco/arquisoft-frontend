import { History } from 'lucide-react';
import { useEstadosFichaPerfilEstudiante } from '../../hooks/useEstadosFichaPerfilEstudiante';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import LineaTiempoEstados from '../LineaTiempoEstados';

export default function HistorialEstadosFichaPanel() {
  const { historial, isLoading, cargado, isError, error, refetch, fichaPerfilIdDisponible } =
    useEstadosFichaPerfilEstudiante();

  if (!fichaPerfilIdDisponible) {
    return <AvisoNoDisponible recurso="historial de estados de tu ficha de perfil" />;
  }

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

  if (isLoading || !cargado) {
    return <Skeleton variante="lineas" etiqueta="Cargando historial de estados…" />;
  }

  if (historial.length === 0) {
    return <EmptyState icono={History} titulo="Tu ficha aún no tiene estados registrados" />;
  }

  return <LineaTiempoEstados historial={historial} />;
}
