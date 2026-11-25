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
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors } from '../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../shared/validation';
import { useAgregarEstadoFichaPerfil } from '../hooks/useAgregarEstadoFichaPerfil';
import type { EstadoFicha } from '../models/fichas-perfil';

const schema = z.object({
  estadoFicha: textoRequerido(LIMITES.ESTADO_FICHA_ID_MAX),
});
type FormValues = z.infer<typeof schema>;

const ETIQUETAS = { estadoFicha: 'Nuevo estado' };

interface Props {
  fichaPerfilId: string;
  opciones: EstadoFicha[];
  evaluacionesSinRevisar: boolean;
}

export default function CambiarEstadoFichaForm({
  fichaPerfilId,
  opciones,
  evaluacionesSinRevisar,
}: Props) {
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
  const { mutate, isPending } = useAgregarEstadoFichaPerfil(fichaPerfilId);

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

  return (
    <>
      <form
        onSubmit={handleSubmit(() => setConfirmando(true))}
        noValidate
        className="flex flex-col gap-4"
      >
        {evaluacionesSinRevisar && (
          <Notice variante="advertencia">
            No pudimos revisar las evaluaciones; el servidor validará el cambio.
          </Notice>
        )}
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
    </>
  );
}
