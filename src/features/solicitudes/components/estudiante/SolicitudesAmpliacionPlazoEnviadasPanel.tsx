import { useSolicitudesAmpliacionPlazoEnviadas } from '../../hooks/useSolicitudesAmpliacionPlazoEnviadas';
import ListadoSolicitudesEnviadas from './ListadoSolicitudesEnviadas';

export default function SolicitudesAmpliacionPlazoEnviadasPanel() {
  const consulta = useSolicitudesAmpliacionPlazoEnviadas();

  return <ListadoSolicitudesEnviadas tipo="ampliacion-plazo" consulta={consulta} />;
}
