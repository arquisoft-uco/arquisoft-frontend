import { useState } from 'react';
import type { FichaPerfilRepresentante } from '../models/FichaPerfilRepresentante';
import ConsultarFichasRepresentante from './representante/ConsultarFichasRepresentante';
import ComingSoon from '../../../shared/components/ComingSoon';

export default function RepresentanteView() {
  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaPerfilRepresentante | null>(null);

  if (fichaSeleccionada) {
    return (
      <ComingSoon
        title={`Detalle: ${fichaSeleccionada.titulo}`}
        description="El detalle de evaluación de la ficha estará disponible próximamente."
      />
    );
  }

  return <ConsultarFichasRepresentante onSeleccionar={setFichaSeleccionada} />;
}
