import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useModificarEstadoRespuestaNovedadCoordinador } from '../../hooks/useModificarEstadoRespuestaNovedadCoordinador';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import { TEXTOS_DECISION } from '../../utils/decisiones-respuesta';

interface Props {
  respuesta: RespuestaSolicitud;
  nuevoEstado: string;
  onCerrar: () => void;
}

export default function ModificarEstadoRespuestaDialog({
  respuesta,
  nuevoEstado,
  onCerrar,
}: Props) {
  const { mutate, isPending } = useModificarEstadoRespuestaNovedadCoordinador();
  const textos = TEXTOS_DECISION[nuevoEstado];

  function handleConfirmar() {
    mutate(
      { solicitudId: respuesta.solicitud.id, nuevoEstado },
      {
        onSuccess: () => {
          toast.success(textos.tituloExito, textos.mensajeExito);
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            'No se pudo cambiar el estado de la respuesta',
            getApiErrorMessage(err, 'Inténtalo nuevamente.'),
          );
          onCerrar();
        },
      },
    );
  }

  function handleCancelar() {
    if (isPending) return;
    onCerrar();
  }

  return (
    <ConfirmDialog
      variante="advertencia"
      titulo={textos.titulo}
      descripcion={textos.descripcion(respuesta.solicitud.remitente.nombre)}
      consecuencias={textos.consecuencias}
      labelConfirmar={textos.labelConfirmar}
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={handleCancelar}
    />
  );
}
