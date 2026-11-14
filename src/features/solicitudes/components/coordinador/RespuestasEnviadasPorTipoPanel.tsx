import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useTiposSolicitudRecibidas } from '../../hooks/useTiposSolicitudRecibidas';
import PanelPorTipoHabilitado from '../PanelPorTipoHabilitado';
import {
  ID_TIPO_RECIBIDO_BACKEND,
  TIPOS_RESPUESTA_ENVIADA_COORDINADOR,
  type TipoRespuestaEnviadaCoordinadorUi,
} from '../SelectorTipoSolicitud';
import RespuestasAmpliacionPlazoEnviadasPanel from './RespuestasAmpliacionPlazoEnviadasPanel';
import RespuestasCambioAsesorEnviadasPanel from './RespuestasCambioAsesorEnviadasPanel';
import RespuestasEnviadasPanel from './RespuestasEnviadasPanel';

const PANEL_POR_TIPO: Record<
  TipoRespuestaEnviadaCoordinadorUi,
  React.ComponentType<{ filtros: FiltrosRespuestas }>
> = {
  novedad: RespuestasEnviadasPanel,
  'cambio-asesor': RespuestasCambioAsesorEnviadasPanel,
  'ampliacion-plazo': RespuestasAmpliacionPlazoEnviadasPanel,
};

const VACIO_RECIBIR = {
  titulo: 'No tienes tipos de solicitud habilitados para recibir',
  descripcion: 'Si crees que es un error, consulta con el administrador.',
};

interface Props {
  filtros: Record<TipoRespuestaEnviadaCoordinadorUi, FiltrosRespuestas>;
}

export default function RespuestasEnviadasPorTipoPanel({ filtros }: Props) {
  const consulta = useTiposSolicitudRecibidas();

  return (
    <PanelPorTipoHabilitado
      opciones={TIPOS_RESPUESTA_ENVIADA_COORDINADOR}
      idBackend={ID_TIPO_RECIBIDO_BACKEND}
      consulta={consulta}
      vacio={VACIO_RECIBIR}
      renderizar={(tipo) => {
        const PanelElegido = PANEL_POR_TIPO[tipo];
        return <PanelElegido filtros={filtros[tipo]} />;
      }}
    />
  );
}
