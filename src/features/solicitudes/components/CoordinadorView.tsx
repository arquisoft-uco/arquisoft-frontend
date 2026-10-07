import { useState } from 'react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import RespuestasEnviadasPanel from './coordinador/RespuestasEnviadasPanel';
import SolicitudesRecibidasPanel from './coordinador/SolicitudesRecibidasPanel';

type Pestana = 'recibidas' | 'respuestas-enviadas';

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'recibidas', etiqueta: 'Recibidas' },
  { id: 'respuestas-enviadas', etiqueta: 'Respuestas enviadas' },
];

const PANEL_POR_PESTANA: Record<Pestana, React.ReactNode> = {
  recibidas: <SolicitudesRecibidasPanel />,
  'respuestas-enviadas': <RespuestasEnviadasPanel />,
};

export default function CoordinadorView() {
  const [pestana, setPestana] = useState<Pestana>('recibidas');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Solicitudes"
        descripcion="Consulta las novedades que te han enviado y las respuestas que diste."
      />

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
