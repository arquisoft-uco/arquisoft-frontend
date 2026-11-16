import { Navigate, useNavigate, useParams } from 'react-router';
import { useHasRole } from '../../hooks/useHasRole';
import PageHeader from '../../shared/components/ui/PageHeader';
import { Rol } from '../../shared/models/rol';
import ConsultarInformacionEvaluacionAsesor from './components/asesor/ConsultarInformacionEvaluacionAsesor';
import { useEvaluacionAsesorRealizada } from './hooks/useEvaluacionAsesorRealizada';
import { useNavegacionCualitativasAsesor } from './hooks/useNavegacionCualitativasAsesor';

const ROLES_CONSULTAN = [Rol.Asesor];
const RAIZ = 'flex flex-col gap-6';
const TITULO = 'Información de la evaluación';

export default function InformacionEvaluacionAsesor() {
  const { evaluacionAsesorId = '' } = useParams();
  const esAsesor = useHasRole(ROLES_CONSULTAN);
  const navigate = useNavigate();
  const navegacion = useNavegacionCualitativasAsesor(evaluacionAsesorId);
  const consulta = useEvaluacionAsesorRealizada(evaluacionAsesorId);

  if (!esAsesor) return <Navigate to="/forbidden" replace />;

  const rutaListado = `/evaluaciones${navegacion?.search ?? ''}`;
  const entregable = navegacion?.resumen ?? consulta.data?.evaluacion.entregable;
  const descripcion = entregable
    ? `${entregable.proyecto} · versión ${entregable.version}`
    : 'Consulta la información de esta evaluación.';

  return (
    <div className={RAIZ}>
      <PageHeader
        titulo={TITULO}
        descripcion={descripcion}
        migas={[{ etiqueta: 'Evaluaciones', to: rutaListado }, { etiqueta: TITULO }]}
      />
      <ConsultarInformacionEvaluacionAsesor
        consulta={consulta}
        etiquetaVolver="Volver a mis evaluaciones"
        onVolver={() => navigate(rutaListado)}
      />
    </div>
  );
}
