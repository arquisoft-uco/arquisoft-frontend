import { useState } from 'react';
import CambioAsesorForm from './CambioAsesorForm';
import NovedadAsesorForm from './NovedadAsesorForm';
import NovedadCoordinadorForm from './NovedadCoordinadorForm';
import SelectorTipoSolicitud, {
  TIPOS_NUEVA_SOLICITUD,
  type TipoNuevaSolicitudUi,
} from './SelectorTipoSolicitud';

const FORM_POR_TIPO: Record<TipoNuevaSolicitudUi, React.ComponentType> = {
  coordinador: NovedadCoordinadorForm,
  asesor: NovedadAsesorForm,
  'cambio-asesor': CambioAsesorForm,
};

const RAIZ = 'flex flex-col gap-4';

export default function NuevaSolicitudPanel() {
  const [tipo, setTipo] = useState<TipoNuevaSolicitudUi>('coordinador');

  const FormularioElegido = FORM_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipo} onCambiar={setTipo} opciones={TIPOS_NUEVA_SOLICITUD} />

      <FormularioElegido />
    </div>
  );
}
