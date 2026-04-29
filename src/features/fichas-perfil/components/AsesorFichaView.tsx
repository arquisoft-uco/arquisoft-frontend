import { useState } from 'react';
import type { FichaPerfilAsesor } from '../models/FichaPerfilAsesor';
import ConsultarFichasAsesor from './asesor-ficha/ConsultarFichasAsesor';
import DetalleFichaAsesor from './asesor-ficha/DetalleFichaAsesor';

export default function AsesorFichaView() {
  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaPerfilAsesor | null>(null);

  if (fichaSeleccionada) {
    return (
      <DetalleFichaAsesor
        ficha={fichaSeleccionada}
        onVolver={() => setFichaSeleccionada(null)}
      />
    );
  }

  return <ConsultarFichasAsesor onSeleccionar={setFichaSeleccionada} />;
}

