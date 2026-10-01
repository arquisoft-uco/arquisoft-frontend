import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMiFichaPerfil } from '../../hooks/useMiFichaPerfil';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';

const schema = z.object({
  tituloProyecto: textoRequerido(LIMITES.TITULO_PROYECTO_MAX),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  tituloActual: string;
  onCerrar: () => void;
}

const CAMPO_ID = 'mi-ficha-titulo';
const ERROR_ID = `${CAMPO_ID}-error`;

export default function EditarTituloForm({ tituloActual, onCerrar }: Props) {
  const { modificarTitulo } = useMiFichaPerfil();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tituloProyecto: tituloActual },
    mode: 'onChange',
  });

  function handleCancelar() {
    reset();
    modificarTitulo.reset();
    onCerrar();
  }

  function onSubmit(values: FormValues) {
    modificarTitulo.mutate(values.tituloProyecto, {
      onSuccess: () => {
        modificarTitulo.reset();
        onCerrar();
      },
      onError: (err) => {
        const errorDelCampo = getApiFieldErrors(err).find((e) => e.field === 'tituloProyecto');
        if (errorDelCampo) {
          setError('tituloProyecto', { message: errorDelCampo.message });
        } else if (hasApiErrorCode(err, 'FICHA_TITULO_DUPLICADO')) {
          setError('tituloProyecto', {
            message: getApiErrorMessage(err, 'Ya existe una ficha con ese título.'),
          });
        }
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3"
      aria-label="Editar título del proyecto"
      noValidate
    >
      <div>
        <label htmlFor={CAMPO_ID} className="sr-only">
          Nuevo título del proyecto
        </label>
        <input
          id={CAMPO_ID}
          type="text"
          maxLength={LIMITES.TITULO_PROYECTO_MAX}
          className="field-input"
          aria-invalid={!!errors.tituloProyecto}
          aria-describedby={errors.tituloProyecto ? ERROR_ID : undefined}
          {...register('tituloProyecto')}
        />
        {errors.tituloProyecto && (
          <p id={ERROR_ID} className="field-error" role="alert">
            {errors.tituloProyecto.message}
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
          disabled={!isValid || !isDirty || modificarTitulo.isPending}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {modificarTitulo.isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
