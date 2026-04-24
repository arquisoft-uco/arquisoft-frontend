import { useEstadosMiFicha } from '../../hooks/useEstadosMiFicha';

const IDS_ESTADOS_PERMITIDOS_ESTUDIANTE = ['ef-1', 'ef-2'];

export default function EstadosMiFichaPanel() {
  const { estados, catalogoEstados, agregar } = useEstadosMiFicha();

  const getNombreEstado = (estadoFichaId: string) =>
    catalogoEstados.find((e) => e.id === estadoFichaId)?.nombre ?? estadoFichaId;

  const handleCambiarEstado = (estadoFichaId: string) => {
    agregar.mutate({ estadoFichaId });
  };

  const estadosDisponibles = catalogoEstados.filter((e) =>
    IDS_ESTADOS_PERMITIDOS_ESTUDIANTE.includes(e.id),
  );

  const estadosOrdenados = [...estados].sort(
    (a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime(),
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-on-surface">Estados de la Ficha</h3>

      <div className="flex flex-wrap gap-2">
        {estadosDisponibles.map((ef) => (
          <button
            key={ef.id}
            type="button"
            onClick={() => handleCambiarEstado(ef.id)}
            disabled={agregar.isPending}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-primary-muted hover:text-primary disabled:opacity-50"
          >
            Cambiar a: {ef.nombre}
          </button>
        ))}
      </div>

      <div className="space-y-2" aria-live="polite">
        {estadosOrdenados.map((est) => (
          <div
            key={est.id}
            className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
          >
            <span className="text-sm font-medium text-on-surface">
              {getNombreEstado(est.estadoFichaId)}
            </span>
            <span className="text-xs text-on-surface-secondary">
              {new Date(est.fechaActualizacion).toLocaleDateString('es-CO')}
            </span>
          </div>
        ))}
        {estadosOrdenados.length === 0 && (
          <p className="py-8 text-center text-sm text-on-surface-secondary">
            No hay estados registrados
          </p>
        )}
      </div>
    </div>
  );
}
