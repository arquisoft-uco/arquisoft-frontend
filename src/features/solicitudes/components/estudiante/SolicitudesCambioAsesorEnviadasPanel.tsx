import { useSolicitudesCambioAsesorEnviadas } from '../../hooks/useSolicitudesCambioAsesorEnviadas';
import ListadoSolicitudesEnviadas from './ListadoSolicitudesEnviadas';

export default function SolicitudesCambioAsesorEnviadasPanel() {
  const consulta = useSolicitudesCambioAsesorEnviadas();

  return <ListadoSolicitudesEnviadas tipo="cambio-asesor" consulta={consulta} />;
}
