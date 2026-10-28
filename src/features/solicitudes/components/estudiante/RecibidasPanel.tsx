import { useState } from 'react';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import RespuestasAmpliacionPlazoRecibidasPanel from './RespuestasAmpliacionPlazoRecibidasPanel';
import RespuestasAsesorRecibidasPanel from './RespuestasAsesorRecibidasPanel';
import RespuestasCambioAsesorRecibidasPanel from './RespuestasCambioAsesorRecibidasPanel';
import RespuestasRecibidasPanel from './RespuestasRecibidasPanel';
import SelectorTipoSolicitud, {
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

const RAIZ = 'flex flex-col gap-4';

interface Props {
  filtros: Record<TipoRespuestaRecibidaEstudianteUi, FiltrosRespuestas>;
}

export default function RecibidasPanel({ filtros }: Props) {
  const [tipo, setTipo] = useState<TipoRespuestaRecibidaEstudianteUi>('coordinador');

  const PanelElegido = PANEL_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud
        valor={tipo}
        onCambiar={setTipo}
        opciones={TIPOS_RESPUESTA_RECIBIDA_ESTUDIANTE}
      />

      <PanelElegido filtros={filtros[tipo]} />
    </div>
  );
}
