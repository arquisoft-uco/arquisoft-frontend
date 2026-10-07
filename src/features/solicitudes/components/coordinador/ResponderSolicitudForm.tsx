import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import { useResponderSolicitudNovedadCoordinador } from '../../hooks/useResponderSolicitudNovedadCoordinador';
import type { Solicitud } from '../../models/Solicitud';

const schema = z.object({
  contenido: textoRequerido(LIMITES.RESPUESTA_CONTENIDO_MAX),
});

type FormValues = z.infer<typeof schema>;

const ID_FORMULARIO = 'responder-solicitud';
const ETIQUETAS = { contenido: 'Respuesta' };
const CONTEXTO = 'rounded-xl border border-border bg-surface-secondary p-3.5';

interface Props {
  solicitud: Solicitud;
  onCerrar: () => void;
}

export default function ResponderSolicitudForm({ solicitud, onCerrar }: Props) {
  const { mutate, isPending, reset: reiniciarMutacion } = useResponderSolicitudNovedadCoordinador();
  const [resumenVisible, setResumenVisible] = useState(false);
  const formulario = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contenido: '' },
    mode: 'onTouched',
  });
  const { register, setError, setFocus, watch } = formulario;
  const { errors, isDirty } = formulario.formState;
  const erroresResumidos = resumenVisible ? resumirErrores(errors, ETIQUETAS) : [];

  function cerrar() {
    formulario.reset();
    reiniciarMutacion();
    onCerrar();
  }

  function enviar(values: FormValues) {
    mutate(
      { solicitudId: solicitud.id, contenido: values.contenido },
      {
        onSuccess: () => {
          toast.success(
            'Respuesta enviada',
            `Se respondió la solicitud de ${solicitud.remitente.nombre}.`,
          );
          cerrar();
        },
        onError: (err) => {
          // El toast es incondicional: el usuario debe enterarse del fallo aunque el
          // campo con el error quede fuera de la vista.
          toast.error(
            'No se pudo enviar la respuesta',
            getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.'),
          );
          const delCampo = getApiFieldErrors(err).find((e) => e.field === 'contenido');
          if (delCampo) setError('contenido', { message: delCampo.message });
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Responder solicitud"
      descripcion={`Solicitud de ${solicitud.remitente.nombre}`}
      sucio={isDirty}
      ocupado={isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Enviar respuesta"
          accionEnviando="Enviando…"
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
        <section aria-labelledby="mensaje-original" className={CONTEXTO}>
          <h3 id="mensaje-original" className="field-label">
            Mensaje original
          </h3>
          <p className="break-words text-on-surface-secondary">{solicitud.mensajeSolicitud}</p>
        </section>

        <Field
          etiqueta="Respuesta"
          ayuda="La respuesta es única para esta solicitud y no se puede editar después de enviarla."
          error={errors.contenido?.message}
          contador={{ actual: watch('contenido').length, max: LIMITES.RESPUESTA_CONTENIDO_MAX }}
        >
          {(control) => (
            <textarea
              rows={5}
              maxLength={LIMITES.RESPUESTA_CONTENIDO_MAX}
              className="field-input"
              {...register('contenido')}
              {...control}
            />
          )}
        </Field>

        <ErrorSummary errores={erroresResumidos} onIrAlCampo={() => setFocus('contenido')} />
      </form>
    </SidePanel>
  );
}
