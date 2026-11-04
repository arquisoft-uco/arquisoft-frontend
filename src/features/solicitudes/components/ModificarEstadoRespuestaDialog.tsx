import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import type { RespuestaSolicitud } from '../models/RespuestaSolicitud';
import { TEXTOS_DECISION, type TextosDecision } from '../utils/decisiones-respuesta';

interface MutacionModificarEstado {
  mutate: (
    req: { solicitudId: string; nuevoEstado: string },
    opciones: { onSuccess: () => void; onError: (err: unknown) => void },
  ) => void;
  isPending: boolean;
}

interface Props {
  respuesta: RespuestaSolicitud;
  nuevoEstado: string;
  textos?: Record<string, TextosDecision>;
  mutacion: MutacionModificarEstado;
  onCerrar: () => void;
}

export default function ModificarEstadoRespuestaDialog({
  respuesta,
  nuevoEstado,
  textos: textosDecision = TEXTOS_DECISION,
  mutacion,
  onCerrar,
}: Props) {
  const { mutate, isPending } = mutacion;
  const textos = textosDecision[nuevoEstado];

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
