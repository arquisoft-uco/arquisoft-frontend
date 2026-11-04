import { useTiposSolicitudRecibidas } from '../../hooks/useTiposSolicitudRecibidas';
import PanelPorTipoHabilitado from '../PanelPorTipoHabilitado';
import {
  ID_TIPO_RECIBIDO_BACKEND,
  TIPOS_SOLICITUD_RECIBIDA,
  type TipoSolicitudRecibidaUi,
} from '../SelectorTipoSolicitud';
import SolicitudesAmpliacionPlazoRecibidasPanel from './SolicitudesAmpliacionPlazoRecibidasPanel';
import SolicitudesCambioAsesorRecibidasPanel from './SolicitudesCambioAsesorRecibidasPanel';
import SolicitudesRecibidasPanel from './SolicitudesRecibidasPanel';

const PANEL_POR_TIPO: Record<
  TipoSolicitudRecibidaUi,
  React.ComponentType<{ page: number; onPageChange: (page: number) => void }>
> = {
  novedad: SolicitudesRecibidasPanel,
  'cambio-asesor': SolicitudesCambioAsesorRecibidasPanel,
  'ampliacion-plazo': SolicitudesAmpliacionPlazoRecibidasPanel,
};

const VACIO_RECIBIR = {
  titulo: 'No tienes tipos de solicitud habilitados para recibir',
  descripcion: 'Si crees que es un error, consulta con el administrador.',
};

interface Props {
  paginas: Record<TipoSolicitudRecibidaUi, number>;
  onPageChange: (tipo: TipoSolicitudRecibidaUi, page: number) => void;
}

export default function RecibidasPanel({ paginas, onPageChange }: Props) {
  const consulta = useTiposSolicitudRecibidas();

  return (
    <PanelPorTipoHabilitado
      opciones={TIPOS_SOLICITUD_RECIBIDA}
      idBackend={ID_TIPO_RECIBIDO_BACKEND}
      consulta={consulta}
      vacio={VACIO_RECIBIR}
      renderizar={(tipo) => {
        const PanelElegido = PANEL_POR_TIPO[tipo];
        return (
          <PanelElegido page={paginas[tipo]} onPageChange={(page) => onPageChange(tipo, page)} />
        );
      }}
    />
  );
}
