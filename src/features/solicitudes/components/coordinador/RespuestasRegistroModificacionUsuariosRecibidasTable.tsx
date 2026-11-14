import type { TablaRespuestasProps } from '../RespuestasPanel';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import ParticipanteCelda from '../ParticipanteCelda';
import RespuestasTable from '../RespuestasTable';

const VACIO = {
  titulo: 'Aún no has recibido respuestas',
  descripcion:
    'Cuando el administrador responda una de tus solicitudes de registro y modificación de usuarios, la respuesta aparecerá aquí.',
};

function celdaAdministrador(respuesta: RespuestaSolicitud) {
  const { nombre, identificador, email } = respuesta.solicitud.destinatario;
  return <ParticipanteCelda nombre={nombre} detalle={`${identificador} · ${email}`} />;
}

export default function RespuestasRegistroModificacionUsuariosRecibidasTable({
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
      etiqueta="Respuestas de registro y modificación de usuarios recibidas"
      participante={{
        encabezado: 'Administrador',
        celda: celdaAdministrador,
        claveOrden: 'destinatarioNombre',
      }}
      encabezadoFecha="Recibida"
      vacio={VACIO}
    />
  );
}
