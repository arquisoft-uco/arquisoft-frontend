import { useState } from 'react';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import RespuestasAsesorRecibidasPanel from './RespuestasAsesorRecibidasPanel';
import RespuestasRecibidasPanel from './RespuestasRecibidasPanel';
import SelectorTipoSolicitud, {
  TIPOS_SOLICITUD,
  type TipoSolicitudUi,
} from './SelectorTipoSolicitud';

const PANEL_POR_TIPO: Record<
  TipoSolicitudUi,
  React.ComponentType<{ filtros: FiltrosRespuestas }>
> = {
  coordinador: RespuestasRecibidasPanel,
  asesor: RespuestasAsesorRecibidasPanel,
};

const RAIZ = 'flex flex-col gap-4';

interface Props {
  filtros: Record<TipoSolicitudUi, FiltrosRespuestas>;
}

export default function RecibidasPanel({ filtros }: Props) {
  const [tipo, setTipo] = useState<TipoSolicitudUi>('coordinador');

  const PanelElegido = PANEL_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipo} onCambiar={setTipo} opciones={TIPOS_SOLICITUD} />

      <PanelElegido filtros={filtros[tipo]} />
    </div>
  );
}
