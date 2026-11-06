import AmpliacionPlazoForm from './AmpliacionPlazoForm';
import CambioAsesorForm from './CambioAsesorForm';
import NovedadAsesorForm from './NovedadAsesorForm';
import NovedadCoordinadorForm from './NovedadCoordinadorForm';
import PanelPorTipoHabilitado from '../PanelPorTipoHabilitado';
import { useTiposSolicitud } from '../../hooks/useTiposSolicitud';
import {
  ID_TIPO_BACKEND,
  TIPOS_SOLICITUD_NUEVA,
  type TipoSolicitudNuevaUi,
} from '../SelectorTipoSolicitud';

const FORM_POR_TIPO: Record<TipoSolicitudNuevaUi, React.ComponentType> = {
  coordinador: NovedadCoordinadorForm,
  asesor: NovedadAsesorForm,
  'cambio-asesor': CambioAsesorForm,
  'ampliacion-plazo': AmpliacionPlazoForm,
};

export default function NuevaSolicitudPanel() {
  const consulta = useTiposSolicitud();

  return (
    <PanelPorTipoHabilitado
      opciones={TIPOS_SOLICITUD_NUEVA}
      idBackend={ID_TIPO_BACKEND}
      consulta={consulta}
      renderizar={(tipo) => {
        const FormularioElegido = FORM_POR_TIPO[tipo];
        return <FormularioElegido />;
      }}
    />
  );
}
