import { useEliminarSolicitudCambioAsesor } from '../../hooks/useEliminarSolicitudCambioAsesor';
import { useSolicitudesCambioAsesorEnviadas } from '../../hooks/useSolicitudesCambioAsesorEnviadas';
import ListadoSolicitudesEnviadasEliminable from './ListadoSolicitudesEnviadasEliminable';

export default function SolicitudesCambioAsesorEnviadasPanel() {
  const consulta = useSolicitudesCambioAsesorEnviadas();
  const { mutate: eliminar, isPending: eliminando } = useEliminarSolicitudCambioAsesor();

  return (
    <ListadoSolicitudesEnviadasEliminable
      tipo="cambio-asesor"
      consulta={consulta}
      eliminar={eliminar}
      eliminando={eliminando}
    />
  );
}
