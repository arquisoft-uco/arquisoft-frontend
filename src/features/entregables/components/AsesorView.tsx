import { useState, type ComponentType } from 'react';
import { useLocation } from 'react-router';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarEntregablesAsesor from './asesor/ConsultarEntregablesAsesor';
import ConsultarEstadosEntregableAsesor from './asesor/ConsultarEstadosEntregableAsesor';
import GenerarEntregablePanel from './asesor/GenerarEntregablePanel';

type Vista = 'entregables' | 'estados';

const CONTENIDO_POR_VISTA: Record<Vista, ComponentType> = {
  entregables: ConsultarEntregablesAsesor,
  estados: ConsultarEstadosEntregableAsesor,
};

function leerVista(valor: string): Vista {
  return Object.keys(CONTENIDO_POR_VISTA).includes(valor) ? (valor as Vista) : 'entregables';
}

export default function AsesorView() {
  const { pathname } = useLocation();
  const vista = leerVista(useParametrosListado().texto('vista'));
  const Contenido = CONTENIDO_POR_VISTA[vista];
  const [panelAbierto, setPanelAbierto] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Entregables"
        descripcion="Consulta los entregables de tus proyectos de grado y los estados por los que pasa un entregable."
        acciones={<Button onClick={() => setPanelAbierto(true)}>Generar entregable</Button>}
      />
      <Tabs
        etiqueta="Secciones de entregables"
        valor={vista}
        items={[
          { id: 'entregables', etiqueta: 'Entregables generados', to: pathname },
          { id: 'estados', etiqueta: 'Estados de entregable', to: `${pathname}?vista=estados` },
        ]}
      />
      <Contenido />
      {panelAbierto && <GenerarEntregablePanel onCerrar={() => setPanelAbierto(false)} />}
    </div>
  );
}
