import { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import NuevaSolicitudPanel from './estudiante/NuevaSolicitudPanel';
import PestanaEnConstruccion from './PestanaEnConstruccion';
import Tabs from './Tabs';

type Tab = 'nueva' | 'enviadas' | 'respuestas';

const TABS: { key: Tab; label: string; icono?: React.ReactNode }[] = [
  { key: 'nueva', label: 'Nueva solicitud', icono: <Plus size={16} aria-hidden /> },
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
      <PageHeader titulo="Solicitudes" descripcion="Envía solicitudes y consulta su seguimiento." />

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
