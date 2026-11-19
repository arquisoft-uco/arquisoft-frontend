import { useEffect } from 'react';
import { useAsesoresActualesEstudiante } from '../../../../shared/hooks/useAsesoresActualesEstudiante';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEnviarSolicitudNovedadAsesor } from '../../hooks/useEnviarSolicitudNovedadAsesor';
import { estadoSelectorDestinatario } from '../../utils/estado-selector-destinatario';
import type { EstadoSelectorDestinatario } from '../../utils/estado-selector-destinatario';
import SelectorDestinatario from '../SelectorDestinatario';
import SolicitudNovedadForm from './SolicitudNovedadForm';
import type { TextosSolicitudNovedad } from './SolicitudNovedadForm';

const TEXTOS: TextosSolicitudNovedad = {
  titulo: 'Enviar solicitud de novedad al asesor',
  etiquetaDestinatario: 'Asesor',
  placeholderMensaje: 'Describe la novedad que quieres reportar al asesor',
  tituloConfirmacion: 'Enviar solicitud al asesor',
  descripcionConfirmacion:
    'Se enviará un mensaje de novedad al asesor indicado. ¿Deseas continuar?',
  mensajeExito: 'El asesor recibirá tu mensaje.',
};

const TEXTOS_SELECTOR: Record<EstadoSelectorDestinatario, string> = {
  cargando: 'Cargando asesores…',
  vacio: 'No tienes un asesor asignado actualmente',
  error: 'No se pudieron cargar los asesores',
  listo: 'Selecciona un asesor',
};

export default function NovedadAsesorForm() {
  const { mutate, isPending, reset } = useEnviarSolicitudNovedadAsesor();
  const { data, isPending: cargando, isError, error } = useAsesoresActualesEstudiante();

  useEffect(() => {
    if (isError) {
      toast.error(
        'No se pudieron cargar los asesores',
        getApiErrorMessage(error, 'Inténtalo de nuevo.'),
      );
    }
  }, [isError, error]);

  const asesores = data ?? [];
  const estado = estadoSelectorDestinatario({
    cargando,
    error: isError,
    cantidad: asesores.length,
  });
  const opciones = asesores.map((asesor) => ({
    clave: asesor.proyectoGradoId,
    valor: asesor.asesorId,
    etiqueta: `${asesor.nombre} — ${asesor.tituloProyecto}`,
  }));

  return (
    <SolicitudNovedadForm
      textos={TEXTOS}
      enviar={mutate}
      enviando={isPending}
      reiniciar={reset}
      envioBloqueado={estado !== 'listo'}
      renderDestinatario={({ registro, error: errorCampo }) => (
        <SelectorDestinatario
          etiqueta={TEXTOS.etiquetaDestinatario}
          estado={estado}
          opciones={opciones}
          textos={TEXTOS_SELECTOR}
          registro={registro}
          error={errorCampo}
        />
      )}
    />
  );
}
