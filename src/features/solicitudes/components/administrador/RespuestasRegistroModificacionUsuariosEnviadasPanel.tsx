import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import RowMenu from '../../../../shared/components/ui/RowMenu';
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
        ]}
      />
    );
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
    </>
  );
}
