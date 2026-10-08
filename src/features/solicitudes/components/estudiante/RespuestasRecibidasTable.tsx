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

interface Props {
  respuestas: RespuestaSolicitud[];
  cargando: boolean;
}

export default function RespuestasRecibidasTable({ respuestas, cargando }: Props) {
  return (
    <RespuestasTable
      respuestas={respuestas}
      cargando={cargando}
      etiqueta="Respuestas de novedades recibidas"
      participante={{ encabezado: 'Coordinador', celda: celdaCoordinador }}
      encabezadoFecha="Recibida"
      vacio={VACIO}
    />
  );
}
