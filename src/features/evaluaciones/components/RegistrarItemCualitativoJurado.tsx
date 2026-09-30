import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegistrarItemCualitativoJurado } from '../hooks/useRegistrarItemCualitativoJurado';
import { toast } from '../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../shared/validation';

const schema = z.object({
  nombre: textoRequerido(LIMITES.ITEM_CUALITATIVO_NOMBRE_MAX),
  descripcion: textoRequerido(LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onCerrar: () => void;
}

export default function RegistrarItemCualitativoJurado({ onCerrar }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', descripcion: '' },
    mode: 'onChange',
  });

  const { mutate, isPending, reset: resetMutation } = useRegistrarItemCualitativoJurado();

  function handleCancelar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function onSubmit(values: FormValues) {
    mutate(values, {
      onSuccess: () => {
        toast.success('Ítem registrado', `"${values.nombre}" fue registrado correctamente.`);
        reset();
        resetMutation();
        onCerrar();
      },
      onError: (err) => {
        // El toast es incondicional: el usuario debe enterarse del fallo aunque el
        // campo con el error quede fuera de la vista.
        const mensaje = getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
        toast.error('Error al registrar el ítem', mensaje);

        if (hasApiErrorCode(err, 'ITEM_CUALITATIVO_JURADO_NOMBRE_DUPLICADO')) {
          setError('nombre', { message: mensaje });
        }

        getApiFieldErrors(err).forEach((fe) => {
          if (fe.field === 'nombre' || fe.field === 'descripcion') {
            setError(fe.field, { message: fe.message });
          }
        });
      },
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <h3 className="mb-4 text-base font-semibold text-on-surface">
        Registrar nuevo ítem cualitativo
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} aria-busy={isPending} className="flex flex-col gap-4">
        <div>
          <label htmlFor="icj-nombre" className="field-label">
            Nombre
          </label>
          <input
            id="icj-nombre"
            type="text"
            maxLength={LIMITES.ITEM_CUALITATIVO_NOMBRE_MAX}
            className="field-input"
            aria-invalid={!!errors.nombre}
            aria-describedby={errors.nombre ? 'icj-nombre-error' : undefined}
            {...register('nombre')}
          />
          {errors.nombre && (
            <p id="icj-nombre-error" className="field-error" role="alert">
              {errors.nombre.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="icj-descripcion" className="field-label">
            Descripción
          </label>
          <textarea
            id="icj-descripcion"
            rows={4}
            maxLength={LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX}
            className="field-input"
            aria-invalid={!!errors.descripcion}
            aria-describedby={errors.descripcion ? 'icj-descripcion-error' : undefined}
            {...register('descripcion')}
          />
          {errors.descripcion && (
            <p id="icj-descripcion-error" className="field-error" role="alert">
              {errors.descripcion.message}
            </p>
          )}
        </div>

        <div className="actions-row border-t border-border pt-4">
          <button
            type="button"
            onClick={handleCancelar}
            className="rounded-lg border border-border px-4 py-2 text-sm text-on-surface transition-colors hover:bg-surface-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || !isValid}
            aria-busy={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isPending ? 'Registrando...' : 'Registrar ítem'}
          </button>
        </div>
      </form>
    </div>
  );
}
