import { useState } from 'react';
import NuevaSolicitudPanel from './estudiante/NuevaSolicitudPanel';
import PestanaEnConstruccion from './PestanaEnConstruccion';
import Tabs from './Tabs';

type Tab = 'nueva' | 'enviadas' | 'respuestas';

const TABS: { key: Tab; label: string }[] = [
  { key: 'nueva', label: 'Nueva solicitud' },
  { key: 'enviadas', label: 'Enviadas' },
  { key: 'respuestas', label: 'Respuestas' },
];

const PANEL_POR_TAB: Record<Tab, React.ReactNode> = {
  nueva: <NuevaSolicitudPanel />,
  enviadas: (
    <PestanaEnConstruccion
      titulo="Solicitudes enviadas"
      descripcion="El seguimiento de tus solicitudes enviadas estará disponible próximamente."
    />
  ),
  respuestas: (
    <PestanaEnConstruccion
      titulo="Respuestas"
      descripcion="Las respuestas a tus solicitudes estarán disponibles próximamente."
    />
  ),
};

export default function EstudianteView() {
  const [tab, setTab] = useState<Tab>('nueva');

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-bold text-on-surface sm:text-2xl">Solicitudes</h1>
        <p className="mt-1 text-sm text-on-surface-secondary">
          Envía solicitudes y consulta su seguimiento.
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
