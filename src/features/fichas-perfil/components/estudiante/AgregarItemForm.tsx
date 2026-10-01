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

      <div>
        <label htmlFor="item-tipo" className="field-label">
          Tipo de ítem <span aria-hidden>*</span>
        </label>
        <select
          id="item-tipo"
          className="field-input"
          aria-invalid={!!errors.tipoItemId}
          aria-describedby={errors.tipoItemId ? 'item-tipo-error' : undefined}
          aria-busy={isLoading}
          {...register('tipoItemId')}
        >
          <option value="">{isLoading ? 'Cargando tipos…' : 'Selecciona un tipo'}</option>
          {tiposItem.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        {errors.tipoItemId && (
          <p id="item-tipo-error" className="field-error" role="alert">
            {errors.tipoItemId.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="item-contenido" className="field-label">
          Contenido <span aria-hidden>*</span>
        </label>
        <textarea
          id="item-contenido"
          rows={4}
          maxLength={LIMITES.ITEM_CONTENIDO_MAX}
          className="field-input"
          aria-invalid={!!errors.contenido}
          aria-describedby={errors.contenido ? 'item-contenido-error' : undefined}
          {...register('contenido')}
        />
        {errors.contenido && (
          <p id="item-contenido-error" className="field-error" role="alert">
            {errors.contenido.message}
          </p>
        )}
      </div>

      <div className="actions-row">
        <button
          type="button"
          onClick={handleCancelar}
          className="rounded-lg border border-border px-3 py-2 text-sm text-on-surface hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isValid || !fichaId || sinTipos || agregar.isPending}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {agregar.isPending ? 'Agregando…' : 'Agregar'}
        </button>
      </div>
    </form>
  );
}
