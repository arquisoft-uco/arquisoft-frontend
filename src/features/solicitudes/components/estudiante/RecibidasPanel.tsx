import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import PanelPorTipoHabilitado from './PanelPorTipoHabilitado';
import RespuestasAmpliacionPlazoRecibidasPanel from './RespuestasAmpliacionPlazoRecibidasPanel';
import RespuestasAsesorRecibidasPanel from './RespuestasAsesorRecibidasPanel';
import RespuestasCambioAsesorRecibidasPanel from './RespuestasCambioAsesorRecibidasPanel';
import RespuestasRecibidasPanel from './RespuestasRecibidasPanel';
import {
  TIPOS_RESPUESTA_RECIBIDA_ESTUDIANTE,
  type TipoRespuestaRecibidaEstudianteUi,
} from '../SelectorTipoSolicitud';

const PANEL_POR_TIPO: Record<
  TipoRespuestaRecibidaEstudianteUi,
  React.ComponentType<{ filtros: FiltrosRespuestas }>
> = {
  coordinador: RespuestasRecibidasPanel,
  asesor: RespuestasAsesorRecibidasPanel,
  'cambio-asesor': RespuestasCambioAsesorRecibidasPanel,
  'ampliacion-plazo': RespuestasAmpliacionPlazoRecibidasPanel,
};

interface Props {
  filtros: Record<TipoRespuestaRecibidaEstudianteUi, FiltrosRespuestas>;
}

export default function RecibidasPanel({ filtros }: Props) {
  return (
    <PanelPorTipoHabilitado
      opciones={TIPOS_RESPUESTA_RECIBIDA_ESTUDIANTE}
      renderizar={(tipo) => {
        const PanelElegido = PANEL_POR_TIPO[tipo];
        return <PanelElegido filtros={filtros[tipo]} />;
      }}
    />
  );
}
