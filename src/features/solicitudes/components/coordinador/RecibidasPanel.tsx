import { useState } from 'react';
import SelectorTipoSolicitud, {
  TIPOS_SOLICITUD_RECIBIDA,
  type TipoSolicitudRecibidaUi,
} from '../SelectorTipoSolicitud';
import SolicitudesCambioAsesorRecibidasPanel from './SolicitudesCambioAsesorRecibidasPanel';
import SolicitudesRecibidasPanel from './SolicitudesRecibidasPanel';

const PANEL_POR_TIPO: Record<
  TipoSolicitudRecibidaUi,
  React.ComponentType<{ page: number; onPageChange: (page: number) => void }>
> = {
  novedad: SolicitudesRecibidasPanel,
  'cambio-asesor': SolicitudesCambioAsesorRecibidasPanel,
};

const RAIZ = 'flex flex-col gap-4';

interface Props {
  paginas: Record<TipoSolicitudRecibidaUi, number>;
  onPageChange: (tipo: TipoSolicitudRecibidaUi, page: number) => void;
}

export default function RecibidasPanel({ paginas, onPageChange }: Props) {
  const [tipo, setTipo] = useState<TipoSolicitudRecibidaUi>('novedad');

  const PanelElegido = PANEL_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipo} onCambiar={setTipo} opciones={TIPOS_SOLICITUD_RECIBIDA} />

      <PanelElegido page={paginas[tipo]} onPageChange={(page) => onPageChange(tipo, page)} />
    </div>
  );
}
