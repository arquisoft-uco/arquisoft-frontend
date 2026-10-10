import { Navigate, useParams } from 'react-router';
import { useResumenFicha } from '../hooks/useResumenFicha';
import DetalleFichaEstructura from './DetalleFichaEstructura';

export default function CoordinadorDetalleView() {
  const { id = '' } = useParams();
  const { resumen, search } = useResumenFicha(id);

  if (!id) return <Navigate to="/fichas-perfil" replace />;

  const pestanas = [
    { id: 'evaluaciones', etiqueta: 'Evaluaciones', to: `/fichas-perfil/${id}/evaluaciones` },
  ];

  return <DetalleFichaEstructura resumen={resumen} search={search} pestanas={pestanas} />;
}
