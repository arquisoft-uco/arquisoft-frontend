import { useState } from 'react';
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
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';

const schema = z.object({
  tituloProyecto: textoRequerido(LIMITES.TITULO_PROYECTO_MAX),
});

type FormValues = z.infer<typeof schema>;

const ID_FORMULARIO = 'editar-titulo';
const ETIQUETAS = { tituloProyecto: 'Título del proyecto' };

interface Props {
  tituloActual: string;
  onCerrar: () => void;
}

export default function EditarTituloForm({ tituloActual, onCerrar }: Props) {
  const { modificarTitulo } = useMiFichaPerfil();
  const [resumenVisible, setResumenVisible] = useState(false);
  const formulario = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tituloProyecto: tituloActual },
    mode: 'onTouched',
  });
  const { register, setError, setFocus, watch } = formulario;
  const { errors, isDirty } = formulario.formState;
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS) : [];

  function cerrar() {
    formulario.reset();
    modificarTitulo.reset();
    onCerrar();
  }

  function enviar(values: FormValues) {
    modificarTitulo.mutate(values.tituloProyecto, {
      onSuccess: cerrar,
      onError: (err) => {
        const delCampo = getApiFieldErrors(err).find((e) => e.field === 'tituloProyecto');
        if (delCampo) {
          setError('tituloProyecto', { message: delCampo.message });
        } else if (hasApiErrorCode(err, 'FICHA_TITULO_DUPLICADO')) {
          setError('tituloProyecto', {
            message: getApiErrorMessage(err, 'Ya existe una ficha con ese título.'),
          });
        }
        setResumenVisible(true);
      },
    });
  }

  return (
    <SidePanel
      titulo="Editar título del proyecto"
      sucio={isDirty}
      ocupado={modificarTitulo.isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Guardar título"
          accionEnviando="Guardando…"
          enviando={modificarTitulo.isPending}
          sucio={isDirty}
          sinCambios={!isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        noValidate
        aria-busy={modificarTitulo.isPending}
        onSubmit={formulario.handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-5"
      >
        <Field
          etiqueta="Título del proyecto"
          error={errors.tituloProyecto?.message}
          contador={{ actual: watch('tituloProyecto').length, max: LIMITES.TITULO_PROYECTO_MAX }}
        >
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
        <ErrorSummary errores={errores} onIrAlCampo={() => setFocus('tituloProyecto')} />
      </form>
    </SidePanel>
  );
}
