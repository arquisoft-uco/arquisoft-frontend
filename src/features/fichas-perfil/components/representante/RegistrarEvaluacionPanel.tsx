import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useRegistrarEvaluacion } from '../../hooks/useRegistrarEvaluacion';
import { useEvaluacionFicha } from '../../hooks/useEvaluacionFicha';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import EstadosEvaluacionPanel from './EstadosEvaluacionPanel';
import type { EvaluacionCreadaResponse } from '../../models/fichas-perfil';

interface Props {
  fichaPerfilId: string;
}

export default function RegistrarEvaluacionPanel({ fichaPerfilId }: Props) {
  const [confirmarAbierto, setConfirmarAbierto] = useState(false);
  const [evaluacionCreada, setEvaluacionCreada] = useState<EvaluacionCreadaResponse | null>(null);

  const { data: evaluacionServidor, isLoading, isError: isErrorConsulta } = useEvaluacionFicha(fichaPerfilId);
  const { mutate, isPending, isError: isErrorMutacion, error } = useRegistrarEvaluacion(fichaPerfilId);

  function handleIniciar() {
    setConfirmarAbierto(true);
  }

  function handleConfirmar() {
    mutate(undefined, {
      onSuccess: (data) => {
        setEvaluacionCreada(data);
        setConfirmarAbierto(false);
      },
      onError: () => {
        setConfirmarAbierto(false);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10" aria-live="polite" aria-busy="true">
        <div
          className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
        >
          <span className="sr-only">Cargando evaluación...</span>
        </div>
      </div>
    );
  }

  if (isErrorConsulta) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
        <p className="text-sm text-on-surface-secondary">
          No se pudo cargar la evaluación. Intenta nuevamente.
        </p>
      </div>
    );
  }

  const evaluacionMostrar = evaluacionServidor ?? evaluacionCreada ?? null;

  if (evaluacionMostrar) {
    return (
      <div className="space-y-4 animate-fade-up">
        <div
          className="rounded-xl border border-border bg-surface p-4 space-y-3"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <ClipboardCheck size={20} className="shrink-0 text-primary" aria-hidden />
            <p className="text-sm font-semibold text-on-surface">Evaluación registrada</p>
            <span className="ml-auto inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {evaluacionMostrar.estadoActual}
            </span>
          </div>
          <div className="space-y-1 pl-8">
            <p className="text-xs text-on-surface-secondary break-all">
              <span className="font-medium">ID:</span> {evaluacionMostrar.id}
            </p>
            <p className="text-xs text-on-surface-secondary">
              <span className="font-medium">Fecha de creación:</span> {evaluacionMostrar.fechaCreacion}
            </p>
          </div>
        </div>
        <EstadosEvaluacionPanel />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center space-y-4">
          <ClipboardCheck size={32} className="mx-auto text-on-surface-secondary" aria-hidden />
          <p className="text-sm text-on-surface-secondary">
            Aún no se ha iniciado la evaluación para esta ficha.
          </p>

          {isErrorMutacion && (
            <p className="text-sm text-danger" role="alert">
              {(error as Error)?.message?.includes('409')
                ? 'Ya existe una evaluación para esta ficha.'
                : 'Ocurrió un error al registrar la evaluación. Intenta nuevamente.'}
            </p>
          )}

          <button
            type="button"
            onClick={handleIniciar}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            <ClipboardCheck size={16} aria-hidden />
            Iniciar evaluación
          </button>
        </div>

        <EstadosEvaluacionPanel />
      </div>

      {confirmarAbierto && (
        <ConfirmDialog
          titulo="¿Iniciar evaluación?"
          descripcion="Se registrará una nueva evaluación para esta ficha de perfil. Esta acción no se puede deshacer."
          labelConfirmar="Iniciar evaluación"
          labelCancelar="Cancelar"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={handleConfirmar}
          onCancelar={() => setConfirmarAbierto(false)}
        />
      )}
    </>
  );
}
