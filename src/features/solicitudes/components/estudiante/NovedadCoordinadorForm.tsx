import { useEnviarSolicitudNovedadCoordinador } from '../../hooks/useEnviarSolicitudNovedadCoordinador';
import SolicitudNovedadForm from './SolicitudNovedadForm';
import type { TextosSolicitudNovedad } from './SolicitudNovedadForm';

const TEXTOS: TextosSolicitudNovedad = {
  titulo: 'Enviar solicitud de novedad al coordinador',
  etiquetaDestinatario: 'Destinatario (UUID del coordinador)',
  placeholderMensaje: 'Describe la novedad que quieres reportar al coordinador',
  recursoAviso: 'coordinadores',
  tituloConfirmacion: 'Enviar solicitud al coordinador',
  descripcionConfirmacion:
    'Se enviará un mensaje de novedad al coordinador indicado. ¿Deseas continuar?',
  mensajeExito: 'El coordinador recibirá tu mensaje.',
};

export default function NovedadCoordinadorForm() {
  const { mutate, isPending, reset } = useEnviarSolicitudNovedadCoordinador();

  return (
    <SolicitudNovedadForm
      textos={TEXTOS}
      enviar={mutate}
      enviando={isPending}
      reiniciar={reset}
    />
  );
}
