import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido, uuidValido } from '../../../../shared/validation';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';

const schema = z.object({
  destinatario: uuidValido(),
  mensajeSolicitud: textoRequerido(LIMITES.MENSAJE_SOLICITUD_MAX),
});

type FormValues = z.infer<typeof schema>;

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
  enviar: (body: FormValues, opciones: OpcionesEnvio) => void;
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { destinatario: '', mensajeSolicitud: '' },
    mode: 'onChange',
  });

  function onSubmit(values: FormValues) {
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
          getApiFieldErrors(err).forEach((fieldError) => {
            setError(fieldError.field as keyof FormValues, { message: fieldError.message });
          });
          if (
            hasApiErrorCode(err, 'DESTINATARIO_NO_ENCONTRADO') ||
            hasApiErrorCode(err, 'DESTINATARIO_NO_ASIGNADO')
          ) {
            setError('destinatario', {
              message: getApiErrorMessage(err, 'El destinatario indicado no es válido.'),
            });
          }
          toast.error(
            'No se pudo enviar la solicitud',
            getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.'),
          );
          setConfirmando(false);
        },
      },
    );
  }

  function handleAbrirConfirmacion() {
    setConfirmando(true);
  }

  function handleCancelarConfirmacion() {
    setConfirmando(false);
  }

  function handleConfirmar() {
    handleSubmit(onSubmit)();
  }

  function handleSubmitNativo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-on-surface">{textos.titulo}</h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmitNativo}>
        <div>
          <label htmlFor="sn-destinatario" className="field-label">
            {textos.etiquetaDestinatario} <span aria-hidden className="text-danger">*</span>
          </label>
          <input
            id="sn-destinatario"
            type="text"
            className="field-input"
            aria-invalid={!!errors.destinatario}
            aria-describedby={errors.destinatario ? 'sn-destinatario-error' : undefined}
            placeholder="Ej. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            {...register('destinatario')}
          />
          {errors.destinatario && (
            <p id="sn-destinatario-error" className="field-error" role="alert">
              {errors.destinatario.message}
            </p>
          )}
          <div className="mt-2">
            <AvisoNoDisponible recurso={textos.recursoAviso} />
          </div>
        </div>

        <div>
          <label htmlFor="sn-mensaje" className="field-label">
            Mensaje <span aria-hidden className="text-danger">*</span>
          </label>
          <textarea
            id="sn-mensaje"
            rows={4}
            maxLength={LIMITES.MENSAJE_SOLICITUD_MAX}
            className="field-input"
            aria-invalid={!!errors.mensajeSolicitud}
            aria-describedby={errors.mensajeSolicitud ? 'sn-mensaje-error' : undefined}
            placeholder={textos.placeholderMensaje}
            {...register('mensajeSolicitud')}
          />
          {errors.mensajeSolicitud && (
            <p id="sn-mensaje-error" className="field-error" role="alert">
              {errors.mensajeSolicitud.message}
            </p>
          )}
        </div>

        <div className="actions-row border-t border-border pt-4">
          <button
            type="button"
            onClick={handleAbrirConfirmacion}
            disabled={!isValid || enviando}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : 'Enviar solicitud'}
          </button>
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
