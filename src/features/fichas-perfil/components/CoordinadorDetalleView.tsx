import { Navigate, useParams } from 'react-router';
import RedirigirAlListado from '../../../shared/components/RedirigirAlListado';
import { useResumenFichaCoordinador } from '../hooks/useResumenFichaCoordinador';
import { admiteDecision } from '../utils/decision-ficha';
import AccionesFichaCoordinador from './coordinador/AccionesFichaCoordinador';
import DecisionFichaPanel from './coordinador/DecisionFichaPanel';
import DetalleFichaEstructura from './DetalleFichaEstructura';

export default function CoordinadorDetalleView() {
  const { id = '' } = useParams();
  const { resumen, search, origen, registrarAsesorNuevo } = useResumenFichaCoordinador(id);

  if (!id) return <Navigate to="/fichas-perfil" replace />;
  if (!resumen) return <RedirigirAlListado destino="/fichas-perfil" />;

  const pestanas = [
    { id: 'items', etiqueta: 'Ítems', to: `/fichas-perfil/${id}/items` },
    { id: 'estados', etiqueta: 'Estados', to: `/fichas-perfil/${id}/estados` },
    { id: 'evaluaciones', etiqueta: 'Evaluaciones', to: `/fichas-perfil/${id}/evaluaciones` },
  ];

  return (
    <DetalleFichaEstructura
      resumen={resumen}
      search={search}
      origen={origen}
      pestanas={pestanas}
      decision={
        admiteDecision(resumen.estadoId) ? (
          <DecisionFichaPanel fichaPerfilId={resumen.id} />
        ) : undefined
      }
      accion={
        <AccionesFichaCoordinador resumen={resumen} onAsesorCambiado={registrarAsesorNuevo} />
      }
    />
  );
}
