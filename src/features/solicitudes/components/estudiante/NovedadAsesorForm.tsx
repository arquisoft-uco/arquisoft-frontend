import { useEnviarSolicitudNovedadAsesor } from '../../hooks/useEnviarSolicitudNovedadAsesor';
import SolicitudNovedadForm from './SolicitudNovedadForm';
import type { TextosSolicitudNovedad } from './SolicitudNovedadForm';

const TEXTOS: TextosSolicitudNovedad = {
  titulo: 'Enviar solicitud de novedad al asesor',
  etiquetaDestinatario: 'Destinatario (identificador del asesor)',
  placeholderMensaje: 'Describe la novedad que quieres reportar al asesor',
  recursoAviso: 'asesores',
  tituloConfirmacion: 'Enviar solicitud al asesor',
  descripcionConfirmacion:
    'Se enviará un mensaje de novedad al asesor indicado. ¿Deseas continuar?',
  mensajeExito: 'El asesor recibirá tu mensaje.',
};

export default function NovedadAsesorForm() {
  const { mutate, isPending, reset } = useEnviarSolicitudNovedadAsesor();

  return (
    <SolicitudNovedadForm textos={TEXTOS} enviar={mutate} enviando={isPending} reiniciar={reset} />
  );
}
