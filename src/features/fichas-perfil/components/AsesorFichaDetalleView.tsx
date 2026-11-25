import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import RedirigirAlListado from '../../../shared/components/RedirigirAlListado';
import Button from '../../../shared/components/ui/Button';
import { useEvaluacionesFichaAsesor } from '../hooks/useEvaluacionesFichaAsesor';
import { useResumenFichaAsesor } from '../hooks/useResumenFichaAsesor';
import { fichaAdmiteEvaluacion } from '../utils/evaluacion-asistente';
import { admiteCambioDeEstado, bloqueoDeSalida } from '../utils/transiciones-estado-ficha';
import DetalleFichaEstructura from './DetalleFichaEstructura';

export default function AsesorFichaDetalleView() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { resumen, search } = useResumenFichaAsesor(id);
  const { data: evaluaciones } = useEvaluacionesFichaAsesor(
    id,
    fichaAdmiteEvaluacion(resumen?.estadoId),
  );

  if (!id) return <Navigate to="/fichas-perfil" replace />;
  if (!resumen) return <RedirigirAlListado destino="/fichas-perfil" />;

  const base = `/fichas-perfil/${id}`;
  const pestanas = [
    { id: 'items', etiqueta: 'Ítems', to: `${base}/items` },
    { id: 'revisiones', etiqueta: 'Revisiones', to: `${base}/revisiones` },
    { id: 'observaciones', etiqueta: 'Observaciones', to: `${base}/observaciones` },
    { id: 'estados', etiqueta: 'Estados', to: `${base}/estados` },
  ];

  const enEstados = pathname.startsWith(`${base}/estados`);
  const ofrecerCambio =
    !enEstados &&
    admiteCambioDeEstado(resumen.estadoId) &&
    !bloqueoDeSalida(resumen.estadoId, evaluaciones ?? []);

  return (
    <DetalleFichaEstructura
      resumen={resumen}
      search={search}
      pestanas={pestanas}
      accion={
        ofrecerCambio ? (
          <Button variante="secundario" onClick={() => navigate(`${base}/estados`)}>
            Cambiar estado
          </Button>
        ) : undefined
      }
    />
  );
}
