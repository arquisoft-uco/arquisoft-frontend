import { Tags } from 'lucide-react';
import { useTiposItem } from '../hooks/useTiposItem';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';

export default function TiposItemPanel() {
  const { data: tiposItem = [], isLoading, isError, error, refetch } = useTiposItem();

  if (isLoading) {
    return <Skeleton variante="tabla" etiqueta="Cargando tipos de ítem..." />;
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
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm" aria-label="Tipos de ítem">
        <thead className="bg-surface-secondary text-on-surface-secondary">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Nombre
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Descripción
            </th>
          </tr>
        </thead>
        <tbody>
          {tiposItem.map((t) => (
            <tr key={t.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium text-on-surface">{t.nombre}</td>
              <td className="px-4 py-3 text-on-surface-secondary">{t.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
