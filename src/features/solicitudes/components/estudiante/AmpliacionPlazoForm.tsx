import { useEnviarSolicitudAmpliacionPlazo } from '../../hooks/useEnviarSolicitudAmpliacionPlazo';
import SolicitudNovedadForm from './SolicitudNovedadForm';
import type { TextosSolicitudNovedad } from './SolicitudNovedadForm';

const TEXTOS: TextosSolicitudNovedad = {
  titulo: 'Enviar solicitud de ampliación de plazo',
  etiquetaDestinatario: 'Destinatario (UUID del coordinador)',
  placeholderMensaje: 'Explica por qué necesitas ampliar el plazo',
  recursoAviso: 'coordinadores',
  tituloConfirmacion: 'Enviar solicitud de ampliación de plazo',
  descripcionConfirmacion:
    'Se enviará tu solicitud de ampliación de plazo al destinatario indicado. ¿Deseas continuar?',
  mensajeExito: 'El coordinador recibirá tu solicitud de ampliación de plazo.',
};

export default function AmpliacionPlazoForm() {
  const { mutate, isPending, reset } = useEnviarSolicitudAmpliacionPlazo();

  return (
    <SolicitudNovedadForm textos={TEXTOS} enviar={mutate} enviando={isPending} reiniciar={reset} />
  );
}
