import { useEliminarSolicitudAmpliacionPlazo } from '../../hooks/useEliminarSolicitudAmpliacionPlazo';
import { useSolicitudesAmpliacionPlazoEnviadas } from '../../hooks/useSolicitudesAmpliacionPlazoEnviadas';
import ListadoSolicitudesEnviadasEliminable from './ListadoSolicitudesEnviadasEliminable';

export default function SolicitudesAmpliacionPlazoEnviadasPanel() {
  const consulta = useSolicitudesAmpliacionPlazoEnviadas();
  const { mutate: eliminar, isPending: eliminando } = useEliminarSolicitudAmpliacionPlazo();

  return (
    <ListadoSolicitudesEnviadasEliminable
      tipo="ampliacion-plazo"
      consulta={consulta}
      eliminar={eliminar}
      eliminando={eliminando}
    />
  );
}
