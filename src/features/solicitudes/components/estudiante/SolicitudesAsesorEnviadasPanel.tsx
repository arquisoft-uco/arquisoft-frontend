import { useSolicitudesNovedadAsesorEnviadas } from '../../hooks/useSolicitudesNovedadAsesorEnviadas';
import ListadoSolicitudesEnviadas from './ListadoSolicitudesEnviadas';

export default function SolicitudesAsesorEnviadasPanel() {
  const consulta = useSolicitudesNovedadAsesorEnviadas();

  return <ListadoSolicitudesEnviadas tipo="asesor" consulta={consulta} />;
}
