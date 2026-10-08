import { useState } from 'react';
import { useForm, useWatch, type Control, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ErrorSummary, { resumirErrores } from '../../../shared/components/ui/ErrorSummary';
import Field from '../../../shared/components/ui/Field';
import FormActions from '../../../shared/components/ui/FormActions';
import FormSection from '../../../shared/components/ui/FormSection';
import SidePanel from '../../../shared/components/ui/SidePanel';
import { toast } from '../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';
import CampoDescripcionItemCualitativoJurado from './CampoDescripcionItemCualitativoJurado';
import { useModificarItemCualitativoJurado } from '../hooks/useModificarItemCualitativoJurado';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import { ITEM_CUALITATIVO_JURADO_NO_ENCONTRADO } from '../utils/codigos-error-evaluaciones';
import { descripcionItemCualitativoJurado } from '../utils/item-cualitativo-jurado-schema';

const ID_FORMULARIO = 'modificar-item-cualitativo-jurado';
const ETIQUETAS_CAMPO = { descripcion: 'Descripción' };

const schema = z.object({ descripcion: descripcionItemCualitativoJurado });

type FormValues = z.infer<typeof schema>;

interface Props {
  item: ItemCualitativoJurado;
  onCerrar: () => void;
}

interface DescripcionConContadorProps {
  control: Control<FormValues>;
  registro: UseFormRegisterReturn;
  error?: string;
}

function DescripcionConContador({ control, ...campo }: DescripcionConContadorProps) {
  const descripcion = useWatch({ control, name: 'descripcion' });

  return <CampoDescripcionItemCualitativoJurado {...campo} longitud={descripcion.length} />;
}

export default function ModificarItemCualitativoJuradoPanel({ item, onCerrar }: Props) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { descripcion: item.descripcion },
    mode: 'onTouched',
  });

  const { mutate, isPending, reset: resetMutation } = useModificarItemCualitativoJurado();
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function irAlCampo(campo: string) {
    if (campo === 'descripcion') setFocus(campo);
  }

  function enviar(values: FormValues) {
    mutate(
      { itemId: item.id, descripcion: values.descripcion },
      {
        onSuccess: () => {
          toast.success('Ítem modificado', `"${item.nombre}" fue actualizado correctamente.`);
          cerrar();
        },
        onError: (err) => {
          const mensaje = getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
          toast.error('No se pudo modificar el ítem', mensaje);

          if (hasApiErrorCode(err, ITEM_CUALITATIVO_JURADO_NO_ENCONTRADO)) {
            cerrar();
            return;
          }
          getApiFieldErrors(err).forEach((fe) => {
            if (fe.field === 'descripcion') setError('descripcion', { message: fe.message });
          });
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Modificar ítem"
      descripcion="Solo puedes cambiar la descripción; el nombre no se modifica."
      sucio={isDirty}
      ocupado={isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Guardar cambios"
          accionEnviando="Guardando…"
          enviando={isPending}
          sucio={isDirty}
          sinCambios={!isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Modificación de ítem cualitativo"
        noValidate
        aria-busy={isPending}
        onSubmit={handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-6"
      >
        <FormSection titulo="Datos del ítem">
          <Field etiqueta="Nombre">
            {(control) => (
              <input
                {...control}
                type="text"
                readOnly
                value={item.nombre}
                className="field-input"
              />
            )}
          </Field>
          <DescripcionConContador
            control={control}
            registro={register('descripcion')}
            error={errors.descripcion?.message}
          />
        </FormSection>
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
