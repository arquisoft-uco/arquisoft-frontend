import { useState } from 'react';
import SelectorTipoSolicitud, {
  TIPOS_SOLICITUD_ENVIADA,
  type TipoSolicitudEnviadaUi,
} from '../SelectorTipoSolicitud';
import SolicitudesAmpliacionPlazoEnviadasPanel from './SolicitudesAmpliacionPlazoEnviadasPanel';
import SolicitudesAsesorEnviadasPanel from './SolicitudesAsesorEnviadasPanel';
import SolicitudesCambioAsesorEnviadasPanel from './SolicitudesCambioAsesorEnviadasPanel';
import SolicitudesEnviadasPanel from './SolicitudesEnviadasPanel';

const PANEL_POR_TIPO: Record<TipoSolicitudEnviadaUi, React.ComponentType> = {
  coordinador: SolicitudesEnviadasPanel,
  asesor: SolicitudesAsesorEnviadasPanel,
  'cambio-asesor': SolicitudesCambioAsesorEnviadasPanel,
  'ampliacion-plazo': SolicitudesAmpliacionPlazoEnviadasPanel,
};

const RAIZ = 'flex flex-col gap-4';

export default function EnviadasPanel() {
  const [tipo, setTipo] = useState<TipoSolicitudEnviadaUi>('coordinador');

  const PanelElegido = PANEL_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipo} onCambiar={setTipo} opciones={TIPOS_SOLICITUD_ENVIADA} />

      <PanelElegido />
    </div>
  );
}
