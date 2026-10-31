import { useSolicitudesRegistroModificacionUsuariosEnviadas } from '../../hooks/useSolicitudesRegistroModificacionUsuariosEnviadas';
import ListadoSolicitudesEnviadas from '../estudiante/ListadoSolicitudesEnviadas';

export default function SolicitudesRegistroModificacionUsuariosEnviadasPanel() {
  const consulta = useSolicitudesRegistroModificacionUsuariosEnviadas();

  return <ListadoSolicitudesEnviadas tipo="registro-modificacion-usuarios" consulta={consulta} />;
}
