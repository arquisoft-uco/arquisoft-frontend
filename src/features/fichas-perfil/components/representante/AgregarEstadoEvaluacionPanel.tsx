import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import { useEstadosEvaluacion } from '../../hooks/useEstadosEvaluacion';
import { useAgregarEstadoEvaluacion } from '../../hooks/useAgregarEstadoEvaluacion';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';

const ESTADOS_SELECCIONABLES_IDS = new Set([
  'APROBADA',
  'APROBADA_CON_OBSERVACIONES',
  'NO_APROBADA',
]);

const schema = z.object({
  estadoEvaluacion: textoRequerido(LIMITES.ESTADO_EVALUACION_ID_MAX),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  evaluacionId: string;
  fichaPerfilId: string;
}

export default function AgregarEstadoEvaluacionPanel({ evaluacionId, fichaPerfilId }: Props) {
  const [confirmarAbierto, setConfirmarAbierto] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { estadoEvaluacion: '' },
    mode: 'onChange',
  });

  const {
    data: todosEstados = [],
    isLoading: cargandoEstados,
    isError: errorEstados,
  } = useEstadosEvaluacion();
  const {
    mutate,
    reset: resetMutacion,
    isPending,
    isError: isErrorMutacion,
    error,
  } = useAgregarEstadoEvaluacion(fichaPerfilId);

  const estados = todosEstados.filter((e) => ESTADOS_SELECCIONABLES_IDS.has(e.id));
  const estadoSeleccionadoId = watch('estadoEvaluacion');
  const estadoSeleccionado = estados.find((e) => e.id === estadoSeleccionadoId);

  function handleAbrir() {
    setConfirmarAbierto(true);
  }

  function handleCancelar() {
    setConfirmarAbierto(false);
    resetMutacion();
  }

  function registrar(values: FormValues) {
    mutate(
      { evaluacionFichaPerfilId: evaluacionId, estadoEvaluacionId: values.estadoEvaluacion },
      {
        onSuccess: () => {
          toast.success(
            'Estado registrado',
            `Se registró el estado "${estadoSeleccionado?.nombre ?? ''}" de la evaluación.`,
          );
          setConfirmarAbierto(false);
          reset();
        },
        onError: (err) => {
          toast.error(
            'Error al registrar el estado',
            getApiErrorMessage(err, 'Ocurrió un error al registrar el estado. Intenta nuevamente.'),
          );
          setConfirmarAbierto(false);
        },
      },
    );
  }

  if (cargandoEstados) {
    return (
      <div className="flex items-center justify-center py-6" aria-live="polite" aria-busy="true">
        <div
          className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
        >
          <span className="sr-only">Cargando estados...</span>
        </div>
      </div>
    );
  }

  if (errorEstados) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-center" role="alert">
        <p className="text-sm text-on-surface-secondary">
          No se pudieron cargar los estados disponibles. Intenta nuevamente.
        </p>
      </div>
    );
  }

  const sinEstados = estados.length === 0;

  return (
    <>
      <form
        onSubmit={handleSubmit(handleAbrir)}
        noValidate
        className="rounded-xl border border-border bg-surface p-4 space-y-3 animate-fade-up"
      >
        <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <PlusCircle size={16} className="text-primary" aria-hidden />
          Registrar nuevo estado
        </h4>

        {sinEstados ? (
          <p className="text-sm text-on-surface-secondary">
            No hay estados disponibles para registrar
          </p>
        ) : (
          <div>
            <label htmlFor="estado-evaluacion-select" className="field-label">
              Estado
            </label>
            <select
              id="estado-evaluacion-select"
              className="field-input"
              aria-invalid={!!errors.estadoEvaluacion}
              aria-describedby={errors.estadoEvaluacion ? 'estado-evaluacion-error' : undefined}
              disabled={isPending}
              {...register('estadoEvaluacion')}
            >
              <option value="">Selecciona un estado...</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
            {errors.estadoEvaluacion && (
              <p id="estado-evaluacion-error" className="field-error" role="alert">
                {errors.estadoEvaluacion.message}
              </p>
            )}
          </div>
        )}

        {isErrorMutacion && (
          <p className="text-sm text-danger" role="alert">
            {getApiErrorMessage(error, 'Ocurrió un error al registrar el estado. Intenta nuevamente.')}
          </p>
        )}

        <div className="actions-row sm:justify-end">
          <button
            type="submit"
            disabled={!isValid || isPending || sinEstados}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            <PlusCircle size={15} aria-hidden />
            {isPending ? 'Registrando...' : 'Registrar estado'}
          </button>
        </div>
      </form>

      {confirmarAbierto && (
        <ConfirmDialog
          titulo="Registrar estado de evaluación"
          descripcion={`¿Confirmas registrar el estado "${estadoSeleccionado?.nombre ?? ''}" para esta evaluación?`}
          labelConfirmar="Registrar estado"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={handleSubmit(registrar)}
          onCancelar={handleCancelar}
        />
      )}
    </>
  );
}
