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

export default function CoordinadorView() {
  const [pestana, setPestana] = useState<Pestana>('recibidas');
  const [paginas, setPaginas] = useState<Record<Pestana, number>>({
    recibidas: 0,
    'respuestas-enviadas': 0,
  });

  function irAPagina(destino: Pestana) {
    return (pagina: number) => setPaginas((actuales) => ({ ...actuales, [destino]: pagina }));
  }

  const panelPorPestana: Record<Pestana, React.ReactNode> = {
    recibidas: (
      <SolicitudesRecibidasPanel page={paginas.recibidas} onPageChange={irAPagina('recibidas')} />
    ),
    'respuestas-enviadas': (
      <RespuestasEnviadasPanel
        page={paginas['respuestas-enviadas']}
        onPageChange={irAPagina('respuestas-enviadas')}
      />
    ),
  };

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
        {panelPorPestana[pestana]}
      </Tabs>
    </div>
  );
}
