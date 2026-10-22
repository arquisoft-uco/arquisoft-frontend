import { useEliminarSolicitudNovedadCoordinador } from '../../hooks/useEliminarSolicitudNovedadCoordinador';
import { useSolicitudesNovedadCoordinadorEnviadas } from '../../hooks/useSolicitudesNovedadCoordinadorEnviadas';
import ListadoSolicitudesEnviadasEliminable from './ListadoSolicitudesEnviadasEliminable';

export default function SolicitudesEnviadasPanel() {
  const consulta = useSolicitudesNovedadCoordinadorEnviadas();
  const { mutate: eliminar, isPending: eliminando } = useEliminarSolicitudNovedadCoordinador();

  return (
    <ListadoSolicitudesEnviadasEliminable
      tipo="coordinador"
      consulta={consulta}
      eliminar={eliminar}
      eliminando={eliminando}
    />
  );
}
