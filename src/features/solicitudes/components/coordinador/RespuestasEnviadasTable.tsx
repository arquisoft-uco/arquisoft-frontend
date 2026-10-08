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

export default function RespuestasEnviadasTable({
  respuestas,
  cargando,
  acciones,
}: TablaRespuestasProps) {
  return (
    <RespuestasTable
      respuestas={respuestas}
      cargando={cargando}
      etiqueta="Respuestas de novedades enviadas"
      participante={{ encabezado: 'Estudiante', celda: celdaEstudiante }}
      encabezadoFecha="Respondida"
      vacio={VACIO}
      acciones={acciones}
    />
  );
}
