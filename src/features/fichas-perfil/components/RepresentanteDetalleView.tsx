import { Navigate, useLocation, useParams } from 'react-router';
import RedirigirAlListado from '../../../shared/components/RedirigirAlListado';
import { TTL_CONTEXTO_CORTO_MS } from '../../../shared/utils/contexto-temporal';
import { useEvaluacionFicha } from '../hooks/useEvaluacionFicha';
import { useResumenFichaRepresentante } from '../hooks/useResumenFichaRepresentante';
import {
  accionesEvaluacionRepresentante,
  evaluacionVigente,
  fichaAdmiteEvaluacion,
} from '../utils/evaluacion-asistente';
import DetalleFichaEstructura from './DetalleFichaEstructura';
import DescartarEvaluacionBoton from './representante/DescartarEvaluacionBoton';
import EvaluarFichaBoton from './representante/EvaluarFichaBoton';
import IniciarEvaluacionBoton from './representante/IniciarEvaluacionBoton';

export default function RepresentanteDetalleView() {
  const { id = '' } = useParams();
  const { pathname } = useLocation();
  const { resumen, search } = useResumenFichaRepresentante(id, TTL_CONTEXTO_CORTO_MS);
  const { data: evaluaciones, isSuccess } = useEvaluacionFicha(id);

  if (!id) return <Navigate to="/fichas-perfil" replace />;
  if (!resumen) return <RedirigirAlListado destino="/fichas-perfil" />;

  const base = `/fichas-perfil/${id}`;
  const pestanas = [
    { id: 'items', etiqueta: 'Ítems', to: `${base}/items` },
    { id: 'estados', etiqueta: 'Estados', to: `${base}/estados` },
    { id: 'evaluaciones', etiqueta: 'Evaluaciones', to: `${base}/evaluaciones` },
  ];
  const vigente = isSuccess ? evaluacionVigente(evaluaciones) : undefined;
  const fueraDeEvaluaciones = !pathname.startsWith(`${base}/evaluaciones`);

  let accion;
  if (isSuccess) {
    const acciones = accionesEvaluacionRepresentante({
      vigente,
      fichaDisponible: fichaAdmiteEvaluacion(resumen.estadoId),
    });
    const principal = fueraDeEvaluaciones ? acciones.principal : null;
    if (principal || (acciones.puedeDescartar && vigente)) {
      accion = (
        <>
          {principal === 'iniciar' && <IniciarEvaluacionBoton fichaPerfilId={id} />}
          {principal === 'reanudar' && (
            <IniciarEvaluacionBoton fichaPerfilId={id} modo="reanudar" />
          )}
          {principal === 'evaluar' && <EvaluarFichaBoton fichaPerfilId={id} />}
          {acciones.puedeDescartar && vigente && (
            <DescartarEvaluacionBoton fichaPerfilId={id} evaluacionId={vigente.id} />
          )}
        </>
      );
    }
  }

  return (
    <DetalleFichaEstructura resumen={resumen} search={search} pestanas={pestanas} accion={accion} />
  );
}
