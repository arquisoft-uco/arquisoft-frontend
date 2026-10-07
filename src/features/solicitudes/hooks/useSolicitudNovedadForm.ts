import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enviarSolicitudSchema, esCampoDelFormulario } from '../utils/enviar-solicitud-schema';
import type { EnviarSolicitudValues } from '../utils/enviar-solicitud-schema';
import { toast } from '../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';

interface OpcionesEnvio {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

export type EnviarSolicitud = (body: EnviarSolicitudValues, opciones: OpcionesEnvio) => void;

interface Opciones {
  mensajeExito: string;
  enviar: EnviarSolicitud;
  reiniciar: () => void;
}

export function useSolicitudNovedadForm({ mensajeExito, enviar, reiniciar }: Opciones) {
  const [confirmando, setConfirmando] = useState(false);
  const [resumenVisible, setResumenVisible] = useState(false);

  const formulario = useForm<EnviarSolicitudValues>({
    resolver: zodResolver(enviarSolicitudSchema),
    defaultValues: { destinatario: '', mensajeSolicitud: '' },
    mode: 'onTouched',
  });
  const { register, handleSubmit, reset, setError, setFocus, watch } = formulario;
  const { errors } = formulario.formState;
  const longitudMensaje = watch('mensajeSolicitud').length;

  function onSubmit(values: EnviarSolicitudValues) {
    enviar(
      { destinatario: values.destinatario, mensajeSolicitud: values.mensajeSolicitud },
      {
        onSuccess: () => {
          toast.success('Solicitud enviada', mensajeExito);
          reset();
          reiniciar();
          setConfirmando(false);
          setResumenVisible(false);
        },
        onError: (err) => {
          // El toast es incondicional: el usuario debe enterarse del fallo aunque el
          // campo con el error quede fuera de la vista.
          toast.error(
            'No se pudo enviar la solicitud',
            getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.'),
          );

          if (
            hasApiErrorCode(err, 'DESTINATARIO_NO_ENCONTRADO') ||
            hasApiErrorCode(err, 'DESTINATARIO_NO_ASIGNADO')
          ) {
            setError('destinatario', {
              message: getApiErrorMessage(err, 'El destinatario indicado no es válido.'),
            });
          }

          getApiFieldErrors(err).forEach((fieldError) => {
            if (esCampoDelFormulario(fieldError.field)) {
              setError(fieldError.field, { message: fieldError.message });
            }
          });

          setConfirmando(false);
          setResumenVisible(true);
        },
      },
    );
  }

  const alEnviarFormulario = handleSubmit(
    () => setConfirmando(true),
    () => setResumenVisible(true),
  );

  function irAlCampo(campo: string) {
    if (esCampoDelFormulario(campo)) setFocus(campo);
  }

  function cancelarConfirmacion() {
    setConfirmando(false);
  }

  function confirmar() {
    handleSubmit(onSubmit)();
  }

  return {
    register,
    errors,
    longitudMensaje,
    resumenVisible,
    confirmando,
    alEnviarFormulario,
    irAlCampo,
    cancelarConfirmacion,
    confirmar,
  };
}
