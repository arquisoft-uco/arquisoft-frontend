import { useState } from 'react';
import { Plus, type LucideIcon } from 'lucide-react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import NuevaSolicitudPanel from './estudiante/NuevaSolicitudPanel';
import RespuestasRecibidasPanel from './estudiante/RespuestasRecibidasPanel';
import SolicitudesEnviadasPanel from './estudiante/SolicitudesEnviadasPanel';

type Pestana = 'nueva' | 'enviadas' | 'respuestas';

const PESTANAS: { id: Pestana; etiqueta: string; icono?: LucideIcon }[] = [
  { id: 'nueva', etiqueta: 'Nueva solicitud', icono: Plus },
  { id: 'enviadas', etiqueta: 'Enviadas' },
  { id: 'respuestas', etiqueta: 'Respuestas' },
];

export default function EstudianteView() {
  const [pestana, setPestana] = useState<Pestana>('nueva');
  const [paginas, setPaginas] = useState<Record<Pestana, number>>({
    nueva: 0,
    enviadas: 0,
    respuestas: 0,
  });

  function irAPagina(destino: Pestana) {
    return (pagina: number) => setPaginas((actuales) => ({ ...actuales, [destino]: pagina }));
  }

  const panelPorPestana: Record<Pestana, React.ReactNode> = {
    nueva: <NuevaSolicitudPanel />,
    enviadas: <SolicitudesEnviadasPanel />,
    respuestas: (
      <RespuestasRecibidasPanel page={paginas.respuestas} onPageChange={irAPagina('respuestas')} />
    ),
  };

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
        {panelPorPestana[pestana]}
      </Tabs>
    </div>
  );
}
