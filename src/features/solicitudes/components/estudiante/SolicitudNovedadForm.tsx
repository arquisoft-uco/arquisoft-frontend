import { useSolicitudNovedadForm } from '../../hooks/useSolicitudNovedadForm';
import type { EnviarSolicitud } from '../../hooks/useSolicitudNovedadForm';
import { LIMITES } from '../../../../shared/validation';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';

export interface TextosSolicitudNovedad {
  titulo: string;
  etiquetaDestinatario: string;
  placeholderMensaje: string;
  recursoAviso: string;
  tituloConfirmacion: string;
  descripcionConfirmacion: string;
  mensajeExito: string;
}

const TARJETA = 'rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5';
const FORMULARIO = 'flex flex-col gap-4';
const ETIQUETAS = { destinatario: 'Destinatario', mensajeSolicitud: 'Mensaje' };

interface Props {
  textos: TextosSolicitudNovedad;
  enviar: EnviarSolicitud;
  enviando: boolean;
  reiniciar: () => void;
}

export default function SolicitudNovedadForm({ textos, enviar, enviando, reiniciar }: Props) {
  const {
    register,
    errors,
    longitudMensaje,
    resumenVisible,
    confirmando,
    alEnviarFormulario,
    irAlCampo,
    cancelarConfirmacion,
    confirmar,
  } = useSolicitudNovedadForm({ mensajeExito: textos.mensajeExito, enviar, reiniciar });

  const erroresResumidos = resumenVisible ? resumirErrores(errors, ETIQUETAS) : [];

  return (
    <div className={TARJETA}>
      <form noValidate className={FORMULARIO} onSubmit={alEnviarFormulario} aria-busy={enviando}>
        <FormSection titulo={textos.titulo}>
          <div>
            <Field etiqueta={textos.etiquetaDestinatario} error={errors.destinatario?.message}>
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

          <Field
            etiqueta={ETIQUETAS.mensajeSolicitud}
            error={errors.mensajeSolicitud?.message}
            contador={{ actual: longitudMensaje, max: LIMITES.MENSAJE_SOLICITUD_MAX }}
          >
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
        </FormSection>

        <ErrorSummary errores={erroresResumidos} onIrAlCampo={irAlCampo} />

        <div className="actions-row border-t border-border pt-4">
          <Button type="submit" cargando={enviando}>
            {enviando ? 'Enviando…' : 'Enviar solicitud'}
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
          onConfirmar={confirmar}
          onCancelar={cancelarConfirmacion}
        />
      )}
    </div>
  );
}
