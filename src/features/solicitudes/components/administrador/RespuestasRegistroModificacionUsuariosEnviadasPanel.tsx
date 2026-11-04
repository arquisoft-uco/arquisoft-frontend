import { useState } from 'react';
import { CheckCircle2, Trash2, XCircle } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEliminarRespuestaRegistroModificacionUsuarios } from '../../hooks/useEliminarRespuestaRegistroModificacionUsuarios';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useModificarEstadoRespuestaRegistroModificacionUsuarios } from '../../hooks/useModificarEstadoRespuestaRegistroModificacionUsuarios';
import { useRespuestasRegistroModificacionUsuariosEnviadas } from '../../hooks/useRespuestasRegistroModificacionUsuariosEnviadas';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import {
  ESTADO_RESPUESTA_APROBADA,
  ESTADO_RESPUESTA_EN_REVISION,
  ESTADO_RESPUESTA_NO_APROBADA,
  TEXTOS_DECISION_COORDINADOR,
} from '../../utils/decisiones-respuesta';
import ModificarEstadoRespuestaDialog from '../ModificarEstadoRespuestaDialog';
import RespuestasPanel from '../RespuestasPanel';
import RespuestasRegistroModificacionUsuariosEnviadasTable from './RespuestasRegistroModificacionUsuariosEnviadasTable';

const CONSECUENCIAS = [
  'El coordinador dejará de ver la respuesta.',
  'La solicitud quedará sin respuesta y podrás responderla de nuevo.',
  'No se puede deshacer.',
];

interface Props {
  filtros: FiltrosRespuestas;
}

export default function RespuestasRegistroModificacionUsuariosEnviadasPanel({ filtros }: Props) {
  const consulta = useRespuestasRegistroModificacionUsuariosEnviadas(filtros);
  const modificarEstado = useModificarEstadoRespuestaRegistroModificacionUsuarios();
  const [pendienteDecision, setPendienteDecision] = useState<{
    respuesta: RespuestaSolicitud;
    nuevoEstado: string;
  } | null>(null);
  const { mutate: eliminar, isPending: eliminando } =
    useEliminarRespuestaRegistroModificacionUsuarios();
  const [pendienteEliminar, setPendienteEliminar] = useState<RespuestaSolicitud | null>(null);

  function acciones(respuesta: RespuestaSolicitud) {
    if (respuesta.estadoRespuestaId !== ESTADO_RESPUESTA_EN_REVISION) return null;
    return (
      <RowMenu
        etiqueta={`Acciones de la respuesta a ${respuesta.solicitud.remitente.nombre}`}
        acciones={[
          {
            etiqueta: TEXTOS_DECISION_COORDINADOR[ESTADO_RESPUESTA_APROBADA].etiquetaAccion,
            icono: CheckCircle2,
            onSeleccionar: () =>
              setPendienteDecision({ respuesta, nuevoEstado: ESTADO_RESPUESTA_APROBADA }),
          },
          {
            etiqueta: TEXTOS_DECISION_COORDINADOR[ESTADO_RESPUESTA_NO_APROBADA].etiquetaAccion,
            icono: XCircle,
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
        if ((consulta.data?.content.length ?? 0) === 1 && filtros.page > 0) {
          filtros.goToPage(filtros.page - 1);
        }
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
        filtros={filtros}
        Tabla={RespuestasRegistroModificacionUsuariosEnviadasTable}
        acciones={acciones}
      />
      {pendienteDecision && (
        <ModificarEstadoRespuestaDialog
          respuesta={pendienteDecision.respuesta}
          nuevoEstado={pendienteDecision.nuevoEstado}
          textos={TEXTOS_DECISION_COORDINADOR}
          mutacion={modificarEstado}
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
