import { useEnviarSolicitudCambioAsesor } from '../../hooks/useEnviarSolicitudCambioAsesor';
import SolicitudCoordinadorForm from './SolicitudCoordinadorForm';
import type { TextosSolicitudNovedad } from './SolicitudNovedadForm';

const TEXTOS: TextosSolicitudNovedad = {
  titulo: 'Enviar solicitud de cambio de asesor',
  etiquetaDestinatario: 'Coordinador',
  placeholderMensaje: 'Explica por qué solicitas cambiar de asesor',
  tituloConfirmacion: 'Enviar solicitud de cambio de asesor',
  descripcionConfirmacion:
    'Se enviará tu solicitud de cambio de asesor al coordinador. ¿Deseas continuar?',
  mensajeExito: 'El coordinador recibirá tu solicitud de cambio de asesor.',
};

export default function CambioAsesorForm() {
  const { mutate, isPending, reset } = useEnviarSolicitudCambioAsesor();

  return (
    <SolicitudCoordinadorForm
      textos={TEXTOS}
      enviar={mutate}
      enviando={isPending}
      reiniciar={reset}
    />
  );
}
