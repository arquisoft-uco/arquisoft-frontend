import { useEffect } from 'react';
import { useAdministradoresVigentes } from '../../../../shared/hooks/useAdministradoresVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEnviarSolicitudRegistroModificacionUsuarios } from '../../hooks/useEnviarSolicitudRegistroModificacionUsuarios';
import SolicitudNovedadForm from '../estudiante/SolicitudNovedadForm';
import type { TextosSolicitudNovedad } from '../estudiante/SolicitudNovedadForm';
import SelectorAdministrador from './SelectorAdministrador';
import type { EstadoSelectorAdministrador } from './SelectorAdministrador';

const TEXTOS: TextosSolicitudNovedad = {
  titulo: 'Enviar solicitud de registro y modificación de usuarios',
  etiquetaDestinatario: 'Administrador',
  placeholderMensaje: 'Describe qué usuario necesitas registrar o modificar',
  tituloConfirmacion: 'Enviar solicitud de registro y modificación de usuarios',
  descripcionConfirmacion:
    'Se enviará tu solicitud de registro y modificación de usuarios al administrador seleccionado. ¿Deseas continuar?',
  mensajeExito: 'El administrador recibirá tu solicitud de registro y modificación de usuarios.',
};

export default function RegistroModificacionUsuariosForm() {
  const { mutate, isPending, reset } = useEnviarSolicitudRegistroModificacionUsuarios();
  const { data, isPending: cargando, isError, error } = useAdministradoresVigentes();

  useEffect(() => {
    if (isError) {
      toast.error(
        'No se pudieron cargar los administradores',
        getApiErrorMessage(error, 'Inténtalo nuevamente en unos minutos.'),
      );
    }
  }, [isError, error]);

  const administradores = data?.content ?? [];
  const vacio = !cargando && !isError && administradores.length === 0;

  let estado: EstadoSelectorAdministrador = 'listo';
  if (cargando) estado = 'cargando';
  else if (isError) estado = 'error';
  else if (vacio) estado = 'vacio';

  return (
    <SolicitudNovedadForm
      textos={TEXTOS}
      enviar={mutate}
      enviando={isPending}
      reiniciar={reset}
      envioBloqueado={vacio}
      renderDestinatario={({ registro, error: errorCampo }) => (
        <SelectorAdministrador
          etiqueta={TEXTOS.etiquetaDestinatario}
          estado={estado}
          administradores={administradores}
          registro={registro}
          error={errorCampo}
        />
      )}
    />
  );
}
