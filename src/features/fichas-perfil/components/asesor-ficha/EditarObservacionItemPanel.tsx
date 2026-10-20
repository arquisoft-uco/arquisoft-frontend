import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import { useModificarObservacionItem } from '../../hooks/useModificarObservacionItem';
import type { ObservacionItem } from '../../models/ObservacionItem';
import { mensajeErrorObservacionItem } from '../../utils/errores-observacion-item';

const schema = z.object({
  observacion: textoRequerido(LIMITES.OBSERVACION_ITEM_MAX),
});

type FormValues = z.infer<typeof schema>;

const ID_FORMULARIO = 'editar-observacion-item';
const ETIQUETAS = { observacion: 'Observación' };
const CODIGOS_SIN_REINTENTO = [
  'REVISION_ITEM_CERRADA',
  'OBSERVACION_ITEM_NO_ENCONTRADA',
  'FICHA_NO_PERTENECE_ASESOR',
];

interface Props {
  observacion: ObservacionItem;
  fichaPerfilId: string;
  nombreItem: string;
  onCerrar: () => void;
}

export default function EditarObservacionItemPanel({
  observacion,
  fichaPerfilId,
  nombreItem,
  onCerrar,
}: Props) {
  const { mutate, reset: resetMutacion, isPending } = useModificarObservacionItem(fichaPerfilId);
  const [resumenVisible, setResumenVisible] = useState(false);
  const formulario = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { observacion: observacion.observacion },
    mode: 'onTouched',
  });
  const { register, setError, setFocus, watch } = formulario;
  const { errors, isDirty } = formulario.formState;
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS) : [];

  function cerrar() {
    formulario.reset();
    resetMutacion();
    onCerrar();
  }

  function enviar(values: FormValues) {
    mutate(
      { observacionItemId: observacion.id, observacion: values.observacion },
      {
        onSuccess: () => {
          toast.success('Observación actualizada', 'El texto se guardó correctamente.');
          cerrar();
        },
        onError: (err) => {
          const mensaje = mensajeErrorObservacionItem(
            err,
            'No se pudo actualizar la observación. Intenta nuevamente.',
          );
          toast.error('No se pudo actualizar la observación', mensaje);
          if (CODIGOS_SIN_REINTENTO.some((codigo) => hasApiErrorCode(err, codigo))) {
            cerrar();
            return;
          }
          const delCampo = getApiFieldErrors(err).find((e) => e.field === 'observacion');
          if (delCampo) {
            setError('observacion', { message: delCampo.message });
          } else if (hasApiErrorCode(err, 'OBSERVACION_ITEM_DUPLICADA')) {
            setError('observacion', { message: mensaje });
          }
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Editar observación"
      descripcion={nombreItem}
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
        noValidate
        aria-busy={isPending}
        onSubmit={formulario.handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-5"
      >
        <Field
          etiqueta="Observación"
          error={errors.observacion?.message}
          contador={{ actual: watch('observacion').length, max: LIMITES.OBSERVACION_ITEM_MAX }}
        >
          {(control) => (
            <textarea
              rows={6}
              maxLength={LIMITES.OBSERVACION_ITEM_MAX}
              className="field-input"
              {...register('observacion')}
              {...control}
            />
          )}
        </Field>
        <ErrorSummary errores={errores} onIrAlCampo={() => setFocus('observacion')} />
      </form>
    </SidePanel>
  );
}
