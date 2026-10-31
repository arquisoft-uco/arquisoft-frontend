import type { TablaRespuestasProps } from '../RespuestasPanel';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import ParticipanteCelda from '../ParticipanteCelda';
import RespuestasTable from '../RespuestasTable';

const VACIO = {
  titulo: 'Aún no has enviado respuestas',
  descripcion: 'Cuando respondas una solicitud desde Recibidas, la respuesta aparecerá aquí.',
};

function celdaCoordinador(respuesta: RespuestaSolicitud) {
  const { nombre, identificador, email } = respuesta.solicitud.remitente;
  return <ParticipanteCelda nombre={nombre} detalle={`${identificador} · ${email}`} />;
}

export default function RespuestasRegistroModificacionUsuariosEnviadasTable({
  respuestas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  acciones,
}: TablaRespuestasProps) {
  return (
    <RespuestasTable
      respuestas={respuestas}
      cargando={cargando}
      hayFiltros={hayFiltros}
      orden={orden}
      onOrdenar={onOrdenar}
      onLimpiarFiltros={onLimpiarFiltros}
      etiqueta="Respuestas de registro y modificación de usuarios enviadas"
      participante={{ encabezado: 'Coordinador', celda: celdaCoordinador }}
      encabezadoFecha="Respondida"
      vacio={VACIO}
      acciones={acciones}
    />
  );
}
