import { useState } from 'react';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import SelectorTipoSolicitud, {
  TIPOS_RESPUESTA_ENVIADA_COORDINADOR,
  type TipoRespuestaEnviadaCoordinadorUi,
} from '../SelectorTipoSolicitud';
import RespuestasCambioAsesorEnviadasPanel from './RespuestasCambioAsesorEnviadasPanel';
import RespuestasEnviadasPanel from './RespuestasEnviadasPanel';

const PANEL_POR_TIPO: Record<
  TipoRespuestaEnviadaCoordinadorUi,
  React.ComponentType<{ filtros: FiltrosRespuestas }>
> = {
  novedad: RespuestasEnviadasPanel,
  'cambio-asesor': RespuestasCambioAsesorEnviadasPanel,
};

const RAIZ = 'flex flex-col gap-4';

interface Props {
  filtros: Record<TipoRespuestaEnviadaCoordinadorUi, FiltrosRespuestas>;
}

export default function RespuestasEnviadasPorTipoPanel({ filtros }: Props) {
  const [tipo, setTipo] = useState<TipoRespuestaEnviadaCoordinadorUi>('novedad');

  const PanelElegido = PANEL_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud
        valor={tipo}
        onCambiar={setTipo}
        opciones={TIPOS_RESPUESTA_ENVIADA_COORDINADOR}
      />

      <PanelElegido filtros={filtros[tipo]} />
    </div>
  );
}
