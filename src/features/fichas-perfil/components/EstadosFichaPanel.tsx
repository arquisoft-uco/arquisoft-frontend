import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw } from 'lucide-react';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import Button from '../../../shared/components/ui/Button';
import ErrorSummary, { resumirErrores } from '../../../shared/components/ui/ErrorSummary';
import Field from '../../../shared/components/ui/Field';
import Notice from '../../../shared/components/ui/Notice';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors } from '../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../shared/validation';
import { useAgregarEstadoFichaPerfil } from '../hooks/useAgregarEstadoFichaPerfil';
import { useEstadosFicha } from '../hooks/useEstadosFicha';
import { estadosDestino } from '../utils/transiciones-estado-ficha';
import { InsigniaEstadoFicha } from './FichaCeldas';

const schema = z.object({
  estadoFicha: textoRequerido(LIMITES.ESTADO_FICHA_ID_MAX),
});
type FormValues = z.infer<typeof schema>;

const ETIQUETAS = { estadoFicha: 'Nuevo estado' };

interface Props {
  fichaPerfilId: string;
  estadoActual: { id: string; nombre: string };
}

export default function EstadosFichaPanel({ fichaPerfilId, estadoActual }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    setFocus,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { estadoFicha: '' },
    mode: 'onTouched',
  });
  const { data: estados = [], isLoading, isError } = useEstadosFicha();
  const { mutate, isPending } = useAgregarEstadoFichaPerfil(fichaPerfilId);

  const opciones = estadosDestino(estadoActual.id, estados);
  const seleccionado = opciones.find((e) => e.id === watch('estadoFicha'));

  function enviar(values: FormValues) {
    mutate(values.estadoFicha, {
      onSuccess: () => {
        toast.success('Estado actualizado', 'El estado de la ficha se registró correctamente.');
        reset();
        setConfirmando(false);
      },
      onError: (err) => {
        toast.error(
          'No se pudo cambiar el estado',
          getApiErrorMessage(err, 'No se pudo actualizar el estado de la ficha.'),
        );
        const errorCampo = getApiFieldErrors(err).find((e) => e.field === 'estadoFicha');
        if (errorCampo) setError('estadoFicha', { message: errorCampo.message });
        setConfirmando(false);
      },
    });
  }

  function contenido() {
    if (isLoading) return <Skeleton variante="formulario" etiqueta="Cargando estados…" />;
    if (isError) {
      return <Notice variante="peligro">No se pudieron cargar los estados disponibles.</Notice>;
    }
    if (opciones.length === 0) {
      return (
        <Notice variante="info">Esta ficha está en un estado final; no admite cambios.</Notice>
      );
    }
    return (
      <form
        onSubmit={handleSubmit(() => setConfirmando(true))}
        noValidate
        className="flex flex-col gap-4"
      >
        {isSubmitted && (
          <ErrorSummary
            errores={resumirErrores(errors, ETIQUETAS)}
            onIrAlCampo={() => setFocus('estadoFicha')}
          />
        )}
        <Field etiqueta="Nuevo estado" error={errors.estadoFicha?.message}>
          {(control) => (
            <select
              {...control}
              className="field-input"
              disabled={isPending}
              {...register('estadoFicha')}
            >
              <option value="">Selecciona un estado...</option>
              {opciones.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className="actions-row sm:justify-end">
          <Button type="submit" icono={RefreshCw} cargando={isPending}>
            {isPending ? 'Cambiando…' : 'Cambiar estado'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-on-surface-secondary">Estado actual:</span>
        <InsigniaEstadoFicha estadoId={estadoActual.id} nombre={estadoActual.nombre} />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-on-surface">Cambiar estado</h3>
        {contenido()}
      </div>

      {confirmando && (
        <ConfirmDialog
          titulo="Cambiar estado de la ficha"
          descripcion={`¿Confirmas cambiar el estado de la ficha a "${seleccionado?.nombre ?? ''}"?`}
          consecuencias={['Se notificará por correo a los estudiantes vigentes de la ficha.']}
          labelConfirmar="Cambiar estado"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={handleSubmit(enviar)}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </div>
  );
}
