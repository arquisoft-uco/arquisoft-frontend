import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../shared/utils/api-error';
import { useRegistrarObservacion } from './useRegistrarObservacion';
import {
  CODIGOS_DE_CAMPO,
  mensajeDeErrorObservacion,
  observacionYaNoGestionable,
} from '../utils/errores-observacion-revision';
import {
  ETIQUETAS_OBSERVACION_REVISION,
  observacionRevisionSchema,
  type ObservacionRevisionValues,
} from '../utils/observacion-revision-schema';

const CAMPOS = Object.keys(ETIQUETAS_OBSERVACION_REVISION) as (keyof ObservacionRevisionValues)[];

const MENSAJE_ERROR_POR_DEFECTO = 'Verifica los datos e inténtalo nuevamente.';

interface Opciones {
  revisionAsesorId: string;
  onVolver: () => void;
  onSalir: () => void;
}

export function useAgregarObservacionForm({ revisionAsesorId, onVolver, onSalir }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<ObservacionRevisionValues>({
    resolver: zodResolver(observacionRevisionSchema),
    defaultValues: { descripcion: '' },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useRegistrarObservacion();

  const errores = resumenVisible
    ? CAMPOS.flatMap((campo) => {
        const mensaje = errors[campo]?.message;
        return mensaje ? [{ campo, etiqueta: ETIQUETAS_OBSERVACION_REVISION[campo], mensaje }] : [];
      })
    : [];

  function irAlCampo(campo: string) {
    const destino = CAMPOS.find((c) => c === campo);
    if (destino) form.setFocus(destino);
  }

  function agregar(valores: ObservacionRevisionValues) {
    setResumenVisible(false);
    mutate(
      { revisionAsesorId, descripcion: valores.descripcion },
      {
        onSuccess: () => {
          toast.success('Observación agregada', 'Quedó registrada en la revisión.');
          form.reset();
          onVolver();
        },
        onError: (err) => {
          const mensaje = mensajeDeErrorObservacion(err, MENSAJE_ERROR_POR_DEFECTO);
          toast.error('No se pudo agregar la observación', mensaje);
          const deCampo =
            getApiFieldErrors(err).some((e) => e.field === 'descripcion') ||
            CODIGOS_DE_CAMPO.some((c) => hasApiErrorCode(err, c));
          if (deCampo) form.setError('descripcion', { message: mensaje });
          if (observacionYaNoGestionable(err)) onSalir();
        },
      },
    );
  }

  function cerrar() {
    form.reset();
    reiniciarMutacion();
    onVolver();
  }

  const enviar = form.handleSubmit(agregar, () => setResumenVisible(true));

  return { form, enviar, enviando: isPending, cerrar, isDirty, errores, irAlCampo };
}
