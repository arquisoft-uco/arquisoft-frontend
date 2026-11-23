import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, PlusCircle } from 'lucide-react';
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
import { estadosParaDecidir, textoObservacionesParaEstado } from '../../utils/evaluacion-asistente';
import SelectorEstadoEvaluacion from './SelectorEstadoEvaluacion';

const schema = z.object({
  estadoEvaluacion: textoRequerido(LIMITES.ESTADO_EVALUACION_ID_MAX),
});
type FormValues = z.infer<typeof schema>;

const ETIQUETAS = { estadoEvaluacion: 'Estado' };
const TARJETA =
  'flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 animate-fade-up';
const TEXTO = 'text-sm text-on-surface-secondary';
const TITULO = 'flex items-center gap-2 text-sm font-semibold text-on-surface';
const ERROR_CATALOGO = 'No se pudieron cargar los estados disponibles. Intenta nuevamente.';

interface Props {
  evaluacionId: string;
  fichaPerfilId: string;
  cantidadObservaciones: number;
  onVolver: () => void;
}

export default function AgregarEstadoEvaluacionPanel({
  evaluacionId,
  fichaPerfilId,
  cantidadObservaciones,
  onVolver,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    setFocus,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { estadoEvaluacion: '' },
    mode: 'onTouched',
  });
  const { data: todosEstados = [], isLoading, isError } = useEstadosEvaluacion();
  const { mutate, reset: resetMutacion, isPending } = useAgregarEstadoEvaluacion(fichaPerfilId);

  const estados = estadosParaDecidir(todosEstados, cantidadObservaciones > 0);
  const elegido = watch('estadoEvaluacion');
  const seleccionado = estados.find((e) => e.id === elegido);
  const sinEstados = estados.length === 0;

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
    return <Notice variante="peligro">{ERROR_CATALOGO}</Notice>;
  }

  return (
    <>
      <form onSubmit={handleSubmit(() => setConfirmando(true))} noValidate className={TARJETA}>
        <h4 className={TITULO}>
          <PlusCircle size={16} className="text-primary" aria-hidden />
          ¿Cómo calificas la evaluación?
        </h4>
        <p className={TEXTO}>{textoObservacionesParaEstado(cantidadObservaciones)}</p>

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
            valor={elegido}
            error={errors.estadoEvaluacion?.message}
            deshabilitado={isPending}
            onElegir={(id) => setValue('estadoEvaluacion', id, { shouldValidate: true })}
          />
        )}

        <div className="actions-row sm:justify-end">
          <Button variante="secundario" icono={ArrowLeft} disabled={isPending} onClick={onVolver}>
            Atrás
          </Button>
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
