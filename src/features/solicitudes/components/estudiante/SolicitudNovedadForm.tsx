import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enviarSolicitudSchema, esCampoDelFormulario } from '../../utils/enviar-solicitud-schema';
import type { EnviarSolicitudValues } from '../../utils/enviar-solicitud-schema';
import { LIMITES } from '../../../../shared/validation';
import { toast } from '../../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../../shared/utils/api-error';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import Field from '../../../../shared/components/ui/Field';

export interface TextosSolicitudNovedad {
  titulo: string;
  etiquetaDestinatario: string;
  placeholderMensaje: string;
  recursoAviso: string;
  tituloConfirmacion: string;
  descripcionConfirmacion: string;
  mensajeExito: string;
}

interface OpcionesEnvio {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

interface Props {
  textos: TextosSolicitudNovedad;
  enviar: (body: EnviarSolicitudValues, opciones: OpcionesEnvio) => void;
  enviando: boolean;
  reiniciar: () => void;
}

export default function SolicitudNovedadForm({ textos, enviar, enviando, reiniciar }: Props) {
  const [confirmando, setConfirmando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<EnviarSolicitudValues>({
    resolver: zodResolver(enviarSolicitudSchema),
    defaultValues: { destinatario: '', mensajeSolicitud: '' },
    mode: 'onChange',
  });

  function onSubmit(values: EnviarSolicitudValues) {
    enviar(
      { destinatario: values.destinatario, mensajeSolicitud: values.mensajeSolicitud },
      {
        onSuccess: () => {
          toast.success('Solicitud enviada', textos.mensajeExito);
          reset();
          reiniciar();
          setConfirmando(false);
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
        },
      },
    );
  }

  function handleSubmitNativo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isValid) setConfirmando(true);
  }

  function handleCancelarConfirmacion() {
    setConfirmando(false);
  }

  function handleConfirmar() {
    handleSubmit(onSubmit)();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-base font-semibold text-on-surface">{textos.titulo}</h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmitNativo} aria-busy={enviando}>
        <div>
          <Field
            etiqueta={textos.etiquetaDestinatario}
            error={errors.destinatario?.message}
          >
            {(control) => (
              <input
                type="text"
                className="field-input"
                placeholder="Ej. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                {...register('destinatario')}
                {...control}
              />
            )}
          </Field>
          <div className="mt-2">
            <AvisoNoDisponible recurso={textos.recursoAviso} />
          </div>
        </div>

        <Field etiqueta="Mensaje" error={errors.mensajeSolicitud?.message}>
          {(control) => (
            <textarea
              rows={4}
              maxLength={LIMITES.MENSAJE_SOLICITUD_MAX}
              className="field-input"
              placeholder={textos.placeholderMensaje}
              {...register('mensajeSolicitud')}
              {...control}
            />
          )}
        </Field>

        <div className="actions-row border-t border-border pt-4">
          <Button type="submit" disabled={!isValid} cargando={enviando}>
            {enviando ? 'Enviando...' : 'Enviar solicitud'}
          </Button>
        </div>
      </form>

      {confirmando && (
        <ConfirmDialog
          titulo={textos.tituloConfirmacion}
          descripcion={textos.descripcionConfirmacion}
          labelConfirmar="Enviar"
          variante="advertencia"
          cargando={enviando}
          onConfirmar={handleConfirmar}
          onCancelar={handleCancelarConfirmacion}
        />
      )}
    </div>
  );
}
