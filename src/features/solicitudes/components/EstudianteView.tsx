import { useState } from 'react';
import { Clock, Plus, type LucideIcon } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import NuevaSolicitudPanel from './estudiante/NuevaSolicitudPanel';
import SolicitudesEnviadasPanel from './estudiante/SolicitudesEnviadasPanel';

type Pestana = 'nueva' | 'enviadas' | 'respuestas';

const PESTANAS: { id: Pestana; etiqueta: string; icono?: LucideIcon }[] = [
  { id: 'nueva', etiqueta: 'Nueva solicitud', icono: Plus },
  { id: 'enviadas', etiqueta: 'Enviadas' },
  { id: 'respuestas', etiqueta: 'Respuestas' },
];

const PANEL_POR_PESTANA: Record<Pestana, React.ReactNode> = {
  nueva: <NuevaSolicitudPanel />,
  enviadas: <SolicitudesEnviadasPanel />,
  respuestas: (
    <EmptyState
      icono={Clock}
      titulo="Respuestas"
      descripcion="Las respuestas a tus solicitudes estarán disponibles próximamente."
    />
  ),
};

export default function EstudianteView() {
  const [pestana, setPestana] = useState<Pestana>('nueva');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Solicitudes" descripcion="Envía solicitudes y consulta su seguimiento." />

      <Tabs
        items={PESTANAS}
        valor={pestana}
        onCambiar={setPestana}
        etiqueta="Secciones de solicitudes"
        idBase="solicitudes"
      >
        {PANEL_POR_PESTANA[pestana]}
      </Tabs>
    </div>
  );
}
