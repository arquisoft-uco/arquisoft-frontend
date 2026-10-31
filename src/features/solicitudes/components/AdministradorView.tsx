import { useState } from 'react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useFiltrosRespuestas } from '../hooks/useFiltrosRespuestas';
import RespuestasRegistroModificacionUsuariosEnviadasPanel from './administrador/RespuestasRegistroModificacionUsuariosEnviadasPanel';
import SolicitudesRegistroModificacionUsuariosRecibidasPanel from './administrador/SolicitudesRegistroModificacionUsuariosRecibidasPanel';

type Pestana = 'recibidas' | 'respuestas-enviadas';

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'recibidas', etiqueta: 'Recibidas' },
  { id: 'respuestas-enviadas', etiqueta: 'Respuestas enviadas' },
];

export default function AdministradorView() {
  const [pestana, setPestana] = useState<Pestana>('recibidas');
  const [paginaRecibidas, setPaginaRecibidas] = useState(0);
  const filtrosRespuestasEnviadas = useFiltrosRespuestas();

  const panelPorPestana: Record<Pestana, React.ReactNode> = {
    recibidas: (
      <SolicitudesRegistroModificacionUsuariosRecibidasPanel
        page={paginaRecibidas}
        onPageChange={setPaginaRecibidas}
      />
    ),
    'respuestas-enviadas': (
      <RespuestasRegistroModificacionUsuariosEnviadasPanel filtros={filtrosRespuestasEnviadas} />
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Solicitudes"
        descripcion="Consulta y responde las solicitudes de registro y modificación de usuarios que te enviaron los coordinadores, y revisa las respuestas que diste."
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
