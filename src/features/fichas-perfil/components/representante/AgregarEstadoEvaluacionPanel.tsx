import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import { useAgregarEstadoEvaluacion } from '../../hooks/useAgregarEstadoEvaluacion';
import { useEstadosEvaluacion } from '../../hooks/useEstadosEvaluacion';
import SelectorEstadoEvaluacion from './SelectorEstadoEvaluacion';

const ESTADOS_SELECCIONABLES_IDS = new Set([
  'APROBADA',
  'APROBADA_CON_OBSERVACIONES',
  'NO_APROBADA',
]);

const schema = z.object({
  estadoEvaluacion: textoRequerido(LIMITES.ESTADO_EVALUACION_ID_MAX),
});
type FormValues = z.infer<typeof schema>;

const ETIQUETAS = { estadoEvaluacion: 'Estado' };
const TARJETA =
  'flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 animate-fade-up';
const TITULO = 'flex items-center gap-2 text-sm font-semibold text-on-surface';

interface Props {
  evaluacionId: string;
  fichaPerfilId: string;
}

export default function AgregarEstadoEvaluacionPanel({ evaluacionId, fichaPerfilId }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setFocus,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { estadoEvaluacion: '' },
    mode: 'onTouched',
  });
  const { data: todosEstados = [], isLoading, isError } = useEstadosEvaluacion();
  const { mutate, reset: resetMutacion, isPending } = useAgregarEstadoEvaluacion(fichaPerfilId);

  const estados = todosEstados.filter((e) => ESTADOS_SELECCIONABLES_IDS.has(e.id));
  const seleccionado = estados.find((e) => e.id === watch('estadoEvaluacion'));

  function cancelar() {
    setConfirmando(false);
    resetMutacion();
  }

  function registrar(values: FormValues) {
    mutate(
      { evaluacionFichaPerfilId: evaluacionId, estadoEvaluacionId: values.estadoEvaluacion },
      {
        onSuccess: () => {
          toast.success(
            'Estado registrado',
            `Se registró el estado "${seleccionado?.nombre ?? ''}" de la evaluación.`,
          );
          setConfirmando(false);
          reset();
        },
        onError: (err) => {
          toast.error(
            'Error al registrar el estado',
            getApiErrorMessage(err, 'Ocurrió un error al registrar el estado. Intenta nuevamente.'),
          );
          setConfirmando(false);
        },
      },
    );
  }

  if (isLoading) return <Skeleton variante="formulario" etiqueta="Cargando estados…" />;

  if (isError) {
    return (
      <Notice variante="peligro">
        No se pudieron cargar los estados disponibles. Intenta nuevamente.
      </Notice>
    );
  }

  const sinEstados = estados.length === 0;

  return (
    <>
      <form onSubmit={handleSubmit(() => setConfirmando(true))} noValidate className={TARJETA}>
        <h4 className={TITULO}>
          <PlusCircle size={16} className="text-primary" aria-hidden />
          Registrar nuevo estado
        </h4>

        {isSubmitted && (
          <ErrorSummary
            errores={resumirErrores(errors, ETIQUETAS)}
            onIrAlCampo={() => setFocus('estadoEvaluacion')}
          />
        )}

        {sinEstados ? (
          <Notice variante="info">No hay estados disponibles para registrar</Notice>
        ) : (
          <SelectorEstadoEvaluacion
            estados={estados}
            error={errors.estadoEvaluacion?.message}
            deshabilitado={isPending}
            registro={register('estadoEvaluacion')}
          />
        )}

        <div className="actions-row sm:justify-end">
          <Button type="submit" icono={PlusCircle} disabled={sinEstados} cargando={isPending}>
            {isPending ? 'Registrando...' : 'Registrar estado'}
          </Button>
        </div>
      </form>

      {confirmando && (
        <ConfirmDialog
          titulo="Registrar estado de evaluación"
          descripcion={`¿Confirmas registrar el estado "${seleccionado?.nombre ?? ''}" para esta evaluación?`}
          labelConfirmar="Registrar estado"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={handleSubmit(registrar)}
          onCancelar={cancelar}
        />
      )}
    </>
  );
}
