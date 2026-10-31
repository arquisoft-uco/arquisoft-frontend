import { useEliminarSolicitudRegistroModificacionUsuarios } from '../../hooks/useEliminarSolicitudRegistroModificacionUsuarios';
import { useSolicitudesRegistroModificacionUsuariosEnviadas } from '../../hooks/useSolicitudesRegistroModificacionUsuariosEnviadas';
import ListadoSolicitudesEnviadasEliminable from '../estudiante/ListadoSolicitudesEnviadasEliminable';

export default function SolicitudesRegistroModificacionUsuariosEnviadasPanel() {
  const consulta = useSolicitudesRegistroModificacionUsuariosEnviadas();
  const { mutate: eliminar, isPending: eliminando } =
    useEliminarSolicitudRegistroModificacionUsuarios();

  return (
    <ListadoSolicitudesEnviadasEliminable
      tipo="registro-modificacion-usuarios"
      consulta={consulta}
      eliminar={eliminar}
      eliminando={eliminando}
    />
  );
}
