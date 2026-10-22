import { useEnviarSolicitudCambioAsesor } from '../../hooks/useEnviarSolicitudCambioAsesor';
import SolicitudNovedadForm from './SolicitudNovedadForm';
import type { TextosSolicitudNovedad } from './SolicitudNovedadForm';

const TEXTOS: TextosSolicitudNovedad = {
  titulo: 'Enviar solicitud de cambio de asesor',
  etiquetaDestinatario: 'Destinatario (UUID del coordinador)',
  placeholderMensaje: 'Explica por qué solicitas cambiar de asesor',
  recursoAviso: 'coordinadores',
  tituloConfirmacion: 'Enviar solicitud de cambio de asesor',
  descripcionConfirmacion:
    'Se enviará tu solicitud de cambio de asesor al destinatario indicado. ¿Deseas continuar?',
  mensajeExito: 'El coordinador recibirá tu solicitud de cambio de asesor.',
};

export default function CambioAsesorForm() {
  const { mutate, isPending, reset } = useEnviarSolicitudCambioAsesor();

  return (
    <SolicitudNovedadForm textos={TEXTOS} enviar={mutate} enviando={isPending} reiniciar={reset} />
  );
}
