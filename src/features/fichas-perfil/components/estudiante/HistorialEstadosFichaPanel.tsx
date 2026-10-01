import { useEstadosFichaPerfilEstudiante } from '../../hooks/useEstadosFichaPerfilEstudiante';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export default function HistorialEstadosFichaPanel() {
  const { historial, isLoading, isError, error, fichaPerfilIdDisponible } =
    useEstadosFichaPerfilEstudiante();

  if (!fichaPerfilIdDisponible) {
    return <AvisoNoDisponible recurso="historial de estados de tu ficha de perfil" />;
  }

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="py-8 text-center text-sm text-on-surface-secondary"
      >
        <span className="sr-only">Cargando historial de estados</span>
        <span
          aria-hidden
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="rounded-lg border border-danger p-3 text-sm text-danger">
        {getApiErrorMessage(error, 'No se pudo cargar el historial de estados.')}
      </div>
    );
  }

  return (
    <section aria-labelledby="historial-estados-titulo" className="space-y-3">
      <h3 id="historial-estados-titulo" className="text-sm font-semibold text-on-surface">
        Historial de estados
      </h3>
      {historial.length === 0 ? (
        <p className="text-sm text-on-surface-secondary">
          Tu ficha aún no tiene estados registrados.
        </p>
      ) : (
        <ul className="space-y-2">
          {historial.map((estado, indice) => (
            <li
              key={estado.id + estado.fechaActualizacion}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface p-3"
            >
              <span className="flex items-center gap-2 text-sm text-on-surface">
                {estado.nombre}
                {indice === 0 && (
                  <span className="rounded bg-primary-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                    Actual
                  </span>
                )}
              </span>
              <time dateTime={estado.fechaActualizacion} className="text-xs text-on-surface-secondary">
                {formatoFecha.format(new Date(estado.fechaActualizacion))}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
