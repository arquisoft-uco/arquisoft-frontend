import { useEnviarSolicitudAmpliacionPlazo } from '../../hooks/useEnviarSolicitudAmpliacionPlazo';
import SolicitudCoordinadorForm from './SolicitudCoordinadorForm';
import type { TextosSolicitudNovedad } from './SolicitudNovedadForm';

const TEXTOS: TextosSolicitudNovedad = {
  titulo: 'Enviar solicitud de ampliación de plazo',
  etiquetaDestinatario: 'Coordinador',
  placeholderMensaje: 'Explica por qué necesitas ampliar el plazo',
  tituloConfirmacion: 'Enviar solicitud de ampliación de plazo',
  descripcionConfirmacion:
    'Se enviará tu solicitud de ampliación de plazo al coordinador. ¿Deseas continuar?',
  mensajeExito: 'El coordinador recibirá tu solicitud de ampliación de plazo.',
};

export default function AmpliacionPlazoForm() {
  const { mutate, isPending, reset } = useEnviarSolicitudAmpliacionPlazo();

  return (
    <SolicitudCoordinadorForm
      textos={TEXTOS}
      enviar={mutate}
      enviando={isPending}
      reiniciar={reset}
    />
  );
}
