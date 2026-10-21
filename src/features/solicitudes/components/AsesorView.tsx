import { useState } from 'react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useFiltrosRespuestas } from '../hooks/useFiltrosRespuestas';
import RespuestasEnviadasAsesorPanel from './asesor/RespuestasEnviadasAsesorPanel';
import SolicitudesRecibidasAsesorPanel from './asesor/SolicitudesRecibidasAsesorPanel';

type Pestana = 'recibidas' | 'respuestas-enviadas';

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'recibidas', etiqueta: 'Recibidas' },
  { id: 'respuestas-enviadas', etiqueta: 'Respuestas enviadas' },
];

export default function AsesorView() {
  const [pestana, setPestana] = useState<Pestana>('recibidas');
  const [paginaRecibidas, setPaginaRecibidas] = useState(0);
  const filtrosRespuestasEnviadas = useFiltrosRespuestas();

  const panelPorPestana: Record<Pestana, React.ReactNode> = {
    recibidas: (
      <SolicitudesRecibidasAsesorPanel page={paginaRecibidas} onPageChange={setPaginaRecibidas} />
    ),
    'respuestas-enviadas': <RespuestasEnviadasAsesorPanel filtros={filtrosRespuestasEnviadas} />,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Solicitudes"
        descripcion="Consulta y responde las novedades que te enviaron los estudiantes, y revisa las respuestas que diste."
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
