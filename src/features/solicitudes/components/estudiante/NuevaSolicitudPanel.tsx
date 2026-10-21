import { useState } from 'react';
import NovedadAsesorForm from './NovedadAsesorForm';
import NovedadCoordinadorForm from './NovedadCoordinadorForm';
import SelectorTipoSolicitud, { type TipoSolicitudUi } from './SelectorTipoSolicitud';

const FORM_POR_TIPO: Record<TipoSolicitudUi, React.ComponentType> = {
  coordinador: NovedadCoordinadorForm,
  asesor: NovedadAsesorForm,
};

const RAIZ = 'flex flex-col gap-4';

export default function NuevaSolicitudPanel() {
  const [tipo, setTipo] = useState<TipoSolicitudUi>('coordinador');

  const FormularioElegido = FORM_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipo} onCambiar={setTipo} />

      <FormularioElegido />
    </div>
  );
}
