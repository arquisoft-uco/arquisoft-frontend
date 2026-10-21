import { useState } from 'react';
import SelectorTipoSolicitud from './SelectorTipoSolicitud';
import type { TipoSolicitudUi } from './SelectorTipoSolicitud';
import SolicitudesAsesorEnviadasPanel from './SolicitudesAsesorEnviadasPanel';
import SolicitudesEnviadasPanel from './SolicitudesEnviadasPanel';

const PANEL_POR_TIPO: Record<TipoSolicitudUi, React.ComponentType> = {
  coordinador: SolicitudesEnviadasPanel,
  asesor: SolicitudesAsesorEnviadasPanel,
};

const RAIZ = 'flex flex-col gap-4';

export default function EnviadasPanel() {
  const [tipo, setTipo] = useState<TipoSolicitudUi>('coordinador');

  const PanelElegido = PANEL_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipo} onCambiar={setTipo} />

      <PanelElegido />
    </div>
  );
}
