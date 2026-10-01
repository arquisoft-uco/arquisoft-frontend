import { useState } from 'react';
import { Plus } from 'lucide-react';
import SolicitudesRecibidasPanel from './coordinador/SolicitudesRecibidasPanel';
import PestanaEnConstruccion from './PestanaEnConstruccion';
import Tabs from './Tabs';

type Tab = 'nueva' | 'recibidas' | 'respondidas';

const TABS: { key: Tab; label: string; icono?: React.ReactNode }[] = [
  { key: 'nueva', label: 'Nueva solicitud', icono: <Plus size={16} aria-hidden /> },
  { key: 'recibidas', label: 'Recibidas' },
  { key: 'respondidas', label: 'Respondidas' },
];

const PANEL_POR_TAB: Record<Tab, React.ReactNode> = {
  nueva: (
    <PestanaEnConstruccion
      titulo="Nueva solicitud"
      descripcion="El envío de solicitudes al administrador estará disponible próximamente."
    />
  ),
  recibidas: <SolicitudesRecibidasPanel />,
  respondidas: (
    <PestanaEnConstruccion
      titulo="Respondidas"
      descripcion="Las solicitudes que hayas respondido estarán disponibles próximamente."
    />
  ),
};

export default function CoordinadorView() {
  const [tab, setTab] = useState<Tab>('recibidas');

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-bold text-on-surface sm:text-2xl">Solicitudes</h1>
        <p className="mt-1 text-sm text-on-surface-secondary">
          Consulta las solicitudes que has recibido y envía las tuyas.
        </p>
      </header>

      <Tabs
        tabs={TABS}
        activa={tab}
        onCambiar={setTab}
        ariaLabel="Secciones de solicitudes"
        idBase="solicitudes"
      >
        {PANEL_POR_TAB[tab]}
      </Tabs>
    </div>
  );
}
