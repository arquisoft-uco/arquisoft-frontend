import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import type { Item } from '../../models/fichas-perfil';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import Button from '../../../../shared/components/ui/Button';
import Field from '../../../../shared/components/ui/Field';

const schema = z.object({
  contenido: textoRequerido(LIMITES.ITEM_CONTENIDO_MAX),
});

type FormValues = z.infer<typeof schema>;

const CAMPO_POR_FIELD: Record<string, keyof FormValues> = {
  contenido: 'contenido',
};

interface Props {
  item: Item;
  onCerrar: () => void;
}

export default function EditarItemForm({ item, onCerrar }: Props) {
  const { modificar } = useItemsMiFicha();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contenido: item.contenido },
    mode: 'onChange',
  });

  function handleCancelar() {
    reset();
    modificar.reset();
    onCerrar();
  }

  function onSubmit(values: FormValues) {
    modificar.mutate(
      { itemId: item.id, contenido: values.contenido },
      {
        onSuccess: () => {
          toast.success('Ítem actualizado', 'El contenido se guardó correctamente.');
          reset();
          modificar.reset();
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            'Error al modificar',
            getApiErrorMessage(err, 'No se pudo actualizar el ítem.'),
          );
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
      className="mt-2 flex flex-col gap-3"
      aria-label={`Editar ítem ${item.tipoItem.nombre}`}
    >
      <Field
        etiqueta={`Contenido del ítem ${item.tipoItem.nombre}`}
        error={errors.contenido?.message}
      >
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
        <Button type="submit" disabled={!isValid || !isDirty} cargando={modificar.isPending}>
          {modificar.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
