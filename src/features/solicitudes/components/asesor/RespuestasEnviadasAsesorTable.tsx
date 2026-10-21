import type { TablaRespuestasProps } from '../RespuestasPanel';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import ParticipanteCelda from '../ParticipanteCelda';
import RespuestasTable from '../RespuestasTable';

const VACIO = {
  titulo: 'Aún no has enviado respuestas',
  descripcion: 'Cuando respondas una novedad desde Recibidas, la respuesta aparecerá aquí.',
};

function celdaEstudiante(respuesta: RespuestaSolicitud) {
  const { nombre, identificador, email } = respuesta.solicitud.remitente;
  return <ParticipanteCelda nombre={nombre} detalle={`${identificador} · ${email}`} />;
}

export default function RespuestasEnviadasAsesorTable({
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
      etiqueta="Respuestas de novedades enviadas"
      participante={{ encabezado: 'Estudiante', celda: celdaEstudiante }}
      encabezadoFecha="Respondida"
      vacio={VACIO}
    />
  );
}
