import { useEliminarSolicitudNovedadAsesor } from '../../hooks/useEliminarSolicitudNovedadAsesor';
import { useSolicitudesNovedadAsesorEnviadas } from '../../hooks/useSolicitudesNovedadAsesorEnviadas';
import ListadoSolicitudesEnviadasEliminable from './ListadoSolicitudesEnviadasEliminable';

export default function SolicitudesAsesorEnviadasPanel() {
  const consulta = useSolicitudesNovedadAsesorEnviadas();
  const { mutate: eliminar, isPending: eliminando } = useEliminarSolicitudNovedadAsesor();

  return (
    <ListadoSolicitudesEnviadasEliminable
      tipo="asesor"
      consulta={consulta}
      eliminar={eliminar}
      eliminando={eliminando}
    />
  );
}
