import { Navigate, useParams } from 'react-router';
import { useEvaluacionFicha } from '../hooks/useEvaluacionFicha';
import { useResumenFicha } from '../hooks/useResumenFicha';
import DetalleFichaEstructura from './DetalleFichaEstructura';
import IniciarEvaluacionBoton from './representante/IniciarEvaluacionBoton';

export default function RepresentanteDetalleView() {
  const { id = '' } = useParams();
  const { resumen, search } = useResumenFicha(id);
  const { data: evaluaciones, isSuccess } = useEvaluacionFicha(id);

  if (!id) return <Navigate to="/fichas-perfil" replace />;

  const base = `/fichas-perfil/${id}`;
  const pestanas = [
    { id: 'items', etiqueta: 'Ítems', to: `${base}/items` },
    { id: 'estados', etiqueta: 'Estados', to: `${base}/estados` },
    { id: 'evaluaciones', etiqueta: 'Evaluaciones', to: `${base}/evaluaciones` },
  ];
  const sinEvaluacion = isSuccess && evaluaciones.length === 0;

  return (
    <DetalleFichaEstructura
      resumen={resumen}
      search={search}
      pestanas={pestanas}
      accion={sinEvaluacion ? <IniciarEvaluacionBoton fichaPerfilId={id} /> : undefined}
    />
  );
}
