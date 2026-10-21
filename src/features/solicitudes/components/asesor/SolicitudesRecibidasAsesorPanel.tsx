import { useSolicitudesNovedadAsesorRecibidas } from '../../hooks/useSolicitudesNovedadAsesorRecibidas';
import ListadoSolicitudesRecibidas from '../ListadoSolicitudesRecibidas';

export default function SolicitudesRecibidasAsesorPanel() {
  const consulta = useSolicitudesNovedadAsesorRecibidas();

  return <ListadoSolicitudesRecibidas consulta={consulta} receptor="asesor" />;
}
