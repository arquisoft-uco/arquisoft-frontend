import { useState } from 'react';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import SelectorTipoSolicitud, {
  TIPOS_SOLICITUD_RECIBIDA,
  type TipoSolicitudRecibidaUi,
} from '../SelectorTipoSolicitud';
import RespuestasCambioAsesorEnviadasPanel from './RespuestasCambioAsesorEnviadasPanel';
import RespuestasEnviadasPanel from './RespuestasEnviadasPanel';

const PANEL_POR_TIPO: Record<
  TipoSolicitudRecibidaUi,
  React.ComponentType<{ filtros: FiltrosRespuestas }>
> = {
  novedad: RespuestasEnviadasPanel,
  'cambio-asesor': RespuestasCambioAsesorEnviadasPanel,
};

const RAIZ = 'flex flex-col gap-4';

interface Props {
  filtros: Record<TipoSolicitudRecibidaUi, FiltrosRespuestas>;
}

export default function RespuestasEnviadasPorTipoPanel({ filtros }: Props) {
  const [tipo, setTipo] = useState<TipoSolicitudRecibidaUi>('novedad');

  const PanelElegido = PANEL_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipo} onCambiar={setTipo} opciones={TIPOS_SOLICITUD_RECIBIDA} />

      <PanelElegido filtros={filtros[tipo]} />
    </div>
  );
}
