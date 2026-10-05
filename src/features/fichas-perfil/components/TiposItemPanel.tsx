import { Tags } from 'lucide-react';
import { useTiposItem } from '../hooks/useTiposItem';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';

export default function TiposItemPanel() {
  const { data: tiposItem = [], isLoading, isError, error, refetch } = useTiposItem();

  if (isLoading) {
    return <Skeleton variante="tarjetas" etiqueta="Cargando tipos de ítem…" />;
  }

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudieron cargar los tipos de ítem"
        descripcion={getApiErrorMessage(error, 'Intenta nuevamente más tarde.')}
        onReintentar={refetch}
      />
    );
  }

  if (tiposItem.length === 0) {
    return <EmptyState icono={Tags} titulo="No hay tipos de ítem registrados" />;
  }

  return (
    <ul aria-label="Tipos de ítem" className="flex flex-col gap-3">
      {tiposItem.map((tipo) => (
        <li key={tipo.id} className="flex flex-col gap-0.5 rounded-xl border border-border p-3.5">
          <span className="text-sm font-semibold break-words text-on-surface">{tipo.nombre}</span>
          <span className="text-sm break-words text-on-surface-secondary">{tipo.descripcion}</span>
        </li>
      ))}
    </ul>
  );
}
