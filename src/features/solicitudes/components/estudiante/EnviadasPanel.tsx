import { useState } from 'react';
import SelectorTipoSolicitud, {
  TIPOS_SOLICITUD_ENVIABLE,
  type TipoSolicitudEnviableUi,
} from '../SelectorTipoSolicitud';
import SolicitudesAsesorEnviadasPanel from './SolicitudesAsesorEnviadasPanel';
import SolicitudesCambioAsesorEnviadasPanel from './SolicitudesCambioAsesorEnviadasPanel';
import SolicitudesEnviadasPanel from './SolicitudesEnviadasPanel';

const PANEL_POR_TIPO: Record<TipoSolicitudEnviableUi, React.ComponentType> = {
  coordinador: SolicitudesEnviadasPanel,
  asesor: SolicitudesAsesorEnviadasPanel,
  'cambio-asesor': SolicitudesCambioAsesorEnviadasPanel,
};

const RAIZ = 'flex flex-col gap-4';

export default function EnviadasPanel() {
  const [tipo, setTipo] = useState<TipoSolicitudEnviableUi>('coordinador');

  const PanelElegido = PANEL_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipo} onCambiar={setTipo} opciones={TIPOS_SOLICITUD_ENVIABLE} />

      <PanelElegido />
    </div>
  );
}
