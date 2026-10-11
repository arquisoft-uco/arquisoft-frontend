import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import { useAgregarObservacionItem } from '../../hooks/useAgregarObservacionItem';

const schema = z.object({
  observacion: textoRequerido(LIMITES.OBSERVACION_ITEM_MAX),
});

type FormValues = z.infer<typeof schema>;

const ID_FORMULARIO = 'agregar-observacion-item';
const ETIQUETAS = { observacion: 'Observación' };
const CODIGOS_SIN_REINTENTO = [
  'REVISION_ITEM_CERRADA',
  'REVISION_ITEM_NO_ENCONTRADA',
  'FICHA_NO_PERTENECE_ASESOR',
];

function mensajeError(err: unknown): string {
  if (hasApiErrorCode(err, 'REVISION_ITEM_CERRADA')) {
    return 'La revisión está cerrada y ya no admite cambios.';
  }
  if (hasApiErrorCode(err, 'REVISION_ITEM_NO_ENCONTRADA')) return 'La revisión ya no existe.';
  if (hasApiErrorCode(err, 'FICHA_NO_PERTENECE_ASESOR')) return 'Esta ficha no está asignada a ti.';
  return getApiErrorMessage(err, 'No se pudo agregar la observación. Intenta nuevamente.');
}

interface Props {
  revisionItemId: string;
  fichaPerfilId: string;
  nombreItem: string;
  onCerrar: () => void;
}

export default function AgregarObservacionItemPanel({
  revisionItemId,
  fichaPerfilId,
  nombreItem,
  onCerrar,
}: Props) {
  const { mutate, reset: resetMutacion, isPending } = useAgregarObservacionItem(fichaPerfilId);
  const [resumenVisible, setResumenVisible] = useState(false);
  const formulario = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { observacion: '' },
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

  function enviar({ observacion }: FormValues) {
    mutate(
      { revisionItemId, observacion },
      {
        onSuccess: () => {
          toast.success('Observación agregada', 'La observación quedó registrada en la revisión.');
          cerrar();
        },
        onError: (err) => {
          const mensaje = mensajeError(err);
          toast.error('No se pudo agregar la observación', mensaje);
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
      titulo="Agregar observación"
      descripcion={nombreItem}
      sucio={isDirty}
      ocupado={isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Agregar observación"
          accionEnviando="Agregando…"
          enviando={isPending}
          sucio={isDirty}
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
