import { Navigate, useParams } from 'react-router';
import { useResumenFichaCoordinador } from '../hooks/useResumenFichaCoordinador';
import AccionesFichaCoordinador from './coordinador/AccionesFichaCoordinador';
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
      accion={
        resumen ? (
          <AccionesFichaCoordinador resumen={resumen} onAsesorCambiado={registrarAsesorNuevo} />
        ) : undefined
      }
    />
  );
}
