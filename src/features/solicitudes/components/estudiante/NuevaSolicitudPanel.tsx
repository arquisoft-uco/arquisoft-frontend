import { useState } from 'react';
import AmpliacionPlazoForm from './AmpliacionPlazoForm';
import CambioAsesorForm from './CambioAsesorForm';
import NovedadAsesorForm from './NovedadAsesorForm';
import NovedadCoordinadorForm from './NovedadCoordinadorForm';
import SelectorTipoSolicitud, {
  TIPOS_SOLICITUD_NUEVA,
  type TipoSolicitudNuevaUi,
} from '../SelectorTipoSolicitud';

const FORM_POR_TIPO: Record<TipoSolicitudNuevaUi, React.ComponentType> = {
  coordinador: NovedadCoordinadorForm,
  asesor: NovedadAsesorForm,
  'cambio-asesor': CambioAsesorForm,
  'ampliacion-plazo': AmpliacionPlazoForm,
};

const RAIZ = 'flex flex-col gap-4';

export default function NuevaSolicitudPanel() {
  const [tipo, setTipo] = useState<TipoSolicitudNuevaUi>('coordinador');

  const FormularioElegido = FORM_POR_TIPO[tipo];

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipo} onCambiar={setTipo} opciones={TIPOS_SOLICITUD_NUEVA} />

      <FormularioElegido />
    </div>
  );
}
