import { Navigate, useNavigate, useParams } from 'react-router';
import { useHasRole } from '../../hooks/useHasRole';
import PageHeader from '../../shared/components/ui/PageHeader';
import { Rol } from '../../shared/models/rol';
import ConsultarEvaluacionesCuantitativasAsesor from './components/asesor/ConsultarEvaluacionesCuantitativasAsesor';
import { useEvaluacionesCuantitativasAsesor } from './hooks/useEvaluacionesCuantitativasAsesor';
import { useNavegacionCuantitativasAsesor } from './hooks/useNavegacionCuantitativasAsesor';

const ROLES_CONSULTAN = [Rol.Asesor];
const RAIZ = 'flex flex-col gap-6';
const TITULO = 'Evaluaciones cuantitativas realizadas';

export default function EvaluacionesCuantitativasAsesor() {
  const { evaluacionAsesorId = '' } = useParams();
  const esAsesor = useHasRole(ROLES_CONSULTAN);
  const navigate = useNavigate();
  const navegacion = useNavegacionCuantitativasAsesor(evaluacionAsesorId);
  const consulta = useEvaluacionesCuantitativasAsesor(evaluacionAsesorId);

  if (!esAsesor) return <Navigate to="/forbidden" replace />;

  const rutaListado = `/evaluaciones${navegacion?.search ?? ''}`;
  const resumen = navegacion?.resumen;
  const descripcion = resumen
    ? `${resumen.proyecto} · versión ${resumen.version}`
    : 'Consulta las valoraciones cuantitativas que registraste.';

  return (
    <div className={RAIZ}>
      <PageHeader
        titulo={TITULO}
        descripcion={descripcion}
        migas={[{ etiqueta: 'Evaluaciones', to: rutaListado }, { etiqueta: TITULO }]}
      />
      <ConsultarEvaluacionesCuantitativasAsesor
        consulta={consulta}
        etiquetaVolver="Volver a mis evaluaciones"
        onVolver={() => navigate(rutaListado)}
      />
    </div>
  );
}
