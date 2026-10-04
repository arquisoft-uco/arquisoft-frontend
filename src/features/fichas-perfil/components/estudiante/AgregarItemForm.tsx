import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import { toast } from '../../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../../shared/utils/api-error';
import { LIMITES, opcionRequerida, textoRequerido } from '../../../../shared/validation';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Button from '../../../../shared/components/ui/Button';
import Field from '../../../../shared/components/ui/Field';

const schema = z.object({
  tipoItemId: opcionRequerida(),
  contenido: textoRequerido(LIMITES.ITEM_CONTENIDO_MAX),
});

type FormValues = z.infer<typeof schema>;

const CAMPO_POR_FIELD: Record<string, keyof FormValues> = {
  tipoItem: 'tipoItemId',
  contenido: 'contenido',
};

interface Props {
  onCerrar: () => void;
}

export default function AgregarItemForm({ onCerrar }: Props) {
  const { fichaId, tiposItem, isLoading, agregar } = useItemsMiFicha();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipoItemId: '', contenido: '' },
    mode: 'onChange',
  });

  const sinTipos = !isLoading && tiposItem.length === 0;

  function handleCancelar() {
    reset();
    agregar.reset();
    onCerrar();
  }

  function onSubmit(values: FormValues) {
    if (!fichaId) return;
    agregar.mutate(
      { fichaPerfilId: fichaId, tipoItemId: values.tipoItemId, contenido: values.contenido },
      {
        onSuccess: () => {
          toast.success('Ítem agregado', 'El ítem se registró correctamente.');
          reset();
          agregar.reset();
          onCerrar();
        },
        onError: (err) => {
          const mensaje = getApiErrorMessage(err, 'No se pudo registrar el ítem.');
          toast.error('Error al agregar', mensaje);
          if (hasApiErrorCode(err, 'ITEM_TIPO_DUPLICADO')) {
            setError('tipoItemId', { message: mensaje });
          }
          getApiFieldErrors(err).forEach(({ field, message }) => {
            const campo = CAMPO_POR_FIELD[field];
            if (campo) setError(campo, { message });
          });
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-3"
      aria-label="Agregar ítem a la ficha"
    >
      {sinTipos && <AvisoNoDisponible recurso="tipos de ítem" />}

      <Field etiqueta="Tipo de ítem" error={errors.tipoItemId?.message}>
        {(control) => (
          <select
            className="field-input"
            aria-busy={isLoading}
            {...register('tipoItemId')}
            {...control}
          >
            <option value="">{isLoading ? 'Cargando tipos…' : 'Selecciona un tipo'}</option>
            {tiposItem.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field etiqueta="Contenido" error={errors.contenido?.message}>
        {(control) => (
          <textarea
            rows={4}
            maxLength={LIMITES.ITEM_CONTENIDO_MAX}
            className="field-input"
            {...register('contenido')}
            {...control}
          />
        )}
      </Field>

      <div className="actions-row">
        <Button variante="secundario" onClick={handleCancelar}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!isValid || !fichaId || sinTipos}
          cargando={agregar.isPending}
        >
          {agregar.isPending ? 'Agregando…' : 'Agregar'}
        </Button>
      </div>
    </form>
  );
}
