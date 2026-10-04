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
import Button from '../../../../shared/components/ui/Button';
import Field from '../../../../shared/components/ui/Field';

const schema = z.object({
  tituloProyecto: textoRequerido(LIMITES.TITULO_PROYECTO_MAX),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  tituloActual: string;
  onCerrar: () => void;
}

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
      <Field etiqueta="Nuevo título del proyecto" error={errors.tituloProyecto?.message}>
        {(control) => (
          <input
            type="text"
            maxLength={LIMITES.TITULO_PROYECTO_MAX}
            className="field-input"
            {...register('tituloProyecto')}
            {...control}
          />
        )}
      </Field>

      <div className="actions-row">
        <Button variante="secundario" onClick={handleCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!isValid || !isDirty} cargando={modificarTitulo.isPending}>
          {modificarTitulo.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
