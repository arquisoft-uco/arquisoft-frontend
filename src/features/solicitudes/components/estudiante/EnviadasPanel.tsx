import { useTiposSolicitud } from '../../hooks/useTiposSolicitud';
import PanelPorTipoHabilitado from '../PanelPorTipoHabilitado';
import {
  ID_TIPO_BACKEND,
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

export default function EnviadasPanel() {
  const consulta = useTiposSolicitud();

  return (
    <PanelPorTipoHabilitado
      opciones={TIPOS_SOLICITUD_ENVIADA}
      idBackend={ID_TIPO_BACKEND}
      consulta={consulta}
      renderizar={(tipo) => {
        const PanelElegido = PANEL_POR_TIPO[tipo];
        return <PanelElegido />;
      }}
    />
  );
}
