import { useState } from 'react';
import type { FichaPerfilRepresentante } from '../models/FichaPerfilRepresentante';
import PageHeader from '../../../shared/components/ui/PageHeader';
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Fichas de perfil a evaluar"
        descripcion="Busca y abre las fichas que el comité debe revisar."
      />
      <ConsultarFichasRepresentante onSeleccionar={setFichaSeleccionada} />
    </div>
  );
}
