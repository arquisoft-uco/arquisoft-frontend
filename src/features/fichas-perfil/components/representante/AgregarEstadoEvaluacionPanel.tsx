import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useEstadosEvaluacion } from '../../hooks/useEstadosEvaluacion';
import { useAgregarEstadoEvaluacion } from '../../hooks/useAgregarEstadoEvaluacion';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import PageSkeleton from '../../../../shared/components/PageSkeleton';

const ESTADOS_PERMITIDOS = new Set(['Aprobada', 'Aprobada Con Observaciones', 'No Aprobada']);

interface Props {
  evaluacionId: string;
  fichaPerfilId: string;
}

export default function AgregarEstadoEvaluacionPanel({ evaluacionId, fichaPerfilId }: Props) {
  const [estadoSeleccionadoId, setEstadoSeleccionadoId] = useState('');
  const [confirmarAbierto, setConfirmarAbierto] = useState(false);

  const { data: todosEstados = [], isLoading: cargandoEstados, isError: errorEstados } = useEstadosEvaluacion();
  const estados = todosEstados.filter((e) => ESTADOS_PERMITIDOS.has(e.nombre));
  const { mutate, isPending, isError: isErrorMutacion, error } = useAgregarEstadoEvaluacion(fichaPerfilId);

  function handleAbrir() {
    if (!estadoSeleccionadoId) return;
    setConfirmarAbierto(true);
  }

  function handleConfirmar() {
    mutate(
      {
        req: { evaluacionFichaPerfilId: evaluacionId, estadoEvaluacionId: estadoSeleccionadoId },
        estadoNombre: estadoSeleccionado?.nombre ?? '',
      },
      {
        onSuccess: () => {
          setConfirmarAbierto(false);
          setEstadoSeleccionadoId('');
        },
        onError: () => {
          setConfirmarAbierto(false);
        },
      },
    );
  }

  if (cargandoEstados) return <PageSkeleton />;

  if (errorEstados) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-center" role="alert">
        <p className="text-sm text-on-surface-secondary">
          No se pudieron cargar los estados disponibles. Intenta nuevamente.
        </p>
      </div>
    );
  }

  const estadoSeleccionado = estados.find((e) => e.id === estadoSeleccionadoId);

  return (
    <>
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3 animate-fade-up">
        <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <PlusCircle size={16} className="text-primary" aria-hidden />
          Registrar nuevo estado
        </h4>

        <div className="space-y-2">
          <label htmlFor="estado-evaluacion-select" className="text-xs text-on-surface-secondary">
            Estado
          </label>
          <select
            id="estado-evaluacion-select"
            value={estadoSeleccionadoId}
            onChange={(e) => setEstadoSeleccionadoId(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecciona un estado...</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>

        {isErrorMutacion && (
          <p className="text-sm text-danger" role="alert">
            {(error as Error)?.message?.includes('409')
              ? 'Ya existe un estado igual para esta evaluación.'
              : 'Ocurrió un error al registrar el estado. Intenta nuevamente.'}
          </p>
        )}

        <button
          type="button"
          onClick={handleAbrir}
          disabled={!estadoSeleccionadoId || isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          <PlusCircle size={15} aria-hidden />
          {isPending ? 'Registrando...' : 'Registrar estado'}
        </button>
      </div>

      {confirmarAbierto && (
        <ConfirmDialog
          titulo="Registrar estado de evaluación"
          descripcion={`¿Confirmas registrar el estado "${estadoSeleccionado?.nombre ?? ''}" para esta evaluación?`}
          labelConfirmar="Registrar estado"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={handleConfirmar}
          onCancelar={() => setConfirmarAbierto(false)}
        />
      )}
    </>
  );
}
