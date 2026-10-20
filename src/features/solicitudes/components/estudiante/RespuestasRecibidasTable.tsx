import type { TablaRespuestasProps } from '../RespuestasPanel';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import ParticipanteCelda from '../ParticipanteCelda';
import RespuestasTable from '../RespuestasTable';

const VACIO = {
  titulo: 'Aún no has recibido respuestas',
  descripcion:
    'Cuando el coordinador responda una de tus novedades, la respuesta aparecerá aquí. Puedes enviar una desde «Nueva solicitud».',
};

function celdaCoordinador(respuesta: RespuestaSolicitud) {
  const { nombre, email } = respuesta.solicitud.destinatario;
  return <ParticipanteCelda nombre={nombre} detalle={email} />;
}

export default function RespuestasRecibidasTable({
  respuestas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: TablaRespuestasProps) {
  return (
    <RespuestasTable
      respuestas={respuestas}
      cargando={cargando}
      hayFiltros={hayFiltros}
      orden={orden}
      onOrdenar={onOrdenar}
      onLimpiarFiltros={onLimpiarFiltros}
      etiqueta="Respuestas de novedades recibidas"
      participante={{
        encabezado: 'Coordinador',
        celda: celdaCoordinador,
        claveOrden: 'destinatarioNombre',
      }}
      encabezadoFecha="Recibida"
      vacio={VACIO}
    />
  );
}
