import { useState } from 'react';
import { CheckCircle2, Trash2, XCircle } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEliminarRespuestaNovedadCoordinador } from '../../hooks/useEliminarRespuestaNovedadCoordinador';
import { useRespuestasNovedadCoordinadorEnviadas } from '../../hooks/useRespuestasNovedadCoordinadorEnviadas';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import {
  ESTADO_RESPUESTA_APROBADA,
  ESTADO_RESPUESTA_NO_APROBADA,
  TEXTOS_DECISION,
} from '../../utils/decisiones-respuesta';
import RespuestasPanel from '../RespuestasPanel';
import ModificarEstadoRespuestaDialog from './ModificarEstadoRespuestaDialog';
import RespuestasEnviadasTable from './RespuestasEnviadasTable';

const ESTADO_RESPUESTA_EN_REVISION = 'EN_REVISION';

const CONSECUENCIAS = [
  'El estudiante dejará de ver la respuesta en sus respuestas recibidas.',
  'La solicitud quedará sin respuesta y podrás responderla de nuevo.',
  'No se puede deshacer.',
];

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function RespuestasEnviadasPanel({ page, onPageChange }: Props) {
  const consulta = useRespuestasNovedadCoordinadorEnviadas(page);
  const { mutate: eliminar, isPending: eliminando } = useEliminarRespuestaNovedadCoordinador();
  const [pendienteEliminar, setPendienteEliminar] = useState<RespuestaSolicitud | null>(null);
  const [pendienteDecision, setPendienteDecision] = useState<{
    respuesta: RespuestaSolicitud;
    nuevoEstado: string;
  } | null>(null);

  function acciones(respuesta: RespuestaSolicitud) {
    if (respuesta.estadoRespuestaId !== ESTADO_RESPUESTA_EN_REVISION) return null;
    return (
      <RowMenu
        etiqueta={`Acciones de la respuesta a ${respuesta.solicitud.remitente.nombre}`}
        acciones={[
          {
            etiqueta: TEXTOS_DECISION[ESTADO_RESPUESTA_APROBADA].etiquetaAccion,
            icono: CheckCircle2,
            deshabilitada: eliminando,
            onSeleccionar: () =>
              setPendienteDecision({ respuesta, nuevoEstado: ESTADO_RESPUESTA_APROBADA }),
          },
          {
            etiqueta: TEXTOS_DECISION[ESTADO_RESPUESTA_NO_APROBADA].etiquetaAccion,
            icono: XCircle,
            deshabilitada: eliminando,
            onSeleccionar: () =>
              setPendienteDecision({ respuesta, nuevoEstado: ESTADO_RESPUESTA_NO_APROBADA }),
          },
          {
            etiqueta: 'Eliminar respuesta',
            icono: Trash2,
            peligro: true,
            deshabilitada: eliminando,
            onSeleccionar: () => setPendienteEliminar(respuesta),
          },
        ]}
      />
    );
  }

  function handleConfirmarEliminar() {
    if (!pendienteEliminar) return;
    eliminar(pendienteEliminar.solicitud.id, {
      onSuccess: () => {
        toast.success('Respuesta eliminada', 'La respuesta fue eliminada correctamente.');
        setPendienteEliminar(null);
        if ((consulta.data?.content.length ?? 0) === 1 && page > 0) onPageChange(page - 1);
      },
      onError: (err) => {
        toast.error(
          'No se pudo eliminar la respuesta',
          getApiErrorMessage(err, 'Inténtalo nuevamente.'),
        );
        setPendienteEliminar(null);
      },
    });
  }

  function handleCancelarEliminar() {
    if (eliminando) return;
    setPendienteEliminar(null);
  }

  return (
    <>
      <RespuestasPanel
        consulta={consulta}
        page={page}
        onPageChange={onPageChange}
        Tabla={RespuestasEnviadasTable}
        acciones={acciones}
      />
      {pendienteDecision && (
        <ModificarEstadoRespuestaDialog
          respuesta={pendienteDecision.respuesta}
          nuevoEstado={pendienteDecision.nuevoEstado}
          onCerrar={() => setPendienteDecision(null)}
        />
      )}
      {pendienteEliminar && (
        <ConfirmDialog
          variante="peligro"
          titulo="¿Eliminar respuesta?"
          descripcion={`Vas a eliminar tu respuesta a ${pendienteEliminar.solicitud.remitente.nombre}.`}
          consecuencias={CONSECUENCIAS}
          labelConfirmar="Eliminar"
          cargando={eliminando}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={handleCancelarEliminar}
        />
      )}
    </>
  );
}
