import { useTiposItem } from '../hooks/useTiposItem';
import { getApiErrorMessage } from '../../../shared/utils/api-error';

export default function TiposItemPanel() {
  const { data: tiposItem = [], isLoading, isError, error } = useTiposItem();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" aria-live="polite" aria-busy="true">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
        >
          <span className="sr-only">Cargando tipos de ítem...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="rounded-lg border border-danger p-4 text-sm text-danger">
        <p className="font-medium">No se pudieron cargar los tipos de ítem</p>
        <p>{getApiErrorMessage(error, 'Intenta nuevamente más tarde.')}</p>
      </div>
    );
  }

  if (tiposItem.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-on-surface-secondary">
        No hay tipos de ítem registrados
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm" aria-label="Tipos de ítem">
        <thead className="bg-surface-secondary text-on-surface-secondary">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
            <th scope="col" className="px-4 py-3 font-medium">Descripción</th>
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
