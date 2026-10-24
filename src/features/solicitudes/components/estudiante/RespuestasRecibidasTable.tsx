import type { TablaRespuestasProps } from '../RespuestasPanel';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import ParticipanteCelda from '../ParticipanteCelda';
import RespuestasTable from '../RespuestasTable';
import type { TipoSolicitudEnviableUi } from '../SelectorTipoSolicitud';

const TEXTOS_POR_TIPO: Record<
  TipoSolicitudEnviableUi,
  { etiqueta: string; encabezado: string; vacio: { titulo: string; descripcion: string } }
> = {
  coordinador: {
    etiqueta: 'Respuestas de novedades recibidas',
    encabezado: 'Coordinador',
    vacio: {
      titulo: 'Aún no has recibido respuestas',
      descripcion:
        'Cuando el coordinador responda una de tus novedades, la respuesta aparecerá aquí. Puedes enviar una desde «Nueva solicitud».',
    },
  },
  asesor: {
    etiqueta: 'Respuestas de novedades del asesor recibidas',
    encabezado: 'Asesor',
    vacio: {
      titulo: 'Aún no has recibido respuestas',
      descripcion:
        'Cuando tu asesor responda una de tus novedades, la respuesta aparecerá aquí. Puedes enviar una desde «Nueva solicitud».',
    },
  },
  'cambio-asesor': {
    etiqueta: 'Respuestas de cambio de asesor recibidas',
    encabezado: 'Coordinador',
    vacio: {
      titulo: 'Aún no has recibido respuestas',
      descripcion:
        'Cuando el coordinador responda una de tus solicitudes de cambio de asesor, la respuesta aparecerá aquí. Puedes enviar una desde «Nueva solicitud».',
    },
  },
};

function celdaDestinatario(respuesta: RespuestaSolicitud) {
  const { nombre, email } = respuesta.solicitud.destinatario;
  return <ParticipanteCelda nombre={nombre} detalle={email} />;
}

interface Props extends TablaRespuestasProps {
  tipo: TipoSolicitudEnviableUi;
}

export default function RespuestasRecibidasTable({
  tipo,
  respuestas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  const textos = TEXTOS_POR_TIPO[tipo];

  return (
    <RespuestasTable
      respuestas={respuestas}
      cargando={cargando}
      hayFiltros={hayFiltros}
      orden={orden}
      onOrdenar={onOrdenar}
      onLimpiarFiltros={onLimpiarFiltros}
      etiqueta={textos.etiqueta}
      participante={{
        encabezado: textos.encabezado,
        celda: celdaDestinatario,
        claveOrden: 'destinatarioNombre',
      }}
      encabezadoFecha="Recibida"
      vacio={textos.vacio}
    />
  );
}
