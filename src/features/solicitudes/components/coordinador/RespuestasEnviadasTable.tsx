import type { TablaRespuestasProps } from '../RespuestasPanel';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import ParticipanteCelda from '../ParticipanteCelda';
import RespuestasTable from '../RespuestasTable';
import type { TipoRespuestaEnviadaCoordinadorUi } from '../SelectorTipoSolicitud';

const TEXTOS_POR_TIPO: Record<
  TipoRespuestaEnviadaCoordinadorUi,
  { etiqueta: string; vacio: { titulo: string; descripcion: string } }
> = {
  novedad: {
    etiqueta: 'Respuestas de novedades enviadas',
    vacio: {
      titulo: 'Aún no has enviado respuestas',
      descripcion: 'Cuando respondas una novedad desde Recibidas, la respuesta aparecerá aquí.',
    },
  },
  'cambio-asesor': {
    etiqueta: 'Respuestas de cambio de asesor enviadas',
    vacio: {
      titulo: 'Aún no has enviado respuestas',
      descripcion:
        'Cuando respondas una solicitud de cambio de asesor desde Recibidas, la respuesta aparecerá aquí.',
    },
  },
  'ampliacion-plazo': {
    etiqueta: 'Respuestas de ampliación de plazo enviadas',
    vacio: {
      titulo: 'Aún no has enviado respuestas',
      descripcion:
        'Cuando respondas una solicitud de ampliación de plazo desde Recibidas, la respuesta aparecerá aquí.',
    },
  },
};

function celdaEstudiante(respuesta: RespuestaSolicitud) {
  const { nombre, identificador, email } = respuesta.solicitud.remitente;
  return <ParticipanteCelda nombre={nombre} detalle={`${identificador} · ${email}`} />;
}

export default function RespuestasEnviadasTable({
  respuestas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  acciones,
  tipo = 'novedad',
}: TablaRespuestasProps & { tipo?: TipoRespuestaEnviadaCoordinadorUi }) {
  const { etiqueta, vacio } = TEXTOS_POR_TIPO[tipo];

  return (
    <RespuestasTable
      respuestas={respuestas}
      cargando={cargando}
      hayFiltros={hayFiltros}
      orden={orden}
      onOrdenar={onOrdenar}
      onLimpiarFiltros={onLimpiarFiltros}
      etiqueta={etiqueta}
      participante={{ encabezado: 'Estudiante', celda: celdaEstudiante }}
      encabezadoFecha="Respondida"
      vacio={vacio}
      acciones={acciones}
    />
  );
}
