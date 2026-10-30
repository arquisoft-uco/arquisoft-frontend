import { useState } from 'react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useFiltrosRespuestas, type FiltrosRespuestas } from '../hooks/useFiltrosRespuestas';
import RespuestasEnviadasPorTipoPanel from './coordinador/RespuestasEnviadasPorTipoPanel';
import RecibidasPanel from './coordinador/RecibidasPanel';
import type {
  TipoRespuestaEnviadaCoordinadorUi,
  TipoSolicitudRecibidaUi,
} from './SelectorTipoSolicitud';

type Pestana = 'recibidas' | 'respuestas-enviadas';

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'recibidas', etiqueta: 'Recibidas' },
  { id: 'respuestas-enviadas', etiqueta: 'Respuestas enviadas' },
];

export default function CoordinadorView() {
  const [pestana, setPestana] = useState<Pestana>('recibidas');
  const [paginasRecibidas, setPaginasRecibidas] = useState<Record<TipoSolicitudRecibidaUi, number>>(
    {
      novedad: 0,
      'cambio-asesor': 0,
      'ampliacion-plazo': 0,
    },
  );
  const filtrosRespuestasEnviadas: Record<TipoRespuestaEnviadaCoordinadorUi, FiltrosRespuestas> = {
    novedad: useFiltrosRespuestas(),
    'cambio-asesor': useFiltrosRespuestas(),
    'ampliacion-plazo': useFiltrosRespuestas(),
  };

  const panelPorPestana: Record<Pestana, React.ReactNode> = {
    recibidas: (
      <RecibidasPanel
        paginas={paginasRecibidas}
        onPageChange={(tipo, page) =>
          setPaginasRecibidas((actuales) => ({ ...actuales, [tipo]: page }))
        }
      />
    ),
    'respuestas-enviadas': <RespuestasEnviadasPorTipoPanel filtros={filtrosRespuestasEnviadas} />,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Solicitudes"
        descripcion="Consulta y responde las solicitudes que te han enviado, y revisa las respuestas que diste."
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
