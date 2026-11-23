import { Navigate, useLocation, useParams } from 'react-router';
import { useEvaluacionFicha } from '../hooks/useEvaluacionFicha';
import { useResumenFicha } from '../hooks/useResumenFicha';
import { evaluacionEnEstadoFinal } from '../utils/evaluacion-asistente';
import DetalleFichaEstructura from './DetalleFichaEstructura';
import EvaluarFichaBoton from './representante/EvaluarFichaBoton';
import IniciarEvaluacionBoton from './representante/IniciarEvaluacionBoton';

export default function RepresentanteDetalleView() {
  const { id = '' } = useParams();
  const { pathname } = useLocation();
  const { resumen, search } = useResumenFicha(id);
  const { data: evaluaciones, isSuccess } = useEvaluacionFicha(id);

  if (!id) return <Navigate to="/fichas-perfil" replace />;

  const base = `/fichas-perfil/${id}`;
  const pestanas = [
    { id: 'items', etiqueta: 'Ítems', to: `${base}/items` },
    { id: 'estados', etiqueta: 'Estados', to: `${base}/estados` },
    { id: 'evaluaciones', etiqueta: 'Evaluaciones', to: `${base}/evaluaciones` },
  ];
  const vigente = isSuccess ? evaluaciones[evaluaciones.length - 1] : undefined;
  const fueraDeEvaluaciones = !pathname.startsWith(`${base}/evaluaciones`);

  let accion;
  if (isSuccess && fueraDeEvaluaciones) {
    if (!vigente) accion = <IniciarEvaluacionBoton fichaPerfilId={id} />;
    else if (!evaluacionEnEstadoFinal(vigente)) accion = <EvaluarFichaBoton fichaPerfilId={id} />;
  }

  return (
    <DetalleFichaEstructura resumen={resumen} search={search} pestanas={pestanas} accion={accion} />
  );
}
