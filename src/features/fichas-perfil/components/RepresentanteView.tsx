import { useState } from 'react';
import type { FichaPerfilRepresentante } from '../models/FichaPerfilRepresentante';
import ConsultarFichasRepresentante from './representante/ConsultarFichasRepresentante';
import DetalleFichaRepresentante from './representante/DetalleFichaRepresentante';

export default function RepresentanteView() {
  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaPerfilRepresentante | null>(null);

  if (fichaSeleccionada) {
    return (
      <DetalleFichaRepresentante
        ficha={fichaSeleccionada}
        onVolver={() => setFichaSeleccionada(null)}
      />
    );
  }

  return <ConsultarFichasRepresentante onSeleccionar={setFichaSeleccionada} />;
}

