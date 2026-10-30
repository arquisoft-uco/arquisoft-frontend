import { useEnviarSolicitudRegistroModificacionUsuarios } from '../../hooks/useEnviarSolicitudRegistroModificacionUsuarios';
import SolicitudNovedadForm from '../estudiante/SolicitudNovedadForm';
import type { TextosSolicitudNovedad } from '../estudiante/SolicitudNovedadForm';

const TEXTOS: TextosSolicitudNovedad = {
  titulo: 'Enviar solicitud de registro y modificación de usuarios',
  etiquetaDestinatario: 'Destinatario (identificador del administrador)',
  placeholderMensaje: 'Describe qué usuario necesitas registrar o modificar',
  recursoAviso: 'administradores',
  tituloConfirmacion: 'Enviar solicitud de registro y modificación de usuarios',
  descripcionConfirmacion:
    'Se enviará tu solicitud de registro y modificación de usuarios al destinatario indicado. ¿Deseas continuar?',
  mensajeExito: 'El administrador recibirá tu solicitud de registro y modificación de usuarios.',
};

export default function RegistroModificacionUsuariosForm() {
  const { mutate, isPending, reset } = useEnviarSolicitudRegistroModificacionUsuarios();

  return (
    <SolicitudNovedadForm textos={TEXTOS} enviar={mutate} enviando={isPending} reiniciar={reset} />
  );
}
