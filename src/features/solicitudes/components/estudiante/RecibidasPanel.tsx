import { useState } from 'react';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import RespuestasAsesorRecibidasPanel from './RespuestasAsesorRecibidasPanel';
import RespuestasCambioAsesorRecibidasPanel from './RespuestasCambioAsesorRecibidasPanel';
import RespuestasRecibidasPanel from './RespuestasRecibidasPanel';
import SelectorTipoSolicitud, {
  TIPOS_SOLICITUD_ENVIABLE,
  type TipoSolicitudEnviableUi,
} from '../SelectorTipoSolicitud';

const PANEL_POR_TIPO: Record<
  TipoSolicitudEnviableUi,
  React.ComponentType<{ filtros: FiltrosRespuestas }>
> = {
  coordinador: RespuestasRecibidasPanel,
  asesor: RespuestasAsesorRecibidasPanel,
  'cambio-asesor': RespuestasCambioAsesorRecibidasPanel,
};

const RAIZ = 'flex flex-col gap-4';

interface Props {
  filtros: Record<TipoSolicitudEnviableUi, FiltrosRespuestas>;
}

export default function RecibidasPanel({ filtros }: Props) {
  const [tipo, setTipo] = useState<TipoSolicitudEnviableUi>('coordinador');

  const PanelElegido = PANEL_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipo} onCambiar={setTipo} opciones={TIPOS_SOLICITUD_ENVIABLE} />

      <PanelElegido filtros={filtros[tipo]} />
    </div>
  );
}
