import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { LIMITES } from '../../../shared/validation';
import {
  modificarItemCualitativoAsesorSchema as schema,
  type ModificarItemCualitativoAsesorValues as FormValues,
} from '../utils/registrar-item-cualitativo-asesor-schema';
import CampoPesoItemCualitativo from './CampoPesoItemCualitativo';
import { useModificarItemCualitativoAsesor } from '../hooks/useModificarItemCualitativoAsesor';
import type { ItemCualitativoAsesor } from '../models/ItemCualitativoAsesor';
import { ITEM_CUALITATIVO_ASESOR_NO_ENCONTRADO } from '../utils/codigos-error-evaluaciones';

const ID_FORMULARIO = 'modificar-item-cualitativo-asesor';
const ETIQUETAS_CAMPO = { descripcion: 'Descripción', peso: 'Peso' };
const MAX_DESCRIPCION = LIMITES.ITEM_CUALITATIVO_ASESOR_DESCRIPCION_MAX;

interface Props {
  item: ItemCualitativoAsesor;
  onCerrar: () => void;
}

export default function ModificarItemCualitativoAsesorPanel({ item, onCerrar }: Props) {
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
    defaultValues: { descripcion: item.descripcion, peso: String(item.peso) },
    mode: 'onTouched',
  });

  const descripcion = useWatch({ control, name: 'descripcion' });
  const { mutate, isPending, reset: resetMutation } = useModificarItemCualitativoAsesor();
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function irAlCampo(campo: string) {
    if (campo === 'descripcion' || campo === 'peso') setFocus(campo);
  }

  function enviar(values: FormValues) {
    mutate(
      { itemId: item.id, descripcion: values.descripcion, peso: Number(values.peso) },
      {
        onSuccess: () => {
          toast.success('Ítem modificado', `"${item.nombre}" fue actualizado correctamente.`);
          cerrar();
        },
        onError: (err) => {
          const mensaje = getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
          toast.error('No se pudo modificar el ítem', mensaje);

          if (hasApiErrorCode(err, ITEM_CUALITATIVO_ASESOR_NO_ENCONTRADO)) {
            cerrar();
            return;
          }
          getApiFieldErrors(err).forEach((fe) => {
            if (fe.field === 'descripcion' || fe.field === 'peso') {
              setError(fe.field, { message: fe.message });
            }
          });
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Modificar ítem"
      descripcion="Puedes cambiar la descripción y el peso; el nombre no se modifica."
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
            {(campo) => (
              <input {...campo} type="text" readOnly value={item.nombre} className="field-input" />
            )}
          </Field>
          <Field
            etiqueta={ETIQUETAS_CAMPO.descripcion}
            error={errors.descripcion?.message}
            contador={{ actual: descripcion.length, max: MAX_DESCRIPCION }}
          >
            {(campo) => (
              <textarea
                {...campo}
                rows={4}
                maxLength={MAX_DESCRIPCION}
                className="field-input"
                {...register('descripcion')}
              />
            )}
          </Field>
          <CampoPesoItemCualitativo
            registro={register('peso')}
            min={LIMITES.ITEM_CUALITATIVO_ASESOR_PESO_MIN}
            max={LIMITES.ITEM_CUALITATIVO_ASESOR_PESO_MAX}
            error={errors.peso?.message}
          />
        </FormSection>
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
