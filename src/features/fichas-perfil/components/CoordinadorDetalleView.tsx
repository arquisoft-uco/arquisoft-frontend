import { Navigate, useParams } from 'react-router';
import { useResumenFichaCoordinador } from '../hooks/useResumenFichaCoordinador';
import { admiteDecision } from '../utils/decision-ficha';
import AccionesFichaCoordinador from './coordinador/AccionesFichaCoordinador';
import DecisionFichaPanel from './coordinador/DecisionFichaPanel';
import DetalleFichaEstructura from './DetalleFichaEstructura';

export default function CoordinadorDetalleView() {
  const { id = '' } = useParams();
  const { resumen, search, registrarAsesorNuevo } = useResumenFichaCoordinador(id);

  if (!id) return <Navigate to="/fichas-perfil" replace />;

  const pestanas = [
    { id: 'items', etiqueta: 'Ítems', to: `/fichas-perfil/${id}/items` },
    { id: 'estados', etiqueta: 'Estados', to: `/fichas-perfil/${id}/estados` },
    { id: 'evaluaciones', etiqueta: 'Evaluaciones', to: `/fichas-perfil/${id}/evaluaciones` },
  ];

  return (
    <DetalleFichaEstructura
      resumen={resumen}
      search={search}
      pestanas={pestanas}
      decision={
        resumen && admiteDecision(resumen.estadoId) ? (
          <DecisionFichaPanel fichaPerfilId={resumen.id} />
        ) : undefined
      }
      accion={
        resumen ? (
          <AccionesFichaCoordinador resumen={resumen} onAsesorCambiado={registrarAsesorNuevo} />
        ) : undefined
      }
    />
  );
}
